/**
 * Milestone Notifier
 * Sends email notifications to the owner (petr.matej@gmail.com)
 * when sales milestones are reached:
 *   - 1st sale (FIRST SALE!)
 *   - Each of the first 10 sales (#2 through #10)
 *   - 100th sale
 */

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const OWNER_EMAIL = "petr.matej@gmail.com";
const OWNER_NAME = "Petr";
const FROM_EMAIL = "support@deepsleepreset.com";
const FROM_NAME = "Deep Sleep Reset";

// Milestones that trigger notifications
const MILESTONE_COUNTS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100]);

interface SaleInfo {
  product: string;
  amount: string;
  email?: string | null;
  chronotype?: string | null;
}

async function sendMilestoneEmail(
  totalOrders: number,
  saleInfo: SaleInfo
): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;

  const productLabels: Record<string, string> = {
    tripwire: "7-Night Deep Sleep Reset ($1)",
    oto1: "30-Day Sleep Transformation ($5)",
    oto2: "Chronotype Mastery Pack ($12)",
    oto3: "Deep Sleep Toolkit ($19)",
    frontEnd: "Main Product",
  };

  const productLabel = productLabels[saleInfo.product] || saleInfo.product;
  const customerEmail = saleInfo.email || "unknown";
  const chronotype = saleInfo.chronotype ? ` (${saleInfo.chronotype})` : "";

  let subject: string;
  let emoji: string;
  let headline: string;

  if (totalOrders === 1) {
    emoji = "🎉";
    subject = "🎉 PRVNÍ PRODEJ! Deep Sleep Reset je live!";
    headline = "PRVNÍ PRODEJ! Gratulace, funguje to!";
  } else if (totalOrders === 100) {
    emoji = "🚀";
    subject = "🚀 100 PRODEJŮ! Milestone dosažen!";
    headline = "100 PRODEJŮ! Neuvěřitelné!";
  } else {
    emoji = "💰";
    subject = `${emoji} Prodej #${totalOrders} — Deep Sleep Reset`;
    headline = `Prodej #${totalOrders} z prvních 10!`;
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #0a0a1a; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 12px; padding: 32px; border: 1px solid #2d2d4e; }
    .header { text-align: center; margin-bottom: 32px; }
    .emoji { font-size: 64px; display: block; margin-bottom: 16px; }
    h1 { color: #f59e0b; font-size: 28px; margin: 0 0 8px; }
    .subtitle { color: #94a3b8; font-size: 16px; }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
    .stat-card { background: #0f0f1f; border-radius: 8px; padding: 16px; border: 1px solid #2d2d4e; }
    .stat-label { color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .stat-value { color: #f59e0b; font-size: 20px; font-weight: bold; }
    .footer { text-align: center; margin-top: 32px; color: #475569; font-size: 12px; }
    .cta { display: inline-block; background: #f59e0b; color: #0a0a1a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px; }
    .milestone-bar { background: #0f0f1f; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #f59e0b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="emoji">${emoji}</span>
      <h1>${headline}</h1>
      <p class="subtitle">deepsleep.quest je v akci!</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Prodej #</div>
        <div class="stat-value">#${totalOrders}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Produkt</div>
        <div class="stat-value" style="font-size: 14px;">${productLabel}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Zákazník</div>
        <div class="stat-value" style="font-size: 14px;">${customerEmail}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Chronotyp</div>
        <div class="stat-value" style="font-size: 14px;">${chronotype || "N/A"}</div>
      </div>
    </div>

    ${totalOrders <= 10 ? `
    <div class="milestone-bar">
      <strong style="color: #f59e0b;">Postup k prvním 10 prodejům:</strong>
      <div style="margin-top: 8px; background: #1a1a2e; border-radius: 4px; height: 8px;">
        <div style="background: #f59e0b; width: ${Math.min(totalOrders * 10, 100)}%; height: 8px; border-radius: 4px;"></div>
      </div>
      <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">${totalOrders}/10 prodejů</div>
    </div>
    ` : ""}

    ${totalOrders === 1 ? `
    <div class="milestone-bar" style="border-left-color: #10b981;">
      <strong style="color: #10b981;">🌟 Toto je historický moment!</strong><br>
      <span style="color: #94a3b8; font-size: 14px;">Tvůj první zákazník důvěřuje tvému produktu. Teď je čas škálovat!</span>
    </div>
    ` : ""}

    ${totalOrders === 100 ? `
    <div class="milestone-bar" style="border-left-color: #8b5cf6;">
      <strong style="color: #8b5cf6;">🏆 100 PRODEJŮ = PROOF OF CONCEPT!</strong><br>
      <span style="color: #94a3b8; font-size: 14px;">Čas investovat do paid traffic a škálovat na 1000+ prodejů!</span>
    </div>
    ` : ""}

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://deepsleepquest.manus.space/admin" class="cta">Zobrazit Admin Dashboard →</a>
    </div>

    <div class="footer">
      <p>Deep Sleep Reset — deepsleep.quest</p>
      <p>Tuto notifikaci dostáváš protože jsi vlastník projektu.</p>
    </div>
  </div>
</body>
</html>
  `;

  const textContent = `${headline}\n\nProdej #${totalOrders}\nProdukt: ${productLabel}\nZákazník: ${customerEmail}${chronotype}\n\nAdmin: https://deepsleepquest.manus.space/admin`;

  if (!apiKey) {
    console.log(`[Milestone] ${subject} — BREVO_API_KEY not set, logging only`);
    console.log(`[Milestone] To: ${OWNER_EMAIL}`);
    console.log(`[Milestone] ${textContent}`);
    return;
  }

  try {
    const payload = {
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: OWNER_EMAIL, name: OWNER_NAME }],
      subject,
      htmlContent,
      textContent,
    };

    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Milestone] Email send failed: ${response.status} ${errorText}`);
    } else {
      console.log(`[Milestone] ✅ Email sent: ${subject}`);
    }
  } catch (err) {
    console.error("[Milestone] Email send error:", err);
  }
}

/**
 * Check if a milestone was reached and send notification.
 * Call this after every new sale is recorded.
 *
 * @param totalOrdersAfter - total number of paid orders AFTER this sale
 * @param saleInfo - details about the sale
 */
export async function checkAndNotifyMilestone(
  totalOrdersAfter: number,
  saleInfo: SaleInfo
): Promise<void> {
  if (MILESTONE_COUNTS.has(totalOrdersAfter)) {
    // Fire and forget — don't block the response
    sendMilestoneEmail(totalOrdersAfter, saleInfo).catch((err) => {
      console.error("[Milestone] Notification failed:", err);
    });
  }
}

/**
 * Get current total paid orders count from DB and check milestone.
 * Convenience wrapper that queries the DB itself.
 */
export async function notifyMilestoneAfterSale(
  db: Awaited<ReturnType<typeof import("./db").getDb>>,
  saleInfo: SaleInfo
): Promise<void> {
  if (!db) return;
  try {
    const { sql } = await import("drizzle-orm");
    const rows = await db.execute(
      sql`SELECT COUNT(*) as count FROM orders WHERE status = 'paid'`
    ) as unknown as Array<{ count: string }>;
    const totalOrders = parseInt(rows[0]?.count || "0", 10);
    await checkAndNotifyMilestone(totalOrders, saleInfo);
  } catch (err) {
    console.error("[Milestone] Failed to query order count:", err);
  }
}
