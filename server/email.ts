/**
 * Email Automation Module
 * Uses Brevo (Sendinblue) API for transactional emails.
 * Falls back to console logging if BREVO_API_KEY is not configured.
 *
 * Email sequences:
 * 1. Welcome email after front-end purchase (frontEnd / exitDiscount)
 * 2. Upsell 1 confirmation email
 * 3. Upsell 2 confirmation email
 */

import type { ProductKey } from "./stripe/products";

interface SendEmailOptions {
  to: string;
  name?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

interface PurchaseEmailOptions {
  to: string;
  name?: string;
  productKey: ProductKey;
  amountCents: number;
}

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const FROM_EMAIL = "support@deepsleepreset.com";
const FROM_NAME = "Deep Sleep Reset";

async function sendEmail(options: SendEmailOptions): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    // Log email content for development / when API key not configured
    console.log("[Email] BREVO_API_KEY not configured — logging email instead:");
    console.log(`  To: ${options.to}`);
    console.log(`  Subject: ${options.subject}`);
    console.log(`  Content preview: ${options.textContent?.slice(0, 200) || "(html only)"}`);
    return;
  }

  const payload = {
    sender: { name: FROM_NAME, email: FROM_EMAIL },
    to: [{ email: options.to, name: options.name || options.to }],
    subject: options.subject,
    htmlContent: options.htmlContent,
    textContent: options.textContent,
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
    const detail = await response.text().catch(() => "");
    throw new Error(`Brevo API error ${response.status}: ${detail}`);
  }

  console.log(`[Email] Sent "${options.subject}" to ${options.to}`);
}

function buildWelcomeEmail(name: string | undefined, productKey: ProductKey, amountCents: number): SendEmailOptions {
  const firstName = name?.split(" ")[0] || "there";
  const amount = `$${(amountCents / 100).toFixed(2)}`;

  const isCore = productKey === "frontEnd" || productKey === "exitDiscount";
  const isUpsell1 = productKey === "upsell1";
  const isUpsell2 = productKey === "upsell2";

  let subject: string;
  let productName: string;
  let nextSteps: string;

  if (isCore) {
    subject = "🌙 Your 7-Night Deep Sleep Reset — Access Inside";
    productName = "7-Night Deep Sleep Reset";
    nextSteps = `
      <p>Here's what to do right now:</p>
      <ol>
        <li><strong>Start with Night 1 tonight</strong> — "The Sleep Pressure Reset". It takes just 15 minutes before bed.</li>
        <li>Each night builds on the last, so follow them in order.</li>
        <li>By Night 4, most people notice a significant difference.</li>
      </ol>
      <p>Access your program here: <a href="https://deepsleepreset.manus.space" style="color:#d4a853;">deepsleepreset.manus.space</a></p>
    `;
  } else if (isUpsell1) {
    subject = "🎧 Your Anxiety Dissolve Audio Pack — Access Inside";
    productName = "Anxiety Dissolve Audio Pack";
    nextSteps = `
      <p>Your 5 guided audio sessions are ready:</p>
      <ul>
        <li>The Cortisol Crash (21 min) — for high-stress days</li>
        <li>The Midnight Rescue (12 min) — when you wake at 3 AM</li>
        <li>The Dawn Reset (8 min) — for early morning anxiety</li>
        <li>The Deep Dive (35 min) — for profound relaxation</li>
        <li>The Power Nap Protocol (20 min) — for daytime recovery</li>
      </ul>
      <p>Access your audios: <a href="https://deepsleepreset.manus.space" style="color:#d4a853;">deepsleepreset.manus.space</a></p>
    `;
  } else {
    subject = "📊 Your Sleep Optimizer Toolkit — Access Inside";
    productName = "Sleep Optimizer Toolkit";
    nextSteps = `
      <p>Your 4-piece toolkit is ready:</p>
      <ul>
        <li>Printable "Sleep Score" Daily Tracker</li>
        <li>"Bedroom Audit" Checklist (17 factors)</li>
        <li>Evidence-Based Supplement Guide</li>
        <li>"Screen Detox" Protocol</li>
      </ul>
      <p>Access your toolkit: <a href="https://deepsleepreset.manus.space" style="color:#d4a853;">deepsleepreset.manus.space</a></p>
    `;
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: Georgia, serif; background: #0a0e1a; color: #f0ece4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; border-bottom: 1px solid #1e2535; padding-bottom: 24px; margin-bottom: 32px; }
    .logo { color: #d4a853; font-size: 20px; font-weight: bold; letter-spacing: 0.05em; }
    h1 { color: #f0ece4; font-size: 28px; line-height: 1.3; margin: 0 0 16px; }
    .highlight { color: #d4a853; }
    p { color: #b8b0a8; line-height: 1.7; margin: 0 0 16px; }
    ol, ul { color: #b8b0a8; line-height: 2; padding-left: 20px; }
    .cta-button { display: inline-block; background: #d4a853; color: #0a0e1a; font-weight: bold; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin: 24px 0; font-size: 16px; }
    .footer { border-top: 1px solid #1e2535; padding-top: 24px; margin-top: 40px; text-align: center; }
    .footer p { color: #4a5568; font-size: 12px; }
    a { color: #d4a853; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌙 Deep Sleep Reset</div>
    </div>

    <h1>Hey ${firstName}, <span class="highlight">you're in.</span></h1>

    <p>Your purchase of the <strong>${productName}</strong> (${amount}) is confirmed. Welcome to the other side of sleepless nights.</p>

    ${nextSteps}

    <p>If you have any questions, just reply to this email — I personally read every message.</p>

    <p style="color:#d4a853; font-style: italic;">Tonight, you sleep.</p>

    <p>— The Deep Sleep Reset Team</p>

    <div class="footer">
      <p>You're receiving this because you purchased from Deep Sleep Reset.</p>
      <p>© ${new Date().getFullYear()} Deep Sleep Reset. All rights reserved.</p>
      <p><a href="https://deepsleepreset.manus.space/privacy">Privacy Policy</a> | <a href="mailto:support@deepsleepreset.com">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const textContent = `
Hey ${firstName},

Your purchase of ${productName} (${amount}) is confirmed.

${isCore ? `Start with Night 1 tonight — "The Sleep Pressure Reset". Access your program at: https://deepsleepreset.manus.space` : `Access your content at: https://deepsleepreset.manus.space`}

Tonight, you sleep.
— The Deep Sleep Reset Team

© ${new Date().getFullYear()} Deep Sleep Reset
  `.trim();

  return { to: "", subject, htmlContent, textContent };
}

export async function sendPurchaseEmail(options: PurchaseEmailOptions): Promise<void> {
  const emailData = buildWelcomeEmail(options.name, options.productKey, options.amountCents);
  await sendEmail({
    ...emailData,
    to: options.to,
    name: options.name,
  });
}

// ─── Admin Sale Notification ─────────────────────────────────────────────────

interface SaleNotificationOptions {
  customerEmail: string | null;
  customerName: string | null;
  productLabel: string;
  amountCents: number;
  currency: string;
  totalRevenueCents: number;
  totalOrders: number;
}

export async function sendSaleNotificationEmail(opts: SaleNotificationOptions): Promise<void> {
  const amount = `$${(opts.amountCents / 100).toFixed(2)} ${opts.currency.toUpperCase()}`;
  const totalRevenue = `$${(opts.totalRevenueCents / 100).toFixed(2)}`;
  const avgOrder = opts.totalOrders > 0
    ? `$${(opts.totalRevenueCents / opts.totalOrders / 100).toFixed(2)}`
    : "—";

  const subject = `🎉 PRODEJ! ${opts.productLabel} — ${amount}`;

  const htmlContent = `
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0a0e1a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0e1a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:16px;overflow:hidden;border:1px solid #1f2937;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1f35 0%,#0f172a 100%);padding:40px 40px 30px;text-align:center;border-bottom:2px solid #d4a853;">
              <div style="font-size:48px;margin-bottom:12px;">🎉</div>
              <h1 style="margin:0;color:#d4a853;font-size:28px;font-weight:700;letter-spacing:1px;">NOVÝ PRODEJ!</h1>
              <p style="margin:8px 0 0;color:#9ca3af;font-size:14px;letter-spacing:2px;text-transform:uppercase;">Deep Sleep Reset</p>
            </td>
          </tr>

          <!-- Sale Details -->
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 0 24px;">
                    <div style="background:#1f2937;border-radius:12px;padding:24px;border-left:4px solid #d4a853;">
                      <p style="margin:0 0 8px;color:#9ca3af;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Produkt</p>
                      <p style="margin:0;color:#f9fafb;font-size:18px;font-weight:600;">${opts.productLabel}</p>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="48%" style="padding-right:8px;">
                          <div style="background:#1f2937;border-radius:12px;padding:20px;text-align:center;">
                            <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Tato objednávka</p>
                            <p style="margin:0;color:#d4a853;font-size:28px;font-weight:700;">${amount}</p>
                          </div>
                        </td>
                        <td width="4%"></td>
                        <td width="48%" style="padding-left:8px;">
                          <div style="background:#1f2937;border-radius:12px;padding:20px;text-align:center;">
                            <p style="margin:0 0 4px;color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Zákazník</p>
                            <p style="margin:0;color:#f9fafb;font-size:14px;font-weight:500;">${opts.customerName || "Neznámý"}</p>
                            <p style="margin:4px 0 0;color:#6b7280;font-size:12px;">${opts.customerEmail || "—"}</p>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Total Revenue Banner -->
          <tr>
            <td style="padding:0 40px 32px;">
              <div style="background:linear-gradient(135deg,#1a2744 0%,#0f1f3d 100%);border-radius:16px;padding:28px;text-align:center;border:1px solid #2d4a8a;">
                <p style="margin:0 0 6px;color:#93c5fd;font-size:12px;text-transform:uppercase;letter-spacing:2px;">💰 CELKOVÝ ZISK ZE VŠECH OBJEDNÁVEK</p>
                <p style="margin:0;color:#60a5fa;font-size:42px;font-weight:800;letter-spacing:-1px;">${totalRevenue}</p>
                <p style="margin:8px 0 0;color:#6b7280;font-size:13px;">${opts.totalOrders} objednávek celkem &nbsp;·&nbsp; průměr ${avgOrder} / objednávka</p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0d1117;padding:20px 40px;text-align:center;border-top:1px solid #1f2937;">
              <p style="margin:0;color:#4b5563;font-size:12px;">Deep Sleep Reset — Admin Notifikace</p>
              <p style="margin:4px 0 0;color:#374151;font-size:11px;">Tato zpráva je určena pouze pro tebe jako vlastníka.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const textContent = `
🎉 NOVÝ PRODEJ — Deep Sleep Reset

Produkt: ${opts.productLabel}
Zákazník: ${opts.customerName || "Neznámý"} (${opts.customerEmail || "—"})
Tato objednávka: ${amount}

💰 CELKOVÝ ZISK ZE VŠECH OBJEDNÁVEK: ${totalRevenue}
(${opts.totalOrders} objednávek · průměr ${avgOrder} / objednávka)
  `.trim();

  await sendEmail({
    to: "petr.matej@gmail.com",
    name: "Petr",
    subject,
    htmlContent,
    textContent,
  });
}
