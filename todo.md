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
- [x] Test Stripe test mode purchase flow (manual)
- [x] Test upsell redirect chain (manual)
- [x] Test thank-you page Purchase event (manual)
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

## Phase 18: Blog Comments, Ratings & Newsletter
- [x] Add blog_comments and newsletter_subscribers tables to schema
- [x] Build tRPC procedures: addComment, listComments, ratePost, subscribeNewsletter
- [x] Expand bulkGenerate to 20 topics (sleep + mindfulness)
- [x] Add comment/rating section to BlogPost page
- [x] Add newsletter subscription form to Blog listing page
- [x] Write tests for new procedures

## Phase 19: Conversion Rate Optimization
- [x] Sleep Score Quiz: 5-question lead gen quiz with personalized result + email capture
- [x] Live Visitor Counter on offer section (real-time social proof + scarcity)
- [x] Urgency Pricing Timer on offer section (session-based countdown)
- [x] Progress Bar Checkout (step indicator in OrderBump page enhanced)
- [x] Conversion Analytics admin dashboard (funnel drop-off, quiz completions, lead sources, recommendations)
- [x] leadSources tRPC procedure + getLeadSourceStats DB helper
- [x] 105 tests passing

## Phase 20: Social Sharing + Exit Intent Popup [COMPLETED]
- [x] Sleep Score Quiz: social sharing buttons on results screen (Twitter/X, Facebook, WhatsApp, copy link)
- [x] Exit Intent Popup: wired into Home.tsx

## Phase 20b: A/B Hook Variants [COMPLETED]
- [x] Variant A: Sleep Score Quiz (existing) — social sharing added
- [x] Variant B: Chatbot Teaser Hook — animated chat bubble with pre-seeded curiosity opener
- [x] Variant C: Social Proof Wall Hook — live testimonial ticker + live counter
- [x] A/B router: 24h localStorage cache, deterministic assignment, track impressions + conversions
- [x] DB: ab_events table (variant, event_type, session_id, email, created_at)
- [x] tRPC: ab.trackEvent (public), ab.getStats (admin-only)
- [x] Admin Conversion tab: A/B test results table (impressions, conversions, CVR per variant, winner badge)
- [x] Write tests for A/B router (11 tests passing)

## Phase 21: Curiosity-Driven Sales Tone Rewrite [COMPLETED]
- [x] Rewrite hero headline to curiosity/aspiration frame ("Change your sleep — change your life")
- [x] Rewrite all CTAs to "price of one coffee" framing ($5 = 1 coffee)
- [x] Rewrite pain section: from fear/problem to curiosity/possibility
- [x] Rewrite product intro section: aspirational transformation language
- [x] Rewrite offer section: value-stacking with coffee price anchor
- [x] Rewrite quiz intro and result CTAs with new tone
- [x] Rewrite ExitIntentPopup copy with new tone
- [x] 122 tests passing

## Phase 22: Quiz Score Trend + Chatbot Script + Social Proof Media [COMPLETED]
- [x] DB: quiz_attempts table (session_id, score, label, created_at)
- [x] tRPC: quiz.saveAttempt (public), quiz.getHistory (by sessionId)
- [x] Quiz score trend chart (recharts LineChart, shows last 5 attempts, delta badge)
- [x] ChatbotTeaserHook: 3-question qualifying script with conditional CTA (high/medium/low urgency)
- [x] SocialProofWallHook: user-submitted photo/video testimonials (upload form + S3 + display)
- [x] DB: testimonial_media table (url, type, name, quote, rating, approved)
- [x] tRPC: testimonialMedia.submit, testimonialMedia.listApproved, testimonialMedia.moderate (admin)
- [x] Admin: approve/reject media testimonials in Testimonials tab
- [x] multer upload endpoint: POST /api/upload/testimonial → S3
- [x] 136 tests passing

## Phase 23: Chatbot A/B Script + Quiz Notes + Social Proof Filter [COMPLETED]
- [x] ChatbotTeaserHook: A/B test 2 qualifying question sets (Empathetic Coach vs Direct Disruptor)
- [x] ChatbotTeaserHook: script variant tracked in ab_events metadata field
- [x] DB: note column added to quiz_attempts table (varchar 280)
- [x] tRPC: quiz.updateNote procedure (ownership verified by sessionId)
- [x] Quiz Score Trend chart: inline per-attempt note editor (click to edit, Enter/Escape)
- [x] Quiz Score Trend chart: notes shown in recharts Tooltip on hover
- [x] SocialProofWallHook: filter tabs (All / Photos / Videos) with live counts per type
- [x] SocialProofWallHook: empty state per filter ("No photos yet — be the first!")
- [x] 136 tests passing

## Phase 24: Routing Fix + Meta CAPI + Community Stories + Quiz Tips
- [x] Fix 404 on published site for /admin and other client-side routes (SPA fallback)
- [x] Meta Conversions API: server-side Purchase event from Stripe webhook
- [x] Meta Conversions API: server-side Lead event from leads.capture
- [x] Meta Conversions API: server-side InitiateCheckout from checkout
- [ ] Community Stories: DB table, tRPC procedures, /stories page
- [ ] Community Stories: submission form with name, story, sleep improvement, rating
- [ ] Community Stories: landing page section linking to /stories
- [ ] Quiz results: personalized sleep tips based on specific question answers
- [ ] Write tests for new procedures

## Phase 24: ChatGPT Funnel System Implementation
- [x] OrderBump page rewrite: "Don't Stop at 60%" headline, Anxiety Shutdown Audio $29→$10, Sleep Optimizer Toolkit $27→$10, Bundle $14 (default checked), Stripe checkout
- [x] Post-purchase upsell page: "Advanced Protocol $19" shown after Stripe success_url before thank-you
- [x] 6-email Brevo post-purchase sequence: immediate, Day1, Day2 upsell push, Day3, Day5 social proof, Day7 recovery
- [x] Abandoned checkout recovery email via Brevo
- [x] Meta Pixel: ViewContent, InitiateCheckout, Purchase events (client-side)
- [x] Meta CAPI: server-side Purchase + Lead events from Stripe webhook
- [x] Admin Ads KPI dashboard tab: Spend/CTR/CPC/CPA/Revenue/AOV/Profit with kill/scale thresholds
- [x] 3 A/B hero headline variants updated with ChatGPT copy
- [x] Write tests for new procedures (146 tests passing)
- [x] Complete end-to-end flow test: homepage → quiz → order → Stripe test payment → upsells → thank you
- [x] Fixed Upsell2 skip link to route to Upsell3 instead of Thank You

## Phase 25: Checkout Button Color A/B Test
- [x] Add button color variants to A/B test system (amber/gold, green, blue) — ab-button.ts with 24h TTL
- [x] Wire OrderBump checkout button to display assigned color variant
- [x] Track button color variant in ab_events on impression + checkout click
- [x] Add admin analytics for button color A/B test results (emoji swatches in A/B table)
- [x] Write vitest tests for button color A/B test (16 tests, 162 total passing)
- [x] Verify in browser — all 3 variants render correctly

## Phase 25b: Mobile Bug Fix
- [x] Fix chatbot bubble overlapping CTA button on mobile (increased bottom offset from 5.5rem to 7rem)

## Phase 26: Price A/B Test ($5 vs $7)
- [x] Create ab-price.ts utility: 2 variants (price_5/$5 control, price_7/$7 challenger), 50/50 split, 24h TTL
- [x] Add frontEnd7 ($7) Stripe product to products.ts
- [x] Extend ab_events schema: add price_5, price_7 to variant enum
- [x] Extend ab.trackEvent procedure to accept price variants
- [x] Wire price A/B test into OrderBump.tsx: show dynamic price, use correct Stripe product on checkout
- [x] Track impression on /order page load, conversion on checkout click
- [x] Update Admin A/B stats table to show price variants (💵 $5 Control / 💰 $7 Challenger)ts
- [x] Write vitest tests for price A/B test (17 tests, 179 total passing)
- [x] Verify in browser — both price points render and route to correct Stripe product

## Phase 26b: Hero Parallax Background
- [x] Parallax already implemented (translateY(scrollY * 0.3) + scale(1.1)) — confirmed working

## Phase 26c: Bug Fixes
- [x] Fix all broken CTAs — root cause: localePath used as string instead of called as function in goToOrder()

## Phase 27: Disable Audio Add-on (Not Ready)
- [ ] Disable "Anxiety Shutdown Audio" add-on on OrderBump — uncheck by default, disable checkbox, grey out card, exclude from price/order summary

## Phase 27: Disable Audio Add-on + Test Coupon
- [x] Disable "Anxiety Shutdown Audio" add-on — unchecked by default, overlay "Coming Soon — Audio files in production", excluded from price/checkout
- [x] Create 99.9% off Stripe test coupon TEST999 via Stripe API

## Phase 28: Post-Purchase Audio Upsell on Thank-You Page
- [x] Set sessionStorage flag "skipped_audio_upsell" when user clicks decline on Upsell1
- [x] Detect flag on ThankYou page and show audio upsell section (show-once, flag removed after read)
- [x] Audio upsell card: amber border, sessions list, $29→$10 price, CTA button, dismiss link
- [x] Wire CTA to openCheckout("upsell1") with loading state
- [x] 12 vitest tests for detection logic (191 total passing)

## Phase 30: Countdown Timer + OG Tags + Funnel Test
- [ ] Add 15-minute countdown timer to audio upsell on thank-you page (resets on each visit, hides when expired)
- [ ] Add OG meta tags dynamically to /order page (react-helmet or server-side)
- [ ] Test full purchase funnel with TEST999 coupon end-to-end

## Phase 26: Sale Notification Email
- [x] Slavnostní email notifikace na petr.matej@gmail.com při každém prodeji (přes Brevo) + celkový kumulativní zisk v emailu
