// Email automation service using Brevo (Sendinblue) API
// Handles: purchase confirmation, download delivery, 7-day follow-up sequence

const BREVO_API_URL = "https://api.brevo.com/v3";
const SENDER = { name: "Deep Sleep Reset", email: "petr.matej@gmail.com" };

const PRODUCT_DOWNLOADS: Record<string, { name: string; url: string }> = {
  tripwire: {
    name: "7-Night Deep Sleep Reset",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/89740521/oMP8CH8vmujDrxr428gHAC/tripwire-7night-reset_2a20e100.pdf",
  },
  oto1: {
    name: "30-Day Sleep Transformation Program",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/89740521/oMP8CH8vmujDrxr428gHAC/oto1-30day-transformation_2ab85980.pdf",
  },
  oto2: {
    name: "Chronotype Mastery Pack",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/89740521/oMP8CH8vmujDrxr428gHAC/oto2-chronotype-mastery_02bf8aef.pdf",
  },
  oto3: {
    name: "Deep Sleep Toolkit",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/89740521/oMP8CH8vmujDrxr428gHAC/oto3-deep-sleep-toolkit_e02cd38f.pdf",
  },
};

const CHRONOTYPE_NAMES: Record<string, string> = {
  lion: "Lion 🦁",
  bear: "Bear 🐻",
  wolf: "Wolf 🐺",
  dolphin: "Dolphin 🐬",
};

async function brevoRequest(endpoint: string, body: object): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("[Email] BREVO_API_KEY not set — skipping email");
    return false;
  }

  try {
    const response = await fetch(`${BREVO_API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Email] Brevo API error ${response.status}:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[Email] Network error:", err);
    return false;
  }
}

// ─── Purchase Confirmation Email ──────────────────────────────────────────────
export async function sendPurchaseConfirmation({
  email,
  name,
  product,
  chronotype,
  amount,
}: {
  email: string;
  name?: string;
  product: string;
  chronotype?: string;
  amount: number;
}): Promise<boolean> {
  const download = PRODUCT_DOWNLOADS[product] || PRODUCT_DOWNLOADS.tripwire;
  const chronotypeName = chronotype ? CHRONOTYPE_NAMES[chronotype] || chronotype : "Bear 🐻";
  const displayName = name || "there";

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your materials are ready</title>
</head>
<body style="margin:0;padding:0;background:#0d0b1a;font-family:Inter,Arial,sans-serif;color:#e8e6f0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:48px;margin-bottom:8px;">🌙</div>
      <h1 style="color:#fff;font-size:24px;margin:0;font-weight:800;">Deep Sleep Reset</h1>
      <p style="color:#8b7fa8;margin:8px 0 0;">Your personalized sleep system</p>
    </div>

    <!-- Success banner -->
    <div style="background:linear-gradient(135deg,#2d1b69,#1a0f3a);border:1px solid #4a3080;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
      <div style="font-size:36px;margin-bottom:8px;">✅</div>
      <h2 style="color:#fff;margin:0 0 8px;font-size:20px;">Payment confirmed!</h2>
      <p style="color:#a89bc8;margin:0;font-size:14px;">Order processed · $${amount.toFixed(2)} USD</p>
    </div>

    <!-- Chronotype badge -->
    <div style="background:#1a1230;border:1px solid #2d2050;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
      <p style="color:#8b7fa8;margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Your chronotype</p>
      <p style="color:#c4a8ff;font-size:24px;font-weight:800;margin:0;">${chronotypeName}</p>
    </div>

    <!-- Download section -->
    <div style="background:#1a1230;border:1px solid #2d2050;border-radius:16px;padding:24px;margin-bottom:24px;">
      <h3 style="color:#fff;margin:0 0 16px;font-size:16px;">📥 Your download materials</h3>
      
      <div style="background:#0d0b1a;border:1px solid #2d2050;border-radius:10px;padding:16px;margin-bottom:12px;">
        <p style="color:#c4a8ff;font-weight:700;margin:0 0 4px;font-size:14px;">📄 ${download.name}</p>
        <p style="color:#6b5f8a;margin:0 0 12px;font-size:12px;">Personalized protocol for ${chronotypeName}</p>
        <a href="${download.url}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:700;">
          ⬇️ Download PDF
        </a>
      </div>
    </div>

    <!-- 7-day preview -->
    <div style="background:linear-gradient(135deg,#1a0f3a,#0d0b1a);border:1px solid #4a3080;border-radius:16px;padding:24px;margin-bottom:24px;">
      <h3 style="color:#fff;margin:0 0 12px;font-size:16px;">🚀 How to start tonight</h3>
      <ol style="color:#a89bc8;margin:0;padding-left:20px;font-size:14px;line-height:1.8;">
        <li>Download your personalized plan above</li>
        <li>Read the Night 1 protocol (5 minutes)</li>
        <li>Set your alarm to the time recommended for your chronotype</li>
        <li>Track your Sleep Score every morning</li>
      </ol>
    </div>

    <!-- Support -->
    <div style="text-align:center;margin-bottom:24px;">
      <p style="color:#6b5f8a;font-size:13px;margin:0;">
        Questions? Reply to <a href="mailto:petr.matej@gmail.com" style="color:#c4a8ff;">petr.matej@gmail.com</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align:center;border-top:1px solid #1a1230;padding-top:20px;">
      <p style="color:#4a3f6b;font-size:11px;margin:0;">
        Deep Sleep Reset © 2026 · Sleep well, live better 🌙<br>
        <a href="#" style="color:#4a3f6b;">Unsubscribe</a>
      </p>
    </div>

  </div>
</body>
</html>`;

  return brevoRequest("/smtp/email", {
    sender: SENDER,
    to: [{ email, name: displayName }],
    subject: `✅ Your materials are ready — ${download.name}`,
    htmlContent,
  });
}

// ─── 7-Day Email Sequence ─────────────────────────────────────────────────────
const EMAIL_SEQUENCE = [
  {
    day: 1,
    subject: "🌙 Night 1: Your chronotype and the first step to deep sleep",
    preview: "Tonight you'll do one thing that will change your sleep forever.",
    content: (chronotype: string) => `
      <h2 style="color:#fff;">Night 1: Set Your Biological Alarm</h2>
      <p style="color:#a89bc8;">Hey,</p>
      <p style="color:#a89bc8;">Congrats on taking the first step! Tonight you have one simple but powerful technique waiting for you.</p>
      <p style="color:#a89bc8;">As a <strong style="color:#c4a8ff;">${CHRONOTYPE_NAMES[chronotype] || "Bear 🐻"}</strong>, you need to know exactly when your body wants to sleep. Tonight you'll find out.</p>
      <div style="background:#1a1230;border-left:4px solid #7c3aed;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
        <p style="color:#c4a8ff;font-weight:700;margin:0 0 8px;">Tonight's task (5 minutes):</p>
        <p style="color:#a89bc8;margin:0;">2 hours before your planned sleep time, dim all lights to minimum and put your phone down. This single exercise triggers melatonin production and naturally prepares you for sleep.</p>
      </div>
      <p style="color:#a89bc8;">Tomorrow I'll send you Night 2 — how to eliminate sleep "thieves".</p>
      <p style="color:#a89bc8;">Sleep well 🌙</p>
    `,
  },
  {
    day: 2,
    subject: "🌙 Night 2: Eliminate sleep thieves (this will surprise you)",
    preview: "One thing you do every evening is stealing hours of deep sleep from you.",
    content: (chronotype: string) => `
      <h2 style="color:#fff;">Night 2: Sleep Thieves</h2>
      <p style="color:#a89bc8;">How did Night 1 go? Tonight we go deeper.</p>
      <p style="color:#a89bc8;">The biggest sleep thief for <strong style="color:#c4a8ff;">${CHRONOTYPE_NAMES[chronotype] || "Bear 🐻"}</strong> is caffeine. Not the morning coffee — the afternoon one.</p>
      <div style="background:#1a1230;border-left:4px solid #7c3aed;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
        <p style="color:#c4a8ff;font-weight:700;margin:0 0 8px;">Tonight's task:</p>
        <p style="color:#a89bc8;margin:0;">Set your caffeine cutoff to 1pm. Caffeine has a half-life of 5–7 hours — a cup at 3pm means you still have half the caffeine in your blood at 10pm. Tonight try the 4-7-8 breathing technique when falling asleep.</p>
      </div>
    `,
  },
  {
    day: 3,
    subject: "🌙 Night 3: Sleep cave — optimize your environment in 10 minutes",
    preview: "A small change in your bedroom = dramatic improvement in sleep quality.",
    content: (_chronotype: string) => `
      <h2 style="color:#fff;">Night 3: Optimize Your Environment</h2>
      <p style="color:#a89bc8;">Tonight we focus on your bedroom. Small changes, big impact.</p>
      <div style="background:#1a1230;border-left:4px solid #7c3aed;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
        <p style="color:#c4a8ff;font-weight:700;margin:0 0 8px;">Tonight's checklist:</p>
        <ul style="color:#a89bc8;margin:0;padding-left:20px;">
          <li>Cover all LED indicator lights and standby lights</li>
          <li>Lower temperature to 63–66°F (17–19°C)</li>
          <li>Charge your phone outside the bedroom</li>
        </ul>
      </div>
    `,
  },
  {
    day: 5,
    subject: "🌙 Day 5: How are you sleeping? + Bonus tip for deep sleep",
    preview: "One supplement that dramatically improves your sleep (scientifically proven).",
    content: (_chronotype: string) => `
      <h2 style="color:#fff;">Day 5: Magnesium — The Secret Weapon of Sleep</h2>
      <p style="color:#a89bc8;">How is the 7-Night Reset going? Today I'll give you one specific tip that works for 80% of people.</p>
      <p style="color:#a89bc8;"><strong style="color:#c4a8ff;">Magnesium glycinate</strong> — 200–400mg one hour before bed. Magnesium is a cofactor for nervous system and muscle relaxation. Most people are deficient.</p>
      <p style="color:#a89bc8;">Where to buy: any pharmacy or iHerb. Cost: ~$15–25 for a 2-month supply.</p>
      <div style="background:#1a1230;border:1px solid #2d2050;border-radius:12px;padding:16px;margin:16px 0;text-align:center;">
        <p style="color:#c4a8ff;font-weight:700;margin:0 0 8px;">Want to go deeper?</p>
        <p style="color:#a89bc8;margin:0 0 12px;font-size:14px;">The 30-Day Sleep Transformation Program gives you the complete system for lasting sleep change.</p>
        <a href="https://deepsleep.quest/upsell/1" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:700;">
          View Program →
        </a>
      </div>
    `,
  },
  {
    day: 7,
    subject: "🎉 Day 7: How do you feel? + Your lifelong sleep plan",
    preview: "Congratulations on completing the 7-Night Reset! Here is your next step.",
    content: (chronotype: string) => `
      <h2 style="color:#fff;">🎉 You Completed the 7-Night Reset!</h2>
      <p style="color:#a89bc8;">Congratulations! Completing the 7-day protocol puts you in the top 5% of people who actually work on their sleep quality.</p>
      <p style="color:#a89bc8;">As a <strong style="color:#c4a8ff;">${CHRONOTYPE_NAMES[chronotype] || "Bear 🐻"}</strong> you now have the foundational tools. But real sleep transformation takes 21–30 days.</p>
      <div style="background:linear-gradient(135deg,#2d1b69,#1a0f3a);border:1px solid #4a3080;border-radius:16px;padding:24px;margin:16px 0;text-align:center;">
        <p style="color:#c4a8ff;font-size:18px;font-weight:800;margin:0 0 8px;">30-Day Sleep Transformation</p>
        <p style="color:#a89bc8;margin:0 0 16px;font-size:14px;">Complete system for lasting sleep change — only $7</p>
        <a href="https://deepsleep.quest/upsell/1" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;">
          Continue My Journey →
        </a>
      </div>
      <p style="color:#6b5f8a;font-size:13px;">This is the last email in our 7-day sequence. Sleep well! 🌙</p>
    `,
  },
];

export async function sendSequenceEmail({
  email,
  name,
  chronotype,
  day,
}: {
  email: string;
  name?: string;
  chronotype: string;
  day: number;
}): Promise<boolean> {
  const emailData = EMAIL_SEQUENCE.find((e) => e.day === day);
  if (!emailData) return false;

  const displayName = name || "there";
  const chronotypeName = CHRONOTYPE_NAMES[chronotype] || "Bear 🐻";

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0d0b1a;font-family:Inter,Arial,sans-serif;color:#e8e6f0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:36px;margin-bottom:4px;">🌙</div>
      <p style="color:#8b7fa8;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Deep Sleep Reset · Day ${day}</p>
    </div>

    <div style="background:#1a1230;border:1px solid #2d2050;border-radius:16px;padding:28px;margin-bottom:24px;">
      <p style="color:#8b7fa8;margin:0 0 16px;font-size:13px;">Hey ${displayName} (${chronotypeName}),</p>
      ${emailData.content(chronotype)}
    </div>

    <div style="text-align:center;border-top:1px solid #1a1230;padding-top:20px;">
      <p style="color:#4a3f6b;font-size:11px;margin:0;">
        Deep Sleep Reset © 2026 🌙<br>
        <a href="#" style="color:#4a3f6b;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  return brevoRequest("/smtp/email", {
    sender: SENDER,
    to: [{ email, name: displayName }],
    subject: emailData.subject,
    htmlContent,
  });
}

// ─── Add contact to Brevo list ────────────────────────────────────────────────
export async function addBrevoContact({
  email,
  name,
  chronotype,
  product,
}: {
  email: string;
  name?: string;
  chronotype?: string;
  product?: string;
}): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch(`${BREVO_API_URL}/contacts`, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify({
        email,
        attributes: {
          FIRSTNAME: name || "",
          CHRONOTYPE: chronotype || "",
          PRODUCT: product || "",
        },
        listIds: [2], // Default list ID — update after creating list in Brevo
        updateEnabled: true,
      }),
    });

    return response.ok || response.status === 204;
  } catch {
    return false;
  }
}
