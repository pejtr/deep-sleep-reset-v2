# Deep Sleep Reset — Placené Reklamy: Všechny Platformy
**Web:** deepsleep.quest | **Datum:** 21. dubna 2026

---

## Přehled všech platforem

| Platforma | Typ | Denní budget | Audience | Priorita spuštění |
|-----------|-----|-------------|----------|-------------------|
| **Google Search** | Search | 200 Kč | High-intent hledači | 1. (ihned) |
| **Reddit Ads** | Feed + Subreddit | 100 Kč | Sleep/biohacking komunity | 2. (týden 1) |
| **Pinterest Ads** | Promoted Pins | 80 Kč | Wellness, self-improvement | 3. (týden 2) |
| **TikTok Ads** | In-Feed Video | 120 Kč | 25–40, wellness audience | 4. (týden 2) |
| **YouTube Ads** | Pre-roll (In-Stream) | 100 Kč | Sleep/health content viewers | 5. (týden 3) |

**Celkový denní budget (všechny platformy):** 600 Kč (~26 USD)

---

# REDDIT ADS

## Proč Reddit pro Deep Sleep Reset

Reddit má nejcílenější sleep audience na internetu. r/sleep (325K), r/insomnia (350K), r/biohacking (450K) — tito lidé aktivně hledají řešení. Reddit Ads umožňují cílit přímo na tyto subreddity.

## Nastavení kampaně

- **Název:** `[DSR] Reddit — Subreddit Targeting — Sleep`
- **Cíl:** Traffic (Conversions vyžadují Reddit Pixel s 50+ konverzemi)
- **Denní budget:** 100 Kč (~4.5 USD) — minimum je ~5 USD/den
- **Bidding:** CPM nebo CPC, začni s CPC
- **Lokace:** Worldwide (Reddit je globálně anglicky) nebo US+UK+CA+AU

## Targeting

**Subreddit targeting (nejdůležitější):**
```
r/sleep
r/insomnia
r/biohacking
r/selfimprovement
r/productivity
r/nootropics
r/intermittentfasting (překryv s health audience)
```

**Interest targeting (doplňkové):**
- Health & Fitness
- Science & Education
- Self-Improvement

**Věk:** 25–44  
**Zařízení:** Mobile + Desktop

## Formáty reklam

### Promoted Post (Text + Image) — doporučeno

**Varianta A — "Native" styl (vypadá jako organický post):**

**Titulek:** `Why you can't fall asleep even when exhausted — it's your chronotype`

**Text:**
```
Most sleep advice ignores the most important variable: your chronotype.

Your body has a biological sleep window — and if you're trying to sleep outside it, no amount of melatonin or sleep hygiene will fix it.

Wolf types (natural sleep 12:30–8:30 AM) who force themselves to bed at 10 PM spend 90 minutes lying awake, training their brain to associate bed with wakefulness.

60-second quiz identifies your type → deepsleep.quest
```

**Image:** Vizuál C (Chronotype Wheel) — zlaté kolečko na tmavém pozadí  
**CTA:** Learn More  
**URL:** `https://deepsleep.quest/quiz`

---

**Varianta B — "Data" styl:**

**Titulek:** `I tracked my sleep for 90 days. Timing mattered more than duration.`

**Text:**
```
7.5h at wrong time: focus score 5.8/10
6.5h at right time: focus score 7.4/10

The difference was chronotype alignment. Shifted my sleep window by 90 minutes, HRV improved 17%, reaction time improved 9%.

Full protocol at deepsleep.quest — free quiz to identify your type.
```

**Image:** Vizuál B (Before/After)  
**CTA:** Learn More

## Reddit Pixel instalace

```html
<!-- Reddit Pixel -->
<script>
!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?
p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};
p.callQueue=[];var t=d.createElement("script");
t.src="https://www.redditstatic.com/ads/v2.js",t.async=!0;
var s=d.getElementsByTagName("script")[0];
s.parentNode.insertBefore(t,s)}}(window,document);
rdt('init','TVOJE_REDDIT_PIXEL_ID');
rdt('track', 'PageVisit');
</script>
```

Na `/thank-you` přidej: `rdt('track', 'Purchase', {value: 25, currency: 'CZK'});`

---

# PINTEREST ADS

## Proč Pinterest pro Deep Sleep Reset

Pinterest má 450M+ měsíčních uživatelů, z nichž 85% jsou ženy ve věku 25–54 — ideální pro wellness produkty. Pinterest uživatelé mají 2× vyšší purchase intent než na jiných platformách. Sleep a wellness jsou top kategorie.

## Nastavení kampaně

- **Název:** `[DSR] Pinterest — Sleep Wellness — Conversion`
- **Cíl:** Conversions (nebo Traffic na začátku)
- **Denní budget:** 80 Kč (~3.5 USD) — minimum ~2 USD/den
- **Bidding:** Automatic bidding
- **Lokace:** CZ, SK, nebo Worldwide (EN content)

## Targeting

**Interests:**
- Sleep & Insomnia
- Health & Wellness
- Self-Improvement
- Mindfulness & Meditation
- Natural Remedies

**Keywords (Pinterest search):**
```
insomnia remedies
how to sleep better
sleep schedule
chronotype
deep sleep tips
natural sleep aid
sleep hygiene
can't sleep
wolf chronotype
sleep protocol
```

**Audience:** Actalike audience (podobná těm kteří navštívili web)

## Pinterest Pin formáty

### Standard Pin (1000×1500px, 2:3)

**Pin 1 — Educational Infographic:**

Obsah pinu (navrhni v Canva):
```
Tmavé pozadí, zlatá typografie

HEADLINE: "4 Chronotypes — Which One Are You?"

[Ikona Lva] LION
Sleeps: 10 PM – 6 AM
Peak energy: 6–10 AM

[Ikona Medvěda] BEAR  
Sleeps: 11 PM – 7 AM
Peak energy: 9 AM – 2 PM

[Ikona Vlka] WOLF
Sleeps: 12:30 AM – 8:30 AM
Peak energy: 12 PM – 8 PM

[Ikona Delfína] DOLPHIN
Sleeps: 12 AM – 6 AM
Light sleeper, variable

FOOTER: "Find your type in 60 seconds → deepsleep.quest"
```

**Pin 2 — Quote/Tip:**
```
Tmavé pozadí, velký text

"You don't have insomnia.
You're sleeping at the wrong
time for your biology."

— Deep Sleep Reset

deepsleep.quest
```

**Pin 3 — Before/After:**
Použij vizuál B (Before/After) z Meta Ads, oříznutý na 2:3

## Pinterest Tag instalace

```html
<script type="text/javascript">
!function(e){if(!window.pintrk){window.pintrk=function(){
window.pintrk.queue.push(Array.prototype.slice.call(arguments))};
var n=window.pintrk;n.queue=[],n.version="3.0";
var t=document.createElement("script");
t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];
r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
pintrk('load', 'TVOJE_PINTEREST_TAG_ID');
pintrk('page');
</script>
```

Na `/thank-you`: `pintrk('track', 'checkout', {value: 25, currency: 'CZK'});`

---

# TIKTOK ADS

## Proč TikTok pro Deep Sleep Reset

TikTok má 1B+ uživatelů, průměrný věk 25–34. Sleep content je virální — #sleeptok má miliardy zhlédnutí. TikTok Ads jsou levnější než Meta (CPM ~3–8 USD vs Meta 8–15 USD). Ideální pro video obsah s chronotype hákem.

## Nastavení kampaně

- **Název:** `[DSR] TikTok — Sleep Content — Traffic`
- **Cíl:** Traffic (Website Conversions vyžadují TikTok Pixel + 50 konverzí)
- **Denní budget:** 120 Kč (~5 USD) — minimum 5 USD/den
- **Bidding:** Lowest Cost
- **Lokace:** CZ, SK nebo Worldwide (EN)
- **Věk:** 18–44
- **Pohlaví:** Všechna

## Targeting

**Interest & Behavior:**
- Health & Wellness
- Sleep & Relaxation
- Self-Improvement
- Biohacking
- Productivity

**Hashtag targeting:**
- #sleeptok
- #insomnia
- #chronotype
- #biohacking
- #selfimprovement

## TikTok Video Reklamy — Scénáře

### Video A — "3:47 AM Hook" (15 sekund)

```
[0–2s] Záběr na telefon ukazující 3:47 AM
Text overlay: "It's 3:47 AM and you can't sleep... again"

[2–5s] Rychlý střih — unavená tvář ráno, káva
Text: "8 hours in bed. Still exhausted."

[5–10s] Animace chronotype wheel
Text: "The problem isn't your sleep. It's your chronotype."

[10–15s] CTA
Text: "Find yours in 60 seconds"
Logo + URL: deepsleep.quest
Voiceover: "Take the free quiz at deepsleep.quest"
```

**Hook text (první 3 slova jsou klíčová):** `"3:47 AM again..."`

### Video B — "Did you know?" (20 sekund)

```
[0–3s] Text na tmavém pozadí:
"Did you know there are 4 sleep chronotypes?"

[3–8s] Rychlé představení 4 typů s ikonami zvířat
"Lion 🦁 Bear 🐻 Wolf 🐺 Dolphin 🐬"

[8–14s] "Most people are sleeping at the WRONG time for their type"
Vizuál: hodiny s červeným X

[14–20s] "Take the 60-second quiz to find yours"
URL: deepsleep.quest
```

### Video C — "POV" formát (nejvirálnější na TikTok)

```
[0–3s] Text: "POV: You finally figured out why you can't sleep"

[3–8s] Animace: chronotype wheel se zvýrazněným Wolf typem
"You're a Wolf. Your body isn't ready to sleep before midnight."

[8–15s] "Shifting my sleep window by 90 minutes changed everything"
Rychlé bullet points: HRV +17%, focus +27%, no more 3 AM wake-ups

[15–20s] "Find your chronotype → deepsleep.quest"
```

## TikTok Pixel instalace

```html
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
  ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],
  ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
  for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
  ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},
  ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
  ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
  var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
  var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('TVOJE_TIKTOK_PIXEL_ID');
  ttq.page();
}(window, document, 'ttq');
</script>
```

Na `/thank-you`: `ttq.track('CompletePayment', {value: 25, currency: 'CZK'});`

---

# YOUTUBE ADS

## Proč YouTube pro Deep Sleep Reset

YouTube je 2. největší vyhledávač na světě. Sleep content (ASMR, sleep music, insomnia tips) má stovky milionů zhlédnutí. YouTube Ads umožňují cílit na diváky konkrétních kanálů a videí o spánku.

## Nastavení kampaně

- **Název:** `[DSR] YouTube — In-Stream — Sleep Content`
- **Cíl:** Website Traffic (nebo Conversions s Google Ads konverzním trackingem)
- **Denní budget:** 100 Kč
- **Bidding:** Target CPV (cost per view) — cíl: < 0.05 USD per view
- **Lokace:** CZ, SK nebo Worldwide

## Targeting

**YouTube targeting (nejcennější):**

**Placement targeting (konkrétní kanály/videa):**
- Kanály: Matthew Walker (Why We Sleep), Andrew Huberman (sleep episodes), Lex Fridman (sleep episodes)
- Videa: "how to fall asleep fast", "insomnia cure", "sleep better tonight", "chronotype explained"

**Audience targeting:**
- In-market: Health & Wellness, Sleep Aids
- Custom Intent: lidé kteří hledali "insomnia", "can't sleep", "chronotype"
- Life events: New job (sleep disruption), New parent

**Keyword targeting:**
```
insomnia cure
how to sleep better
sleep problems
chronotype
deep sleep
can't fall asleep
sleep schedule
```

## YouTube Video Reklamy

### In-Stream Ad (přeskočitelná po 5s) — 30–60 sekund

**KLÍČOVÉ PRAVIDLO:** Prvních 5 sekund musí být tak silných, že divák nechce přeskočit.

**Scénář — "5-Second Hook":**

```
[0–5s] HOOK (nesmí být přeskočeno):
Tmavá obrazovka. Červené hodiny: 3:47 AM.
Hlas: "It's 3:47 AM. You're exhausted. But you can't sleep."
[Pauza]
"I know why."

[5–15s] PROBLEM:
"Most people have been given the wrong sleep advice.
Go to bed at 10 PM. Wake up at 6 AM. Get 8 hours.
This works for 60% of people. For the other 40%, it creates insomnia."

[15–30s] SOLUTION:
"Your chronotype determines when your body is biologically ready to sleep.
Wolf types — like me — can't sleep before midnight. It's not a choice. It's biology.
When I stopped fighting it and aligned my sleep with my chronotype,
the insomnia disappeared in 7 nights."

[30–45s] PROOF:
"HRV improved 17%. Focus scores up 27%. No more 3 AM wake-ups.
Over 12,000 people have used the Deep Sleep Reset Protocol."

[45–60s] CTA:
"Take the free 60-second chronotype quiz at deepsleep.quest.
Find your type. Get your personalized 7-night protocol.
Link in the description."
```

**Thumbnail pro video:** Vizuál A (3:47 AM) s textem "Why You Can't Sleep"  
**Description link:** `https://deepsleep.quest/quiz`

### Bumper Ad (nepřeskočitelná, 6 sekund)

```
[0–2s] Vizuál: Chronotype Wheel (Varianta C)
[2–4s] Text: "4 chronotypes. Which one are you?"
[4–6s] Text + URL: "Find out in 60 seconds → deepsleep.quest"
```

---

## Souhrnný Časový Plán Spuštění

| Týden | Platforma | Akce | Budget/den |
|-------|-----------|------|-----------|
| **Týden 1** | Google Search | Spustit Kampaň 1 (Insomnia) | 200 Kč |
| **Týden 1** | Reddit Ads | Spustit Promoted Posts | 100 Kč |
| **Týden 2** | Pinterest Ads | Spustit Promoted Pins | 80 Kč |
| **Týden 2** | TikTok Ads | Spustit In-Feed Videos | 120 Kč |
| **Týden 3** | YouTube Ads | Spustit In-Stream Ads | 100 Kč |
| **Týden 3** | Google Search | Přidat Kampaň 2 (Chronotype) | +100 Kč |
| **Týden 4** | Všechny | Optimalizace — škálovat vítěze | TBD |

**Celkový budget po plném spuštění:** ~700 Kč/den (~30 USD)

---

## Pixel/Tag Checklist — Co přidat do kódu

| Platforma | Co přidat | Kde |
|-----------|-----------|-----|
| Google Ads | Global Site Tag (gtag.js) | index.html `<head>` |
| Google Ads | Conversion Event | /thank-you |
| Reddit Pixel | rdt snippet | index.html `<head>` |
| Reddit Pixel | Purchase event | /thank-you |
| Pinterest Tag | pintrk snippet | index.html `<head>` |
| Pinterest Tag | Checkout event | /thank-you |
| TikTok Pixel | ttq snippet | index.html `<head>` |
| TikTok Pixel | CompletePayment event | /thank-you |
| YouTube/Google | Remarketing tag | index.html (součást gtag) |

> **Pošli mi ID pixelů** (Google Ads ID, Reddit Pixel ID, Pinterest Tag ID, TikTok Pixel ID) a já přidám všechny do kódu najednou.

---

*Deep Sleep Reset — deepsleep.quest | Multi-Platform Ads Brief | Duben 2026*
