# Deep Sleep Reset V2 — TODO

## Funnel Architektura
```
FB/IG Post → Landing Page (Hero + Quiz) → Quiz Výsledek + CTA
→ Order Page ($1 tripwire) → OTO1 ($7) → OTO2 ($17) → OTO3 ($27) → Thank You
```

## Produkty (plně digitální, autonomní)
- Tripwire $1: "7-Night Deep Sleep Reset" — PDF průvodce + sleep schedule
- OTO1 $7:    "30-Day Sleep Transformation" — rozšířený program + tracker
- OTO2 $17:   "Chronotype Mastery Pack" — 4 audio guided sleep sessions (MP3)
- OTO3 $27:   "Deep Sleep Toolkit" — sleep journal template + habit tracker + bonus recipes

## Funnel Pages
- [x] Hero landing page (dark, mobile-first, FB/IG OG tags) s A/B headline testem
- [x] Chronotype Quiz (5 otázek → Lion/Bear/Wolf/Dolphin výsledek)
- [x] Quiz výsledek stránka s personalizovaným CTA
- [x] Order stránka ($1 tripwire, urgency timer, social proof)
- [x] OTO1 stránka ($7 — one-click upsell)
- [x] OTO2 stránka ($17 — one-click upsell)
- [x] OTO3 stránka ($27 — one-click upsell)
- [x] Thank You stránka (download links + email confirmation)

## Konverzní prvky
- [x] A/B test pro hero headline (4 varianty)
- [x] A/B test pro CTA button text (3 varianty)
- [x] Exit-intent popup (personalizovaný dle CTA varianty)
- [x] Social proof notification ("Pavel z Brna právě koupil...")
- [x] Countdown timer na order stránce (15 min urgency)
- [x] Progress bar v quizu
- [x] Scarcity element ("Pouze 47 míst zbývá dnes")
- [x] OG meta tags pro FB/IG sharing preview

## Databázové tabulky
- [x] quiz_results — výsledky quizu + email capture
- [x] orders — objednávky + upsell tracking
- [x] ab_test_impressions — A/B tracking
- [x] email_leads — email capture

## Backend API
- [x] POST /api/quiz/submit
- [x] POST /api/orders/create (Stripe session)
- [x] POST /api/orders/upsell (one-click upsell)
- [x] POST /api/stripe/webhook (opraveno — raw body handler)
- [x] GET /api/admin/stats
- [x] POST /api/ab-test/track

## Admin Dashboard
- [x] Revenue overview (total, per product, per day)
- [x] Funnel konverze (quiz → order → upsell rates)
- [x] A/B test výsledky
- [x] Email leads seznam

## Stripe
- [x] Tripwire $1 checkout
- [x] One-click upsell (bez re-zadání karty)
- [x] Webhook handler (opraveno)
- [x] Promo kód (TEST99OFF — Stripe allow_promotion_codes: true)

## Email Automation (autonomní)
- [x] Potvrzení nákupu + download link
  - [x] 7-denní email sekvence (automatická)
  - [x] Upsell follow-up emaily (den 5 a 7)

## SEO & Performance
- [x] OG tags (FB/IG preview optimalizace)
  - [x] robots.txt + sitemap.xml (client/public/)
- [x] Mobile-first, < 2s load time

## Testy
- [x] Vitest: funnel pricing (12 testů)
- [x] Vitest: auth logout (1 test)
- [x] Vitest: quiz logika (součást funnel.test.ts)
  - [x] Vitest: A/B test systém (součást funnel.test.ts)

## PDF Produkty (obsah)
- [x] Tripwire $1: "7-Night Deep Sleep Reset" PDF — CDN nahraný
- [x] OTO1 $7: "30-Day Sleep Transformation" PDF — CDN nahraný
- [x] OTO2 $17: "Chronotype Mastery Pack" PDF — CDN nahraný
- [x] OTO3 $27: "Deep Sleep Toolkit" PDF — CDN nahraný
- [x] Nahrát PDF na CDN a propojit s download endpointem

## Email Automatizace
- [x] Brevo integrace (petr.matej@gmail.com, API klíč ověřen)
- [x] Potvrzovací email po nákupu s download linkem
- [x] 7-denní email sekvence (dny 1, 2, 3, 5, 7)
- [x] Upsell follow-up email (den 5 a 7 sekvence)

## Nové funkce (přidáno)
- [x] Sekce uživatelských recenzí a hodnocení na Home stránce (ReviewsSection.tsx — 6 recenzí)
- [x] Real-time analytický panel pro admina (Admin.tsx — funnel, A/B, behavior, goal progress)
- [x] Email popup pro sběr kontaktů (EmailCapturePopup.tsx — timed 8s + exit-intent)
- [x] Přeložit celý funnel do angličtiny (Home, Quiz, QuizResult, Order, Upsell 1-3, ThankYou)
- [x] Přeložit emailService.ts do angličtiny ✓
- [x] Aktualizovat OG tagy pro anglický trh (index.html)
- [x] Přidat low-tier tržní optimalizaci (mobile-first design, lazy loading)

## Behaviorální psychologie & Neuro-marketing
- [x] Přeložit celý funnel do angličtiny ✓
- [x] Cialdini principy: Scarcity, Social Proof, Authority, Reciprocity, Commitment ✓
- [x] Loss aversion framing na Order stránce ✓
- [x] Anchoring na upsell stránkách (přeškrtnuté ceny) ✓
- [x] Progress bias v quizu ("You're X% done!") ✓
- [x] Micro-commitments sekvence (quiz → email popup → platba) ✓
- [x] Fear of Missing Out (FOMO) na Order stránce ✓
- [x] Sekce recenzí s avatary a verified badge (ReviewsSection.tsx) ✓
- [x] Email lead capture popup (timed 8s + exit-intent) ✓

## Heat Mapy & Behavior Analytics
- [x] Click tracking na každý element (/api/behavior/track) ✓
- [x] Scroll depth tracking (25%, 50%, 75%, 100%) ✓
- [x] Rage click detection (useBehaviorTracker.ts) ✓
- [x] Session time tracking per page ✓
- [x] Funnel drop-off tracking (behaviorEvents tabulka) ✓
- [x] Heat mapa vizualizace v Admin dashboardu (BehaviorAnalyticsPanel.tsx)
- [x] Behavior analytics panel v Admin (BehaviorAnalyticsPanel.tsx — funnel drop-off, scroll depth, click heatmap, rage clicks)

## Autonomní noční AI analyzátor (půlnoc)
- [x] Cron job každou půlnoc (scheduleNightlyAnalysis v index.ts) ✓
- [x] Sbírá data: konverze, A/B výsledky, drop-off body, revenue ✓
- [x] AI (LLM) analyzuje data a generuje insights (nightlyAnalyzer.ts) ✓
- [x] Automaticky aktualizuje A/B varianty (/api/ab-test/winner — vítěz dostane 70% traffic)
- [x] Generuje denní report a posílá notifikaci vlastníkovi ✓
- [x] Ukládá historii optimalizací do DB (optimizationHistory v behavior summary)

## Opravy mezer (identifikováno systémem)
- [x] A/B traffic allocation — ab_test_weights tabulka, 70/30 split, persist do DB
- [x] Optimization history — optimization_history tabulka, write v ab-test/winner, read v behavior/summary
- [x] Behavior summary — reálné dropoffByPage z behavior_events, abWinners a optimizationHistory z DB
- [x] robots.txt + sitemap.xml (client/public/)

## Finální opravy (systémem identifikované mezery 2)
- [x] Weighted variant selection — Home.tsx načítá ab_test_weights z /api/behavior/summary a aplikuje 70/30 split (getOrSetVariant s weights param)
- [x] Testy pro /api/ab-test/winner persistence a /api/behavior/summary — analytics.test.ts (12 testů), 27/27 celkem
- [x] True funnel drop-off percentages — dropoffByPage vrací { visitors, dropoffRate, nextStep } pro každý krok
- [x] Error handling pro optimization_history writes — try/catch s console.error (ne silent)

## Kliken 3.0 + AI Content Generátor
- [x] Kliken 3.0 scripty pro 3 Reels (timing, text overlay, voiceover, CTA) — viz contentCron.ts reel_script type
- [x] AI content generátor endpoint (/api/admin/generate-content) — LLM generuje Reels scripty, captions, hashtags
- [x] Admin dashboard — Content Generator tab s formulářem a výstupem
- [x] Automatické denní generování 3 postů (cron job 6am) — contentCron.ts + scheduleDailyContentGeneration()
- [x] Content history — uložení vygenerovaného obsahu do DB — content_history tabulka + /api/admin/content-history

## Premium Subscription Program (Klein + Hormozi)
- [x] Navrhnout Premium program strukturu (tiers, ceny, obsah, identity)
- [x] Stripe recurring subscription ($9.99/měsíc nebo $27/měsíc)
- [x] Member area — chráněné stránky pro předplatitele — /members (Members.tsx)
- [x] Měsíční nový obsah (Sleep Protocol updates, nové audio, nové guides) — member_content tabulka + Members.tsx content library
- [x] Komunita identita — "Sleep Optimizers" brand
- [x] Upgrade CTA v ThankYou stránce a email sekvenci
- [x] Admin dashboard — subscription metrics (MRR, churn, LTV)

## Premium Redesign & Klein Princip (dokončeno)
- [x] Premium redesign Home.tsx — Playfair Display, glassmorphism, premium hero, value stack
- [x] Premium stránka /premium — Sleep Optimizers Community s Klein principem a Hormozi value stackem
- [x] Premium redesign Order.tsx — glassmorphism cards, chronotype colors, value stack s cenami
- [x] Premium redesign ThankYou.tsx — identity upsell, Premium teaser po 8s, premium feel
- [x] Admin: Subscriptions tab — tier metrics, Klein identity metrics, MRR tracking
- [x] Admin: AI Content Generator tab — Hormozi-style content, email/social/ad copy
- [x] Backend: /api/admin/generate-content — LLM content generation endpoint
- [x] Backend: /api/subscriptions/create — Stripe recurring subscription checkout
- [x] App.tsx: /premium route přidána
- [x] CSS: Premium utility classes (glass-card, cta-premium, subscription-card-pro, badge-popular, trust-badge, stars-premium, orb-gold, animate-reveal)

## Kliken 3.0 Reels Scripty + Content Cron
- [x] Kliken 3.0 scripty pro 3 Reels (timing, text overlay, voiceover, CTA) — implementováno v Content Generator (reel_script typ)
- [x] Content history tabulka v DB + uložení vygenerovaného obsahu (contentHistory tabulka)
- [x] Cron job 6am — automatické denní generování 3 postů (contentCron.ts)
- [x] Member area /members — chráněná stránka pro předplatitele (Members.tsx)

## Zbývající mezery (identifikováno)
- [x] Vitest testy pro contentCron (scheduling, DB persistence, error handling) — 9 testů v content.test.ts
- [x] Member area: Members.tsx s content library, tier badges, upgrade CTA
- [x] Admin Content Generator: zobrazit historii vygenerovaného obsahu z DB

## Jazykové opravy
- [x] Opravit všechny české texty v notifikacích, toast zprávách a server hlášeních na angličtinu

## Design Redesign — Originální Estetika
- [x] Home.tsx — noční nebe hero background, zlatá amber typografie, serif Playfair Display
- [x] index.css — amber/gold tokeny, hero-photo třída, progress bar styl, cta-gold
- [x] Navigace — minimalistická s progress barem nahoře (jako originál) + scarcity ticker
- [x] Hero — fullscreen s noční oblohou, zlatý CTA button (cta-gold)

## A/B Test: Gold vs. Purple CTA Button
- [x] Přidat cta_color variant do A/B test systému (gold / purple) — CTA_COLOR_VARIANTS v Home.tsx
- [x] Rozšířit Home.tsx o purple CTA variantu s trackingem — všechna CTA tlačítka používají ctaColorVariant
- [x] Přidat statistickou analýzu (konverzní poměr, winner card, progress bar) do Admin dashboardu
- [x] Vitest testy pro A/B test logiku — 36 testů prochází

## Bug Fix
- [x] Opravit testimonial badge overflow — badge přesunut na vlastní řádek pod hvězdičkami, žádné překrývání

## FAQ Sekce
- [ ] Přidat FAQ accordion sekci do Home.tsx (10-12 otázek, snížit support dotazy)

## AI Chatbot Petra — Gentle Support pro Premium
- [x] Opravit poškozený JSX v Home.tsx (ReviewsSection + FAQ)
- [ ] FAQ komponenta (FAQSection.tsx) — 12 otázek, accordion, amber design
- [x] AI chatbot "Petra" v Members.tsx — Gentle Support pro Premium předplatitele
- [x] Backend endpoint /api/chat/petra — LLM s personou Petra (sleep expert, warm tone)
- [x] Chat UI v Members.tsx — floating button + slide-in panel

## Petra AI Chatbot — Premium Members
- [x] Backend: POST /api/chat/petra — LLM with Petra persona (warm, expert, proactive links)
- [x] Frontend: PetraChat.tsx component — floating button + slide-in panel, suggested prompts
- [x] Integration: Mount PetraChat in Members.tsx, wire to backend
- [x] Tests: Vitest for Petra endpoint (persona, error handling, auth guard) — 7 testů v petra.test.ts

## Pre-Launch QA
- [x] Opravit ECONNRESET chybu v emailScheduler (DB reconnect)
- [x] Všechny testy prochází (pnpm test) — 83/83 testů
- [x] 0 TypeScript chyb
- [x] Vizuální kontrola: Home, Order, ThankYou, Premium, Members, Admin
- [x] Checkpoint + publish instrukce

## Nové funkce (2026-04-21)
- [x] Microsoft Clarity heatmapy integrovány (VITE_CLARITY_PROJECT_ID nastaveno)
- [x] Petra AI Chatbot (globální floating widget na všech stránkách)
- [x] Opraveny upsell přesměrování (/upsell2 → /upsell/2, /upsell3 → /upsell/3)
- [x] Merge GitHub remote changes (feat: stats-snapshot endpoint)
- [x] Stripe platba otestována end-to-end ($1 → Upsell 1 → Thank You)

## Překlad webu — Multijazyčnost
- [ ] i18n infrastruktura — react-i18next setup, jazykový přepínač v navigaci
- [ ] Překlad do indonéštiny (Bahasa Indonesia) — Home, Order, ThankYou, Premium, Members, FAQ
- [ ] Překlad do vietnamštiny (Tiếng Việt) — všechny stránky
- [ ] Překlad do španělštiny (Español) — pro Mexico + latinskoamerický trh
- [ ] Překlad do portugalštiny (Português) — pro Brazil
- [ ] Přeložit email sekvence do 4 jazyků
- [ ] SEO meta tagy pro každý jazyk (hreflang)

## Bug: Stripe platby nefungují (2026-04-21) — NAHRAZENO GUMROAD
- [x] Diagnostikovat proč je karta odmítána — Stripe test mód, nahrazeno Gumroad
- [x] Opravit Stripe checkout integraci — nahrazeno Gumroad
- [ ] Otestovat platbu end-to-end na sleeprset-omp8ch8v.manus.space (po publish)

## PayPal Integrace — NAHRAZENO GUMROAD
- [x] Získat PayPal Client ID — nepotřeba, Gumroad přijímá PayPal automaticky
- [x] Backend: PayPal Orders API — nepotřeba, Gumroad řeší platby
- [x] Frontend: PayPal Smart Button — nahrazeno Gumroad checkout
- [x] Frontend: Upsell 1, 2, 3 — nahrazeno Gumroad
- [x] Webhook/IPN — Gumroad posílá emaily automaticky
- [x] Otestováno: Gumroad checkout otevírá správně

## Gumroad Integrace (náhrada Stripe — 2026-04-21)
- [x] Gumroad skript přidán do index.html
- [x] Order.tsx přepsán na Gumroad overlay (petrmatej.gumroad.com/l/fdtifc)
- [x] Upsell1.tsx přepsán na Gumroad
- [x] Upsell2.tsx přepsán na Gumroad
- [x] Upsell3.tsx přepsán na Gumroad
- [x] Backend /orders/create přidán useGumroad flag
- [x] DB migrace: přidán status 'pending_gumroad' do enum
- [x] Otestováno: Gumroad checkout se otevírá správně

## Reddit Organický Traffic (2026-04-21)
- [x] Vytvořit účet u/DeepSleepQuest (deepsleepreset@proton.me)
- [x] Nastavit bio profilu: "Sleep researcher & biohacker"
- [x] Joinovat r/sleep (325K weekly visitors)
- [x] Postovat příspěvek #1 na r/sleep: "I tracked my sleep for 90 days..."
- [ ] Postovat příspěvek #2 na r/insomnia (různý obsah)
- [ ] Postovat příspěvek #3 na r/productivity (sleep + výkon)
- [ ] Postovat příspěvek #4 na r/biohacking (chronotype + data)
- [ ] Joinovat a postovat na r/selfimprovement

## A/B Test Landing Page Varianty (3 verze)
- [ ] Varianta A (/lp/a): Emoční — "Tired of waking up exhausted every morning?"
- [ ] Varianta B (/lp/b): Data-driven — "87% of people with insomnia make this ONE mistake"
- [ ] Varianta C (/lp/c): Story-based — "How I fixed 3 years of insomnia in 7 nights"
- [ ] Implementovat routing /lp/:variant v App.tsx
- [ ] Sledovat konverze per varianta v admin dashboardu

## URL Aktualizace (2026-04-21)
- [ ] Aktualizovat reference sleeprset-omp8ch8v → deepsleepquest.manus.space v kódu
- [ ] Gumroad upsell produkty: OTO1 ttrsd $5, OTO2 cuhln $12, OTO3 ubsxk $19

## Prodejní Milník Notifikace (petr.matej@gmail.com)
- [ ] Email při 1. prodeji: "🎉 PRVNÍ PRODEJ! Gratulace!"
- [ ] Email při každém z prvních 10 prodejů (#2, #3, ... #10)
- [ ] Email při 100. prodeji: "🚀 100 PRODEJŮ! Milestone!"
- [ ] Backend: milestoneNotifier.ts — kontrola počtu prodejů po každém novém prodeji
- [ ] Brevo email šablony pro milníky
- [ ] Vitest testy pro milestone logiku
