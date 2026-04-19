import { listDueEmailJobs, markEmailJobStatus } from "./db";

const MAX_RETRIES = 5;
const BASE_RETRY_MINUTES = 10;
const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim() || "DeepSleepReset <onboarding@resend.dev>";

function isConnResetError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message ?? "";
  const causeMessage =
    typeof error.cause === "object" && error.cause && "message" in error.cause
      ? String((error.cause as { message?: string }).message ?? "")
      : "";

  return message.includes("ECONNRESET") || causeMessage.includes("ECONNRESET") || message.includes("Connect Timeout");
}

function getRetryDate(retryCount: number) {
  const minutes = BASE_RETRY_MINUTES * Math.max(1, retryCount);
  return new Date(Date.now() + minutes * 60 * 1000);
}

async function sendEmailJob(job: Awaited<ReturnType<typeof listDueEmailJobs>>[number]) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing");
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: DEFAULT_FROM_EMAIL,
      to: [job.email],
      subject: job.subject,
      text: job.body,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend send failed (${response.status}): ${body}`);
  }
}

export async function processPendingEmailJobs() {
  let jobs: Awaited<ReturnType<typeof listDueEmailJobs>> = [];

  try {
    jobs = await listDueEmailJobs();
  } catch (error) {
    if (isConnResetError(error)) {
      console.warn("[EmailScheduler] Database temporarily unavailable while loading due jobs. Will retry on next loop.");
      return;
    }

    console.error("[EmailScheduler] Failed to load due email jobs:", error);
    return;
  }

  for (const job of jobs) {
    try {
      await markEmailJobStatus({
        id: job.id,
        status: "processing",
        retryCount: job.retryCount,
        lastError: null,
      });

      await sendEmailJob(job);
      await markEmailJobStatus({
        id: job.id,
        status: "sent",
        retryCount: job.retryCount,
        lastError: null,
      });
    } catch (error) {
      const nextRetryCount = job.retryCount + 1;
      const retryable = isConnResetError(error) && nextRetryCount <= MAX_RETRIES;

      try {
        await markEmailJobStatus({
          id: job.id,
          status: "failed",
          retryCount: nextRetryCount,
          nextAttemptAt: retryable ? getRetryDate(nextRetryCount) : undefined,
          lastError: error instanceof Error ? error.message : "Unknown email scheduler error",
        });
      } catch (statusError) {
        if (isConnResetError(statusError)) {
          console.warn(`[EmailScheduler] Could not update job ${job.id} after transient connection reset. The job will be retried on the next scheduler loop.`);
          continue;
        }

        console.error(`[EmailScheduler] Failed to persist status for job ${job.id}:`, statusError);
        continue;
      }

      if (!retryable) {
        console.error("[EmailScheduler] Non-retryable email failure:", error);
      }
    }
  }
}
