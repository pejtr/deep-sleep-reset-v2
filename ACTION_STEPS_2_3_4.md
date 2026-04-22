# Action Steps: Google Search Console, Google Ads & Reddit #2

> **Status:** Ready to execute — copy-paste instrukce, žádné přemýšlení potřeba.

---

## Krok 2 — Google Search Console (5 minut)

### Odeslání sitemap

1. Otevři: **https://search.google.com/search-console**
2. Přidej property → URL prefix → zadej: `https://deepsleep.quest`
3. Ověření přes HTML tag — přidej do `<head>` v `client/index.html`:
   ```html
   <meta name="google-site-verification" content="TVŮJ_KÓD_ZDE" />
   ```
   *(kód dostaneš po kliknutí na "HTML tag" v GSC)*
4. Po ověření: **Sitemaps** → Add sitemap → zadej:
   ```
   https://deepsleep.quest/sitemap.xml
   ```
5. Klikni **Submit** → hotovo.

### Co sitemap obsahuje (automaticky)

| URL | Priority | Frekvence |
|-----|----------|-----------|
| `/` | 1.0 | daily |
| `/quiz` | 0.9 | weekly |
| `/blog` | 0.8 | daily |
| `/blog/why-you-cant-sleep-chronotype` | 0.7 | monthly |
| `/blog/deep-sleep-stages-explained` | 0.7 | monthly |
| `/blog/best-sleep-schedule-chronotype` | 0.7 | monthly |
| `/blog/natural-sleep-remedies-science` | 0.7 | monthly |
| `/blog/how-to-fix-insomnia-naturally` | 0.7 | monthly |

**Očekávaný výsledek:** Indexace do 3–7 dní, organický traffic do 2–4 týdnů.

---

## Krok 3 — Google Ads Search (30 minut)

### Přihlášení a nastavení

1. Otevři: **https://ads.google.com**
2. Vytvoř nový účet nebo použij existující → přidej platební metodu
3. Vytvoř kampaň: **New Campaign → Search → Website traffic**

### Kampaň 1: Insomnia (hlavní)

**Nastavení:**
- Campaign name: `DSR — Insomnia Search`
- Goal: Website traffic → `https://deepsleep.quest/quiz`
- Budget: **200 Kč/den**
- Bidding: Maximize clicks (začátek), po 50 kliknutích přepnout na Target CPA
- Location: Czech Republic + Slovakia (nebo EN: USA, UK, Canada, Australia)
- Language: Czech (nebo English)
- Ad schedule: 18:00–23:59 (večer = nejvyšší intent)

**Ad Group 1 — Insomnia:**
Keywords (broad match modifier):
```
+nespavost +řešení
+insomnia +fix
+nemohu +spát +proč
+špatný +spánek +příčiny
+jak +lépe +spát
+sleep +problems +solution
+can't +sleep +help
+insomnia +natural +remedy
```

**RSA Reklama (zkopíruj do Ads):**

Headlines (max 30 znaků každý):
```
Headline 1: Nespavost? Zjisti svůj typ
Headline 2: 60s Quiz → Osobní plán spánku
Headline 3: 7 nocí. Vědecky ověřeno.
Headline 4: Chronotyp test zdarma
Headline 5: Přes 1000 lidí to vyzkoušelo
```

Descriptions (max 90 znaků):
```
Desc 1: Zjisti svůj chronotyp a dostaneš personalizovaný 7-noční reset spánku za 1 $.
Desc 2: 60sekundový quiz odhalí proč nespíš. Řešení přizpůsobené tvému biologickému rytmu.
```

**Final URL:** `https://deepsleep.quest/quiz`

---

**Ad Group 2 — Chronotype:**
Keywords:
```
+chronotyp +test
+jsem +ranní +ptáče
+noční +sova +spánek
+chronotype +quiz
+sleep +chronotype
+lion +bear +wolf +dolphin +sleep
```

Headlines:
```
Headline 1: Jaký jsi chronotyp?
Headline 2: Lev, Medvěd, Vlk nebo Delfín?
Headline 3: 60s test → tvůj spánkový plán
```

**Final URL:** `https://deepsleep.quest/quiz`

---

### Tracking setup

1. V Google Ads: **Tools → Conversions → New conversion → Website**
2. Conversion name: `Quiz Completed`
3. Value: `1` (každý quiz completion = 1 Kč hodnota)
4. Zkopíruj Global Site Tag a přidej do `client/index.html` před `</head>`
5. Přidej conversion event na `/quiz-result` stránce (pošli mi GSC ID a přidám)

---

## Krok 4 — Reddit Post #2 na r/insomnia

### Příprava (5 minut před postem)

1. Ověř že účet **u/DeepSleepQuest** má 100+ karma
2. Zkontroluj r/insomnia pravidla: https://www.reddit.com/r/insomnia/about/rules
3. Nejlepší čas: **Úterý nebo Čtvrtek, 20:00–22:00 CET**

### Post — zkopíruj přesně

**Title:**
```
After 2 years of insomnia, I finally figured out why nothing worked (it wasn't what I expected)
```

**Body:**
```
I want to share something that genuinely changed my sleep after trying everything for 2 years.

The short version: I was treating the symptoms, not the cause. And the cause turned out to be that I was fighting my own biology.

**What I tried that didn't work:**
- Melatonin (made me groggy, didn't fix the 3am wake-ups)
- Sleep restriction therapy (brutal, helped short-term, relapsed)
- Chamomile tea, magnesium, lavender (nice, but not enough)
- Strict 10pm bedtime (I'd lie there for 2 hours staring at the ceiling)

**What actually worked:**

I learned about chronotypes — the idea that people have genetically different sleep timing preferences. There are 4 types: Lions (early), Bears (middle), Wolves (late), and Dolphins (light sleepers with fragmented sleep).

I'm a Dolphin. My nervous system is naturally more alert. Forcing myself to sleep at "normal" times was like trying to run software on the wrong operating system.

Once I adjusted my sleep window to match my actual chronotype (later bedtime, specific light exposure timing, different meal schedule), my sleep improved dramatically within about 2 weeks.

**The key insight:** Most sleep advice is written for Bears (the majority). If you're a Wolf or Dolphin, generic advice will often make things worse.

Happy to answer questions about what specifically changed for me. Has anyone else found that standard sleep advice didn't work for them?
```

### Seed komentář (přidej 5 minut po postu)

```
Edit: A few people have asked how to figure out their type. I used this free 60-second quiz that identifies your chronotype and gives personalized recommendations: [deepsleep.quest/quiz](https://deepsleep.quest/quiz) — it's what I used to figure out I was a Dolphin.
```

> **DŮLEŽITÉ:** Seed komentář přidej jako **reply na svůj vlastní post**, ne jako edit. Vypadá přirozeněji.

### Po 24 hodinách

Pokud post má 50+ upvotů, přidej edit na konec původního postu:
```
**Edit:** Since this got some traction — for those asking about the chronotype quiz I mentioned, it's at deepsleep.quest/quiz. It's free and takes 60 seconds.
```

---

## Souhrn časové osy

| Den | Akce | Čas |
|-----|------|-----|
| Dnes | Google Search Console → submit sitemap | 5 min |
| Dnes | Google Ads → vytvořit kampaň (200 Kč/den) | 30 min |
| Út/Čt večer | Reddit post #2 na r/insomnia | 10 min |
| +3 dny | Zkontrolovat GSC indexaci | 2 min |
| +7 dní | Vyhodnotit Google Ads (CPC, CTR, konverze) | 10 min |
| +7 dní | Reddit post #3 na r/productivity | 10 min |
