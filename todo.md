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
  - [ ] robots.txt + sitemap.xml
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
- [ ] Sekce uživatelských recenzí a hodnocení na Home stránce
- [ ] Real-time analytický panel pro admina (klíčové metriky)
- [ ] Email popup pro sběr kontaktů (exit-intent + timed)
- [ ] Přeložit celý funnel do angličtiny (Home, Quiz, QuizResult, Order, Upsell 1-3, ThankYou)
- [ ] Přeložit email sekvenci a potvrzovací emaily do angličtiny
- [ ] Aktualizovat OG tagy pro anglický trh
- [ ] Přidat low-tier tržní optimalizaci (mobilní, pomalé připojení)

## Behaviorální psychologie & Neuro-marketing
- [ ] Přeložit celý funnel do angličtiny (Home, Quiz, QuizResult, Order, Upsell1-3, ThankYou, emaily)
- [ ] Cialdini principy: Scarcity, Social Proof, Authority, Reciprocity, Commitment na každé stránce
- [ ] Loss aversion framing na Order stránce ("Don't lose another night of sleep")
- [ ] Anchoring na upsell stránkách (původní cena přeškrtnutá)
- [ ] Progress bias v quizu (completion effect — "You're 80% done!")
- [ ] Micro-commitments sekvence (quiz → email → platba)
- [ ] Fear of Missing Out (FOMO) na Order stránce
- [ ] Sekce recenzí s photo avatary a verified badge
- [ ] Email lead capture popup (timed 8s + exit-intent)

## Heat Mapy & Behavior Analytics
- [ ] Click tracking na každý element (button, link, chronotype card)
- [ ] Scroll depth tracking (25%, 50%, 75%, 100%)
- [ ] Rage click detection
- [ ] Session time tracking per page
- [ ] Funnel drop-off tracking (kde lidé odcházejí)
- [ ] Heat mapa vizualizace v Admin dashboardu
- [ ] Behavior analytics panel v Admin (click density, scroll heatmap)

## Autonomní noční AI analyzátor (půlnoc)
- [ ] Cron job každou půlnoc (00:00)
- [ ] Sbírá data: konverze, A/B výsledky, drop-off body, revenue
- [ ] AI (LLM) analyzuje data a generuje insights
- [ ] Automaticky aktualizuje A/B varianty (vítěz dostane 70% traffic)
- [ ] Generuje denní report a posílá notifikaci vlastníkovi
- [ ] Ukládá historii optimalizací do DB
