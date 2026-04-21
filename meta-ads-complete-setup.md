# Meta Ads — Kompletní nastavení pro Deep Sleep Reset

**Produkt:** The 7-Night Deep Sleep Reset  
**Cena:** $5  
**Landing page:** https://deep-sleep-reset.com  
**Checkout URL:** https://deep-sleep-reset.com/order  
**Datum:** Březen 2026

---

## Přehled kampaňové struktury

Celá strategie je rozdělena do **3 kampaní** podle teploty publika a fáze funnelu. Každá kampaň obsahuje ad sety pro různé segmenty, přičemž každý ad set testuje 2–3 kreativy.

| Kampaň | Účel | Budget/den | Publikum |
|---|---|---|---|
| **Kampaň 1 — Cold Acquisition** | Nové zákazníky, cold traffic | $30/den | Broad + Interest targeting |
| **Kampaň 2 — Warm Retargeting** | Návštěvníci webu, video viewers | $15/den | Custom audiences |
| **Kampaň 3 — Lookalike Scale** | Škálování po prvních datech | $20/den | LAL 1–3% purchasers |

**Celkový denní budget fáze 1:** $30/den (Kampaň 1 pouze)  
**Po 7 dnech přidat:** Kampaň 2 ($15/den)  
**Po 14 dnech přidat:** Kampaň 3 ($20/den)

---

## KAMPAŇ 1 — Cold Acquisition

### Nastavení kampaně

| Pole | Hodnota |
|---|---|
| **Cíl kampaně** | Sales |
| **Conversion event** | Purchase |
| **Pixel** | Váš Meta Pixel (ověřte v Events Manager) |
| **Budget type** | Campaign Budget Optimization (CBO) |
| **Daily budget** | $30/den |
| **Bid strategy** | Lowest cost (bez cap) — první 7 dní |
| **Attribution** | 7-day click, 1-day view |
| **Scheduling** | Vždy aktivní (24/7) |

---

### AD SET 1A — Pain Audience (Nejsilnější start)

| Pole | Hodnota |
|---|---|
| **Název** | `DSR_Cold_Pain_Interests_US` |
| **Lokace** | United States, Canada, United Kingdom, Australia |
| **Věk** | 28–55 |
| **Pohlaví** | Všechna |
| **Jazyk** | English (All) |
| **Budget** | Řízeno CBO na úrovni kampaně |

**Detailed Targeting — Interests (vyberte VŠECHNY):**
- Insomnia
- Sleep disorder
- Anxiety
- Stress management
- Meditation
- Calm (app)
- Headspace
- Sleep Cycle (app)
- Cognitive behavioral therapy
- Mental health awareness

**Exclusions:**
- Custom audience: Purchasers (lidé, kteří již koupili)

**Placements:** Automatic Placements (nechte Meta optimalizovat)

#### Kreativy v Ad Set 1A:

---

**AD 1A-1 — Video: Ad A (Pain → Solution, 16s)**

| Pole | Hodnota |
|---|---|
| **Soubor** | `adA_pain_solution.mp4` |
| **Format** | Single video |
| **Primary text** | Viz níže |
| **Headline** | `You've been awake for hours. There's a reason.` |
| **Description** | `Science-backed 7-night protocol. $5.` |
| **CTA button** | `Learn More` |
| **Destination URL** | `https://deep-sleep-reset.com/?utm_source=meta&utm_medium=paid&utm_campaign=cold&utm_content=adA_pain_solution` |

**Primary text (zkopírujte přesně):**
```
It's 3am. Your mind is racing. You've tried melatonin, white noise, chamomile tea.

Nothing works.

Here's the truth: you don't have a sleep problem. You have a brain pattern problem.

The 7-Night Deep Sleep Reset uses CBT-I — the same method sleep scientists call the "gold standard" — to retrain your brain to fall asleep naturally.

One simple action per night. 7 nights. $5.

👉 Try it tonight — risk free (30-day money back guarantee)
```

---

**AD 1A-2 — Video: V3 standalone (Pain hook, 8s)**

| Pole | Hodnota |
|---|---|
| **Soubor** | `v3_pain_overlay.mp4` |
| **Format** | Single video |
| **Headline** | `Still awake at 3am? This is why.` |
| **Description** | `Fix it in 7 nights. $5.` |
| **CTA button** | `Shop Now` |
| **Destination URL** | `https://deep-sleep-reset.com/?utm_source=meta&utm_medium=paid&utm_campaign=cold&utm_content=v3_pain` |

**Primary text:**
```
You've tried everything. Melatonin. Sleep podcasts. Counting sheep.

But you're still awake at 3am, staring at the ceiling, dreading tomorrow.

This isn't a willpower problem. Your brain learned to not sleep — and it can unlearn it.

The 7-Night Deep Sleep Reset: science-backed. 15 minutes per night. $5.

30-day money-back guarantee. No questions asked.
```

---

**AD 1A-3 — Static: Clock Hook**

| Pole | Hodnota |
|---|---|
| **Soubor** | `static-clock-hook.jpg` |
| **Format** | Single image |
| **Headline** | `It's 3am. Why can't you sleep?` |
| **Description** | `The 7-Night Deep Sleep Reset — $5` |
| **CTA button** | `Learn More` |
| **Destination URL** | `https://deep-sleep-reset.com/?utm_source=meta&utm_medium=paid&utm_campaign=cold&utm_content=static_clock` |

**Primary text:**
```
30% of adults struggle with insomnia. Most of them have tried everything.

The problem isn't your mattress. It's not your phone. It's a brain pattern — and it can be fixed.

CBT-I (Cognitive Behavioral Therapy for Insomnia) is the #1 doctor-recommended treatment for chronic sleep problems. We distilled it into a 7-night protocol.

$5. 15 minutes per night. Your first good night's sleep starts tonight.
```

---

### AD SET 1B — Broad Audience (Advantage+ Audience)

| Pole | Hodnota |
|---|---|
| **Název** | `DSR_Cold_Broad_Advantage_US` |
| **Lokace** | United States |
| **Věk** | 25–60 |
| **Pohlaví** | Všechna |
| **Targeting** | **Advantage+ Audience** — nechte Meta najít zákazníky samo |
| **Audience suggestion** | Zadejte: "People interested in sleep improvement, insomnia, wellness" |

> **Proč Broad?** Meta Advantage+ audience v roce 2025–2026 výrazně překonává manuální targeting pro produkty s jasným purchase signalem. Nechte algoritmus pracovat.

#### Kreativy v Ad Set 1B:

---

**AD 1B-1 — Static: Before/After**

| Pole | Hodnota |
|---|---|
| **Soubor** | `static-before-after.jpg` |
| **Headline** | `7 nights changed everything.` |
| **Description** | `From 3am insomnia to sleeping through the night.` |
| **CTA button** | `Learn More` |
| **Destination URL** | `https://deep-sleep-reset.com/?utm_source=meta&utm_medium=paid&utm_campaign=cold&utm_content=static_before_after` |

**Primary text:**
```
"By Night 4, I was falling asleep in 15 minutes. I actually cried the first morning I woke up feeling rested." — Sarah M., Austin TX ⭐⭐⭐⭐⭐

That's what happens when you stop treating the symptoms and start fixing the cause.

The 7-Night Deep Sleep Reset is based on CBT-I — the same method doctors prescribe for chronic insomnia. One action per night. No pills. No gimmicks.

$5 for 7 nights. 30-day money-back guarantee.

What do you have to lose?
```

---

**AD 1B-2 — Static: Stat Shock**

| Pole | Hodnota |
|---|---|
| **Soubor** | `static-stat-shock.jpg` |
| **Headline** | `1 in 3 adults can't sleep. You're not alone.` |
| **Description** | `And it's not your fault. Here's the fix.` |
| **CTA button** | `Learn More` |
| **Destination URL** | `https://deep-sleep-reset.com/?utm_source=meta&utm_medium=paid&utm_campaign=cold&utm_content=static_stat` |

**Primary text:**
```
1 in 3 adults suffers from insomnia. Most of them:

❌ Take melatonin (masks the problem)
❌ Try white noise (doesn't fix the root cause)
❌ Count sheep (makes it worse)

The root cause? Your brain has learned a pattern of NOT sleeping. And it can be untrained.

The 7-Night Deep Sleep Reset uses CBT-I — the gold standard treatment — to rewire your sleep in 7 nights.

$5. Instant access. 30-day guarantee.
```

---

**AD 1B-3 — Video: Ad B (Clock → Pain, 20s)**

| Pole | Hodnota |
|---|---|
| **Soubor** | `adB_clock_pain.mp4` |
| **Headline** | `Your brain learned to not sleep. It can unlearn it.` |
| **Description** | `7-night protocol. Science-backed. $5.` |
| **CTA button** | `Shop Now` |
| **Destination URL** | `https://deep-sleep-reset.com/?utm_source=meta&utm_medium=paid&utm_campaign=cold&utm_content=adB_clock_pain` |

**Primary text:**
```
It starts with one sleepless night.

Then two. Then it becomes your normal.

You stop expecting to sleep well. You start dreading bedtime. You wake up exhausted every single day.

This is called conditioned arousal — and it's the real reason you can't sleep.

The 7-Night Deep Sleep Reset breaks this cycle using the same techniques sleep scientists use in clinical trials.

Night 1: Sleep pressure reset
Night 2: Racing mind shutdown
Night 3: Body scan technique
Night 4: 4-7-8 breathing
Night 5: Light & dark protocol
Night 6: Stimulus control method
Night 7: Lock-in your new sleep pattern

$5. Start tonight.
```

---

## KAMPAŇ 2 — Warm Retargeting

### Nastavení kampaně

| Pole | Hodnota |
|---|---|
| **Cíl kampaně** | Sales |
| **Conversion event** | Purchase |
| **Budget type** | Campaign Budget Optimization (CBO) |
| **Daily budget** | $15/den |
| **Bid strategy** | Lowest cost |
| **Spustit** | Po 7 dnech od spuštění Kampaně 1 |

---

### AD SET 2A — Website Visitors (Nákoupili ne)

| Pole | Hodnota |
|---|---|
| **Název** | `DSR_Retarget_WebVisitors_30d` |
| **Custom Audience** | Website visitors — last 30 days |
| **Exclude** | Purchasers |
| **Lokace** | Worldwide (kde jsou vaši visitors) |

#### Kreativy v Ad Set 2A:

---

**AD 2A-1 — Static: Testimonial Card**

| Pole | Hodnota |
|---|---|
| **Soubor** | `static-testimonial.jpg` |
| **Headline** | `"By Night 4, I was finally sleeping." — Sarah M.` |
| **Description** | `Join 10,000+ people who fixed their sleep. $5.` |
| **CTA button** | `Shop Now` |
| **Destination URL** | `https://deep-sleep-reset.com/order?utm_source=meta&utm_medium=paid&utm_campaign=retarget&utm_content=testimonial` |

**Primary text:**
```
You visited. You were curious. But maybe $5 felt too good to be true.

Here's what real people say:

⭐⭐⭐⭐⭐ "I've struggled with insomnia for 10 years. By Night 4, I was falling asleep in 15 minutes. I actually cried." — Sarah M.

⭐⭐⭐⭐⭐ "I stopped taking melatonin completely. My wife noticed the difference before I did." — James K.

⭐⭐⭐⭐⭐ "As a nurse working night shifts, my sleep was destroyed. The protocol reset my circadian rhythm." — Maria L.

$5. 30-day money-back guarantee. What are you waiting for?
```

---

**AD 2A-2 — Video: V1 standalone (Clock, 12s)**

| Pole | Hodnota |
|---|---|
| **Soubor** | `v1_clock_overlay.mp4` |
| **Headline** | `Still thinking about it? Tonight could be different.` |
| **Description** | `30-day money-back guarantee. Zero risk.` |
| **CTA button** | `Shop Now` |
| **Destination URL** | `https://deep-sleep-reset.com/order?utm_source=meta&utm_medium=paid&utm_campaign=retarget&utm_content=v1_clock` |

**Primary text:**
```
You already know you need better sleep.

The question is: how many more sleepless nights are you willing to accept?

The 7-Night Deep Sleep Reset is $5. That's less than a single cup of coffee.

And if it doesn't work? Full refund. No questions. No forms. Just an email.

Tonight could be Night 1.
```

---

### AD SET 2B — Video Viewers (25%+ of any video)

| Pole | Hodnota |
|---|---|
| **Název** | `DSR_Retarget_VideoViewers_14d` |
| **Custom Audience** | Video viewers — 25%+ — last 14 days — all DSR videos |
| **Exclude** | Purchasers |

#### Kreativy v Ad Set 2B:

---

**AD 2B-1 — Static: Pain Sheets**

| Pole | Hodnota |
|---|---|
| **Soubor** | `static-pain-sheets.jpg` |
| **Headline** | `Your sheets don't lie. You haven't slept properly in months.` |
| **Description** | `Fix it in 7 nights. $5. 30-day guarantee.` |
| **CTA button** | `Learn More` |
| **Destination URL** | `https://deep-sleep-reset.com/order?utm_source=meta&utm_medium=paid&utm_campaign=retarget&utm_content=static_sheets` |

**Primary text:**
```
You watched the video. You know the problem.

Now let's fix it.

The 7-Night Deep Sleep Reset gives you one science-backed action per night. By Night 7, you'll have installed a new operating system for sleep in your brain.

Not a pill. Not a supplement. A skill.

$5. Instant access. 30-day money-back guarantee.

Click below. Start tonight.
```

---

**AD 2B-2 — Video: Ad C (Full story, 24s)**

| Pole | Hodnota |
|---|---|
| **Soubor** | `adC_full_story.mp4` |
| **Headline** | `7 nights. One action per night. $5.` |
| **Description** | `The science-backed sleep protocol that actually works.` |
| **CTA button** | `Shop Now` |
| **Destination URL** | `https://deep-sleep-reset.com/order?utm_source=meta&utm_medium=paid&utm_campaign=retarget&utm_content=adC_full_story` |

**Primary text:**
```
Most sleep advice is useless.

"Just relax." "Clear your mind." "Don't look at your phone."

The 7-Night Deep Sleep Reset is different. It's based on CBT-I — Cognitive Behavioral Therapy for Insomnia — the only treatment with decades of clinical evidence.

Night by night, you'll retrain your brain's sleep system. By Night 7, deep sleep becomes automatic.

$5. 30-day guarantee. Start tonight.
```

---

## KAMPAŇ 3 — Lookalike Scale

### Nastavení kampaně

| Pole | Hodnota |
|---|---|
| **Cíl kampaně** | Sales |
| **Budget type** | CBO |
| **Daily budget** | $20/den (zvyšte o 20% každých 3–5 dní pokud ROAS > 3×) |
| **Spustit** | Po 14 dnech a min. 50 purchase events |

---

### AD SET 3A — Lookalike 1% Purchasers

| Pole | Hodnota |
|---|---|
| **Název** | `DSR_LAL_1pct_Purchasers_US` |
| **Audience** | Lookalike 1% — Source: Purchasers custom audience |
| **Lokace** | United States |
| **Věk** | 25–60 |

#### Kreativy v Ad Set 3A:

Použijte **nejlepší 2 kreativy z Kampaně 1** (ty s nejnižším CPP a nejvyšším CTR po 7 dnech testování) + přidejte:

---

**AD 3A-1 — Static: Brain Value**

| Pole | Hodnota |
|---|---|
| **Soubor** | `static-brain-value.jpg` |
| **Headline** | `Your brain learned to not sleep. Here's how to fix it.` |
| **Description** | `CBT-I protocol. 7 nights. $5.` |
| **CTA button** | `Learn More` |
| **Destination URL** | `https://deep-sleep-reset.com/?utm_source=meta&utm_medium=paid&utm_campaign=lal&utm_content=static_brain` |

**Primary text:**
```
Sleep scientists have known for decades what actually fixes insomnia.

It's not melatonin. It's not white noise. It's not a new mattress.

It's CBT-I — Cognitive Behavioral Therapy for Insomnia.

The 7-Night Deep Sleep Reset distills the most effective CBT-I techniques into one simple action per night:

🌙 Night 1: Reset your sleep pressure
🧠 Night 2: Shut down the racing mind
💨 Night 4: The 4-7-8 breathing technique
☀️ Night 5: Circadian rhythm reset

7 nights. 15 minutes each. $5 total.

30-day money-back guarantee.
```

---

**AD 3A-2 — Video: V4 standalone (Breathing, 8s)**

| Pole | Hodnota |
|---|---|
| **Soubor** | `v4_breathing_overlay.mp4` |
| **Headline** | `This technique puts you to sleep in under 10 minutes.` |
| **Description** | `Used by Navy SEALs. Now in the 7-Night Deep Sleep Reset.` |
| **CTA button** | `Learn More` |
| **Destination URL** | `https://deep-sleep-reset.com/?utm_source=meta&utm_medium=paid&utm_campaign=lal&utm_content=v4_breathing` |

**Primary text:**
```
The 4-7-8 breathing technique was developed by Dr. Andrew Weil and used by military personnel to fall asleep in high-stress situations.

Inhale for 4 seconds. Hold for 7. Exhale for 8.

It works by activating your parasympathetic nervous system — the "rest and digest" mode that signals your brain it's safe to sleep.

This is just Night 4 of the 7-Night Deep Sleep Reset.

$5 for the full protocol. Start tonight.
```

---

**AD 3A-3 — Video: V2 standalone (Overhead, 8s)**

| Pole | Hodnota |
|---|---|
| **Soubor** | `v2_overhead_overlay.mp4` |
| **Headline** | `30% of adults can't sleep. You're not broken.` |
| **Description** | `Fix it in 7 nights. Science-backed. $5.` |
| **CTA button** | `Shop Now` |
| **Destination URL** | `https://deep-sleep-reset.com/?utm_source=meta&utm_medium=paid&utm_campaign=lal&utm_content=v2_overhead` |

**Primary text:**
```
You're not lazy. You're not broken. You're not "just a bad sleeper."

30% of adults struggle with insomnia — and most of them were never taught how sleep actually works.

Your brain has a built-in sleep system. When it gets disrupted (stress, irregular schedule, screens), it needs to be reset — not medicated.

The 7-Night Deep Sleep Reset teaches you how to reset it.

$5. 7 nights. Start tonight.
```

---

## Přehled všech 13 kreativ a jejich umístění

| # | Soubor | Kampaň | Ad Set | Primární funkce |
|---|---|---|---|---|
| 1 | `adA_pain_solution.mp4` | Kampaň 1 | 1A | Nejsilnější konverzní video |
| 2 | `v3_pain_overlay.mp4` | Kampaň 1 | 1A | Pain hook standalone |
| 3 | `static-clock-hook.jpg` | Kampaň 1 | 1A | Pattern interrupt statická |
| 4 | `static-before-after.jpg` | Kampaň 1 | 1B | Transformace/social proof |
| 5 | `static-stat-shock.jpg` | Kampaň 1 | 1B | Autoritative/educational |
| 6 | `adB_clock_pain.mp4` | Kampaň 1 | 1B | Double hook cold video |
| 7 | `static-testimonial.jpg` | Kampaň 2 | 2A | Social proof retargeting |
| 8 | `v1_clock_overlay.mp4` | Kampaň 2 | 2A | Urgency retargeting |
| 9 | `static-pain-sheets.jpg` | Kampaň 2 | 2B | Pain agitation retargeting |
| 10 | `adC_full_story.mp4` | Kampaň 2 | 2B | Full story retargeting |
| 11 | `static-brain-value.jpg` | Kampaň 3 | 3A | Value/educational LAL |
| 12 | `v4_breathing_overlay.mp4` | Kampaň 3 | 3A | Value hook LAL |
| 13 | `v2_overhead_overlay.mp4` | Kampaň 3 | 3A | Empathy LAL |

---

## Optimalizace a škálování

### KPI benchmarky (první 7 dní)

| Metrika | Cíl | Akce pokud pod cílem |
|---|---|---|
| **CTR (Link)** | > 1.5% | Vyměňte kreativu |
| **CPM** | < $15 | Zkontrolujte audience overlap |
| **CPC** | < $0.80 | Zkontrolujte headline relevanci |
| **Add to Cart rate** | > 8% | Optimalizujte landing page |
| **Purchase CVR** | > 3% | A/B testujte checkout |
| **CPP (Cost per Purchase)** | < $8 | Pokud > $8, pausujte ad set |
| **ROAS** | > 2.5× | Škálujte pokud > 3× |

### Pravidla škálování

**Škálujte (zvyšte budget o 20%)** pokud po 3 dnech:
- ROAS > 3× AND CPP < $5

**Pausujte kreativu** pokud po 3 dnech:
- CTR < 0.8% OR CPP > $12

**Duplikujte vítěze do nového ad setu** (nikdy neupravujte běžící reklamu):
- Zkopírujte ad set → zvyšte budget → nechte 48h learning phase

### A/B testování headlines (po prvním týdnu)

Otestujte tyto alternativní headlines pro nejlepší kreativy:

| Originál | Varianta A | Varianta B |
|---|---|---|
| `You've been awake for hours. There's a reason.` | `Why your brain won't let you sleep (and how to fix it)` | `The $5 fix for 10 years of insomnia` |
| `7 nights changed everything.` | `From 3am panic to sleeping through the night` | `What happens when you actually fix insomnia` |
| `Still awake at 3am? This is why.` | `Tired of being tired? This works.` | `The sleep technique doctors actually recommend` |

---

## Checklist před spuštěním

- [ ] Meta Pixel je nainstalován a ověřen v Events Manager
- [ ] Purchase event se správně odesílá po Stripe checkout
- [ ] Web je publikován na `deep-sleep-reset.com` (klikněte Publish)
- [ ] UTM parametry jsou v každé destination URL
- [ ] Custom audience "Purchasers" je vytvořena v Audiences
- [ ] Stripe live mode je aktivní (✅ hotovo)
- [ ] Všechny kreativy jsou nahrány do Meta Ads Manager
- [ ] Business verification je dokončena v Meta Business Suite

---

*Dokument připraven: Březen 2026 | Deep Sleep Reset Meta Ads Strategy*
