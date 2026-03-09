# Deep Sleep Reset — Final Integration Todo

## Phase 0: UI Polish
- [x] Add subtle animation to "You Are Not Alone. And This Is Not Your Fault." heading

## Phase 1: Pricing $5 base + $4 exit popup
- [x] Revert Home.tsx $7 → $5
- [x] Update ExitIntentPopup: $5→$4 discount (20% off)
- [x] Update checkout.ts: frontEnd=$5, exitDiscount=$4
- [x] Update StickyMobileCTA pricing
- [x] Update Affiliates page commission structure for $5 (removed ClickBank, direct affiliate program)

## Phase 2: Full-stack upgrade + Stripe
- [x] Run webdev_add_feature web-db-user
- [x] Run webdev_add_feature stripe
- [x] Create Stripe products ($5 front-end, $4 exit discount, $10 upsell1, $10 upsell2)
- [x] Set up Stripe checkout sessions with redirect URLs
- [x] Create webhook handler for successful payments
- [x] Wire CTA buttons to Stripe checkout
- [x] Create orders table in database schema
- [x] Write vitest tests for checkout and chat (8 tests passing)

## Phase 3: AI Sales Chatbot
- [x] Create chatbot component with timed activation (45s or 50% scroll)
- [x] Connect to LLM API (Gemini) for intelligent conversation
- [x] Implement proactive engagement based on scroll position
- [x] Sales-focused personality: Lucie (inspired by Leila Hormozi)
- [x] Chatbot appears after trigger, not visible by default

## Phase 3b: UI Fixes
- [x] Replace video placeholder with featured testimonial block

## Phase 4: Spanish Translation (South America)
- [ ] Create i18n context and translation system
- [ ] Translate all sales page copy to Spanish
- [ ] Translate upsell pages to Spanish
- [ ] Add /es route prefix for Spanish version
- [ ] Language detection or switcher

## Phase 5: Email Automation
- [x] Integrate Brevo/Sendinblue API
- [x] Set up welcome email after purchase
- [x] Set up upsell email sequence
- [x] Test email delivery (Brevo IP authorized, all 4 email tests passing)

## Phase 6: E2E Testing
- [x] Test Stripe checkout session creation (vitest)
- [x] Test chatbot AI conversation (vitest)
- [ ] Test Stripe test mode purchase flow (manual)
- [ ] Test upsell redirect chain (manual)
- [ ] Test thank-you page Purchase event (manual)
- [x] Test email delivery (Brevo IP authorized, all 4 email tests passing) after purchase
- [ ] Test Spanish version end-to-end

## Phase 7: Order Bump + Funnel Flow
- [x] Create /order page with order bump modules (add-ons before checkout)
- [x] Add 2-3 bump modules: Audio Pack (+$10), Toolkit (+$10)
- [x] Wire Home CTA buttons to /order page instead of direct Stripe checkout
- [x] Create Stripe bundle product for order bump (createBundleCheckoutSession)
- [x] Fix chatbot name: Lucy (EN) / Lucie (ES)
- [x] Verify full funnel: Home → /order → Stripe → Upsell1 → Upsell2 → ThankYou

## Phase 8: AI Audio Pack
- [x] Write guided meditation scripts for all 5 Anxiety Dissolve sessions
- [x] Generate AI TTS audio files using Gemini TTS API
- [x] Upload audio files to CDN
- [ ] Wire audio player to actual CDN URLs in Upsell1 / member area

## Phase 9: Favicon + SEO + Meta Pixel
- [x] Nasadit Meta Pixel base code (ID: 2291810691310549) do index.html
- [x] Purchase event na ThankYou stránce
- [x] SEO meta tagy + Open Graph + structured data (Product schema)
- [x] Nastavit logo jako favicon (moon icon, CDN URL v index.html)
- [x] ViewContent event na sales page (Home.tsx)
- [x] InitiateCheckout event na /order stránce (OrderBump.tsx)
- [x] Přidat pulzující scroll šipku do spodní části hero sekce
