import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("RESEND_API_KEY", () => {
  it("authenticates against the Resend API", async () => {
    const apiKey = process.env.RESEND_API_KEY;

    expect(apiKey).toBeTruthy();

    const { stdout } = await execFileAsync("curl", [
      "-sS",
      "--max-time",
      "20",
      "-H",
      `Authorization: Bearer ${apiKey}`,
      "https://api.resend.com/api-keys?limit=1",
    ]);

    const payload = JSON.parse(stdout) as {
      data?: Array<{ id: string; name: string }>;
      statusCode?: number;
      message?: string;
      name?: string;
    };

    expect(Array.isArray(payload.data)).toBe(true);
    expect((payload.data?.length ?? 0) >= 1).toBe(true);
  }, 30000);
});
