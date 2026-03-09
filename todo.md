# Deep Sleep Reset — Final Integration Todo

## Phase 0: UI Polish
- [x] Add subtle animation to "You Are Not Alone. And This Is Not Your Fault." heading

## Phase 1: Pricing $5 base + $4 exit popup
- [x] Revert Home.tsx $7 → $5
- [ ] Update ExitIntentPopup: $5→$4 discount (20% off)
- [ ] Update checkout.ts: frontEnd=$5, exitDiscount=$4
- [ ] Update StickyMobileCTA pricing
- [ ] Update Affiliates page commission structure for $5

## Phase 2: Full-stack upgrade + Stripe
- [ ] Run webdev_add_feature web-db-user
- [ ] Run webdev_add_feature stripe
- [ ] Create Stripe products ($5 front-end, $4 exit discount, $10 upsell1, $10 upsell2)
- [ ] Set up Stripe checkout sessions with redirect URLs
- [ ] Create webhook handler for successful payments
- [ ] Wire CTA buttons to Stripe checkout

## Phase 3: AI Sales Chatbot
- [ ] Create chatbot component with timed activation (30-45s or 50% scroll)
- [ ] Connect to Gemini API for intelligent conversation
- [ ] Implement proactive engagement based on scroll position
- [ ] Sales-focused personality: friendly sleep expert
- [ ] Hidden by default, controllable via admin

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
- [ ] Test Stripe test mode purchase flow
- [ ] Test upsell redirect chain
- [ ] Test thank-you page Purchase event
- [ ] Test chatbot activation and conversation
- [ ] Test email delivery after purchase
- [ ] Test Spanish version end-to-end
