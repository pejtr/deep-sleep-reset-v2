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
- [x] Označit audio soubory jako neaktivní (Coming Soon) v Audio Pack sekci
- [x] Opravit SEO: title (30-60 znaků), meta description (50-160 znaků), keywords

## Phase 10: Meta Ads Launch Preparation
- [ ] Vytvořit branded Open Graph obrázek (1200x630px) s názvem produktu a cenou
- [ ] Aktualizovat OG meta tag v index.html s novým obrázkem
- [ ] Vytvořit SEO blog obsah (2-3 posty z keyword CSV dat)
- [ ] Přidat /blog route a blog stránky do App.tsx
- [ ] Ověřit Stripe live mode readiness (live klíče)
- [ ] Finální audit funnelu před Meta ads spuštěním

## Phase 11: Conversion Optimization
- [x] Add email capture flow to SalesChatbot (after engagement, before CTA)
- [x] Implement A/B test for homepage headline (track variant → conversion rate)

## Phase 12: Chatbot & Checkout Enhancements
- [x] AI key info extraction from chat (sleep issues, objections, intent signals)
- [x] Satisfaction survey at end of chatbot conversation (1-5 stars + comment)
- [x] One-click purchase for returning customers (detect prior purchase, skip order bump)

## Phase 9b: Meta Pixel Bundle Fix
- [x] Fix bundle checkout success_url to pass total value dynamically to Meta Pixel
- [x] Verify all funnel pages fire correct Purchase/InitiateCheckout events with dynamic value

## Phase 13: Meta Conversions API (Server-Side)
- [ ] Get Meta Pixel Access Token from Events Manager
- [ ] Add META_PIXEL_ID and META_CAPI_TOKEN to secrets
- [ ] Create server/meta-capi.ts helper for sending events
- [ ] Fire server-side Purchase event from Stripe webhook (after successful payment)
- [ ] Fire server-side Lead event from leads.capture tRPC procedure
- [ ] Fire server-side InitiateCheckout event from checkout.createBundleSession
- [ ] Write vitest tests for CAPI helper

## Phase 14: Admin Panel — Conversion & Real-time Analytics
- [x] Admin analytics tRPC procedures (revenue, orders, funnel, chatbot insights)
- [x] Admin dashboard page with KPI cards (revenue, conversions, AOV, CVR)
- [x] Funnel drop-off visualization (order → upsell1 → upsell2 → thank-you)
- [x] Orders table with search, filter, pagination
- [x] Chatbot insights & survey results table
- [x] Real-time refresh (auto-poll every 30s)
- [x] Admin route guard (owner-only access)
- [x] Admin navigation entry in header/sidebar

## Phase 15: Stripe Live Mode Switch
- [ ] Update STRIPE_SECRET_KEY to live key (sk_live_...)
- [ ] Update VITE_STRIPE_PUBLISHABLE_KEY to live key (pk_live_...)
- [ ] Update STRIPE_WEBHOOK_SECRET to live webhook signing secret
- [ ] Register live webhook endpoint in Stripe Dashboard
- [ ] Verify live mode checkout works end-to-end

## Phase 16: Testimonial Collection Flow
- [ ] Add testimonials table to database schema
- [ ] Build tRPC procedures: submit, approve/reject, list approved
- [ ] Add Day 7 survey email to email sequence templates
- [ ] Build public /testimonial page with star rating + text form
- [ ] Build admin moderation UI in /admin (new Testimonials tab)
- [ ] Auto-display approved testimonials on landing page
- [ ] Write tests for testimonial router

## Phase 17: Organic Traffic / SEO
- [ ] Technical SEO: dynamic sitemap.xml endpoint
- [ ] robots.txt with sitemap reference
- [ ] SEO meta tags component (title, description, canonical, OG, Twitter Card)
- [ ] JSON-LD structured data: Product, FAQ, Review, BreadcrumbList schemas
- [ ] Blog system: DB schema, tRPC router, public /blog and /blog/:slug pages
- [ ] Generate 10 SEO-optimized blog articles (sleep keywords)
- [ ] Internal linking: blog → landing page CTAs
- [ ] Admin: blog post manager (create, edit, publish, unpublish)
- [ ] Write tests for SEO/blog router
