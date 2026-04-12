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
      <p style="color:#8b7fa8;margin:8px 0 0;">Tvůj personalizovaný spánkový systém</p>
    </div>

    <!-- Success banner -->
    <div style="background:linear-gradient(135deg,#2d1b69,#1a0f3a);border:1px solid #4a3080;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
      <div style="font-size:36px;margin-bottom:8px;">✅</div>
      <h2 style="color:#fff;margin:0 0 8px;font-size:20px;">Platba potvrzena!</h2>
      <p style="color:#a89bc8;margin:0;font-size:14px;">Objednávka zpracována · $${amount.toFixed(2)} USD</p>
    </div>

    <!-- Chronotype badge -->
    <div style="background:#1a1230;border:1px solid #2d2050;border-radius:12px;padding:16px;text-align:center;margin-bottom:24px;">
      <p style="color:#8b7fa8;margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Tvůj chronotyp</p>
      <p style="color:#c4a8ff;font-size:24px;font-weight:800;margin:0;">${chronotypeName}</p>
    </div>

    <!-- Download section -->
    <div style="background:#1a1230;border:1px solid #2d2050;border-radius:16px;padding:24px;margin-bottom:24px;">
      <h3 style="color:#fff;margin:0 0 16px;font-size:16px;">📥 Tvoje materiály ke stažení</h3>
      
      <div style="background:#0d0b1a;border:1px solid #2d2050;border-radius:10px;padding:16px;margin-bottom:12px;">
        <p style="color:#c4a8ff;font-weight:700;margin:0 0 4px;font-size:14px;">📄 ${download.name}</p>
        <p style="color:#6b5f8a;margin:0 0 12px;font-size:12px;">Personalizovaný protokol pro ${chronotypeName}</p>
        <a href="${download.url}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:700;">
          ⬇️ Stáhnout PDF
        </a>
      </div>
    </div>

    <!-- 7-day preview -->
    <div style="background:linear-gradient(135deg,#1a0f3a,#0d0b1a);border:1px solid #4a3080;border-radius:16px;padding:24px;margin-bottom:24px;">
      <h3 style="color:#fff;margin:0 0 12px;font-size:16px;">🚀 Jak začít dnes večer</h3>
      <ol style="color:#a89bc8;margin:0;padding-left:20px;font-size:14px;line-height:1.8;">
        <li>Stáhni si svůj personalizovaný plán výše</li>
        <li>Přečti si Noc 1 protokol (5 minut)</li>
        <li>Nastav si budík na čas doporučený pro tvůj chronotyp</li>
        <li>Sleduj svůj Sleep Score každé ráno</li>
      </ol>
    </div>

    <!-- Support -->
    <div style="text-align:center;margin-bottom:24px;">
      <p style="color:#6b5f8a;font-size:13px;margin:0;">
        Otázky? Odpovídám na <a href="mailto:petr.matej@gmail.com" style="color:#c4a8ff;">petr.matej@gmail.com</a>
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
    subject: "🌙 Noc 1: Tvůj chronotyp a první krok ke hlubokému spánku",
    preview: "Dnes večer uděláš jednu věc, která změní tvůj spánek navždy.",
    content: (chronotype: string) => `
      <h2 style="color:#fff;">Noc 1: Nastav svůj biologický alarm</h2>
      <p style="color:#a89bc8;">Ahoj,</p>
      <p style="color:#a89bc8;">Gratulujeme k prvnímu kroku! Dnes večer tě čeká jedna jednoduchá, ale mocná technika.</p>
      <p style="color:#a89bc8;">Jako <strong style="color:#c4a8ff;">${CHRONOTYPE_NAMES[chronotype] || "Medvěd 🐻"}</strong> potřebuješ přesně vědět, kdy tvoje tělo chce spát. A dnes večer to zjistíš.</p>
      <div style="background:#1a1230;border-left:4px solid #7c3aed;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
        <p style="color:#c4a8ff;font-weight:700;margin:0 0 8px;">Dnešní úkol (5 minut):</p>
        <p style="color:#a89bc8;margin:0;">2 hodiny před plánovaným spánkem ztlum všechna světla na minimum a odlož telefon. Toto jediné cvičení spustí produkci melatoninu a přirozeně tě připraví na spánek.</p>
      </div>
      <p style="color:#a89bc8;">Zítra ti pošlu Noc 2 — jak eliminovat spánkové "krádeže".</p>
      <p style="color:#a89bc8;">Spi dobře 🌙</p>
    `,
  },
  {
    day: 2,
    subject: "🌙 Noc 2: Eliminuj spánkové krádeže (tohle tě překvapí)",
    preview: "Jedna věc, kterou děláš každý večer, krade ti hodiny hlubokého spánku.",
    content: (chronotype: string) => `
      <h2 style="color:#fff;">Noc 2: Spánkové krádeže</h2>
      <p style="color:#a89bc8;">Jak šla Noc 1? Dnes jdeme hlouběji.</p>
      <p style="color:#a89bc8;">Největší spánkový zloděj pro <strong style="color:#c4a8ff;">${CHRONOTYPE_NAMES[chronotype] || "Medvěd 🐻"}</strong> je kofein. Ale ne ten ranní — ten odpolední.</p>
      <div style="background:#1a1230;border-left:4px solid #7c3aed;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
        <p style="color:#c4a8ff;font-weight:700;margin:0 0 8px;">Dnešní úkol:</p>
        <p style="color:#a89bc8;margin:0;">Nastav si kofeinový cutoff na 13:00. Kofein má poločas rozpadu 5–7 hodin — šálek ve 15:00 znamená, že v 22:00 máš stále polovinu kofeinu v krvi. Dnes večer vyzkoušej techniku 4-7-8 dýchání při usínání.</p>
      </div>
    `,
  },
  {
    day: 3,
    subject: "🌙 Noc 3: Spánková jeskyně — optimalizuj prostředí za 10 minut",
    preview: "Malá změna v ložnici = dramatické zlepšení kvality spánku.",
    content: (_chronotype: string) => `
      <h2 style="color:#fff;">Noc 3: Optimalizuj prostředí</h2>
      <p style="color:#a89bc8;">Dnes se zaměříme na tvoji ložnici. Malé změny, velký dopad.</p>
      <div style="background:#1a1230;border-left:4px solid #7c3aed;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
        <p style="color:#c4a8ff;font-weight:700;margin:0 0 8px;">Checklist pro dnes večer:</p>
        <ul style="color:#a89bc8;margin:0;padding-left:20px;">
          <li>Zakryj všechny LED kontrolky a standby světla</li>
          <li>Sniž teplotu na 17–19°C</li>
          <li>Telefon nabíjej mimo ložnici</li>
        </ul>
      </div>
    `,
  },
  {
    day: 5,
    subject: "🌙 Den 5: Jak spíš? + Bonus tip pro hluboký spánek",
    preview: "Jeden doplněk, který dramaticky zlepší tvůj spánek (vědecky ověřeno).",
    content: (_chronotype: string) => `
      <h2 style="color:#fff;">Den 5: Magnesium — tajná zbraň spánku</h2>
      <p style="color:#a89bc8;">Jak ti jde 7-Night Reset? Dnes ti dám jeden konkrétní tip, který funguje pro 80% lidí.</p>
      <p style="color:#a89bc8;"><strong style="color:#c4a8ff;">Magnesium glycinát</strong> — 200–400mg hodinu před spaním. Magnesium je kofaktor pro relaxaci nervového systému a svalů. Většina lidí má jeho deficit.</p>
      <p style="color:#a89bc8;">Kde koupit: lékárna, iHerb, nebo Rohlik.cz. Cena: 200–400 Kč za 2 měsíce zásoby.</p>
      <div style="background:#1a1230;border:1px solid #2d2050;border-radius:12px;padding:16px;margin:16px 0;text-align:center;">
        <p style="color:#c4a8ff;font-weight:700;margin:0 0 8px;">Chceš jít hlouběji?</p>
        <p style="color:#a89bc8;margin:0 0 12px;font-size:14px;">30-Day Sleep Transformation Program ti dá kompletní systém pro trvalou změnu spánku.</p>
        <a href="https://deepsleep.manus.space/upsell/1" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-size:13px;font-weight:700;">
          Zobrazit program →
        </a>
      </div>
    `,
  },
  {
    day: 7,
    subject: "🎉 Den 7: Jak se cítíš? + Tvůj celoživotní spánkový plán",
    preview: "Gratulujeme k dokončení 7-Night Reset! Zde je tvůj další krok.",
    content: (chronotype: string) => `
      <h2 style="color:#fff;">🎉 Dokončil jsi 7-Night Reset!</h2>
      <p style="color:#a89bc8;">Gratulujeme! Dokončení 7-denního protokolu tě zařazuje do top 5% lidí, kteří skutečně pracují na kvalitě svého spánku.</p>
      <p style="color:#a89bc8;">Jako <strong style="color:#c4a8ff;">${CHRONOTYPE_NAMES[chronotype] || "Medvěd 🐻"}</strong> máš nyní základní nástroje. Ale skutečná transformace spánku trvá 21–30 dní.</p>
      <div style="background:linear-gradient(135deg,#2d1b69,#1a0f3a);border:1px solid #4a3080;border-radius:16px;padding:24px;margin:16px 0;text-align:center;">
        <p style="color:#c4a8ff;font-size:18px;font-weight:800;margin:0 0 8px;">30-Day Sleep Transformation</p>
        <p style="color:#a89bc8;margin:0 0 16px;font-size:14px;">Kompletní systém pro trvalou změnu spánku — jen $7</p>
        <a href="https://deepsleep.manus.space/upsell/1" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;">
          Chci pokračovat →
        </a>
      </div>
      <p style="color:#6b5f8a;font-size:13px;">Toto je poslední email z naší 7-denní sekvence. Spi dobře! 🌙</p>
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
      <p style="color:#8b7fa8;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Deep Sleep Reset · Den ${day}</p>
    </div>

    <div style="background:#1a1230;border:1px solid #2d2050;border-radius:16px;padding:28px;margin-bottom:24px;">
      <p style="color:#8b7fa8;margin:0 0 16px;font-size:13px;">Ahoj ${displayName} (${chronotypeName}),</p>
      ${emailData.content(chronotype)}
    </div>

    <div style="text-align:center;border-top:1px solid #1a1230;padding-top:20px;">
      <p style="color:#4a3f6b;font-size:11px;margin:0;">
        Deep Sleep Reset © 2026 🌙<br>
        <a href="#" style="color:#4a3f6b;">Odhlásit se</a>
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
