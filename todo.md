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
- [ ] Kliken 3.0 scripty pro 3 Reels (timing, text overlay, voiceover, CTA)
- [ ] AI content generátor endpoint (/api/content/generate) — LLM generuje Reels scripty, captions, hashtags
- [ ] Admin dashboard — Content Generator tab s formulářem a výstupem
- [ ] Automatické denní generování 3 postů (cron job 6am)
- [ ] Content history — uložení vygenerovaného obsahu do DB

## Premium Subscription Program (Klein + Hormozi)
- [ ] Navrhnout Premium program strukturu (tiers, ceny, obsah, identity)
- [ ] Stripe recurring subscription ($9.99/měsíc nebo $27/měsíc)
- [ ] Member area — chráněné stránky pro předplatitele
- [ ] Měsíční nový obsah (Sleep Protocol updates, nové audio, nové guides)
- [ ] Komunita identita — "Sleep Optimizers" brand
- [ ] Upgrade CTA v ThankYou stránce a email sekvenci
- [ ] Admin dashboard — subscription metrics (MRR, churn, LTV)

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
