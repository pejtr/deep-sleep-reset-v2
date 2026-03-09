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

## Phase 4: Spanish Translation (South America)
- [ ] Create i18n context and translation system
- [ ] Translate all sales page copy to Spanish
- [ ] Translate upsell pages to Spanish
- [ ] Add /es route prefix for Spanish version
- [ ] Language detection or switcher

## Phase 5: Email Automation
- [ ] Integrate Brevo/Sendinblue API
- [ ] Set up welcome email after purchase
- [ ] Set up upsell email sequence
- [ ] Test email delivery

## Phase 6: E2E Testing
- [x] Test Stripe checkout session creation (vitest)
- [x] Test chatbot AI conversation (vitest)
- [ ] Test Stripe test mode purchase flow (manual)
- [ ] Test upsell redirect chain (manual)
- [ ] Test thank-you page Purchase event (manual)
- [ ] Test email delivery after purchase
- [ ] Test Spanish version end-to-end
