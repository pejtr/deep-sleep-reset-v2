/*
 * Terms of Service Page
 * Design: Midnight Noir — consistent with all pages
 * Required for Meta Ads compliance
 */

import { Moon } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Moon className="w-5 h-5 text-amber" />
            <span className="font-[var(--font-display)] text-lg font-semibold tracking-wide text-amber">
              Deep Sleep Reset
            </span>
          </Link>
          <Link
            href="/"
            className="text-foreground/50 hover:text-amber text-sm transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold mb-2">
          Terms of Service
        </h1>
        <p className="text-foreground/40 text-sm mb-12">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="space-y-10 text-foreground/65 leading-relaxed">
          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using the Deep Sleep Reset website and purchasing our digital products,
              you agree to be bound by these Terms of Service. If you do not agree with any part of
              these terms, you may not access or use our services.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              2. Digital Products
            </h2>
            <p>
              Deep Sleep Reset offers digital information products, including but not limited to
              the 7-Night Deep Sleep Reset program, the Anxiety Dissolve Audio Pack, and the Sleep
              Optimizer Toolkit. These products are delivered electronically and are available for
              immediate access upon purchase.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              3. Pricing and Payment
            </h2>
            <p>
              All prices are listed in US Dollars (USD). Payment is processed securely through our
              third-party payment processor. By making a purchase, you represent that you are
              authorized to use the payment method provided. All sales are final, subject to our
              refund policy outlined below.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              4. Refund Policy
            </h2>
            <p>
              We offer a 30-day "Sleep Soundly or It's Free" money-back guarantee on all products.
              If you are not satisfied with your purchase for any reason, contact us within 30 days
              of your purchase date at{" "}
              <a
                href="mailto:support@deepsleepreset.com"
                className="text-amber hover:text-amber-light underline underline-offset-2"
              >
                support@deepsleepreset.com
              </a>{" "}
              and we will issue a full refund. No questions asked.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              5. Intellectual Property
            </h2>
            <p>
              All content, materials, and intellectual property associated with Deep Sleep Reset,
              including text, graphics, audio files, and digital products, are owned by us or our
              licensors. You are granted a limited, non-exclusive, non-transferable license to
              access and use the purchased products for personal, non-commercial use only. You may
              not reproduce, distribute, modify, or create derivative works from our content without
              prior written consent.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              6. Health Disclaimer
            </h2>
            <p>
              The information provided in our products is for educational and informational purposes
              only and is not intended as medical advice. Our products are not intended to diagnose,
              treat, cure, or prevent any disease or medical condition. Always consult with a
              qualified healthcare professional before starting any new health program, especially
              if you have a pre-existing medical condition or are taking medication. Individual
              results may vary.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              7. Earnings Disclaimer
            </h2>
            <p>
              Any testimonials or examples of results presented on our website are not guarantees
              of future performance. Individual results will vary based on many factors, including
              but not limited to individual health conditions, adherence to the program, and other
              lifestyle factors.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Deep Sleep Reset and its owners, employees,
              and affiliates shall not be liable for any indirect, incidental, special, consequential,
              or punitive damages arising out of or related to your use of our website or products.
              Our total liability shall not exceed the amount you paid for the product in question.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              9. Governing Law
            </h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws
              of the jurisdiction in which Deep Sleep Reset operates, without regard to its conflict
              of law provisions.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              10. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms of Service at any time. Changes will be
              effective immediately upon posting to this page. Your continued use of our services
              after any changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              11. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:{" "}
              <a
                href="mailto:support@deepsleepreset.com"
                className="text-amber hover:text-amber-light underline underline-offset-2"
              >
                support@deepsleepreset.com
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-border/20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-amber/50" />
              <span className="text-foreground/40 text-sm">Deep Sleep Reset</span>
            </div>
            <div className="flex items-center gap-6 text-foreground/30 text-sm">
              <Link href="/privacy" className="hover:text-foreground/60 transition-colors">Privacy Policy</Link>
              <span className="text-amber/50">Terms of Service</span>
              <a href="mailto:support@deepsleepreset.com" className="hover:text-foreground/60 transition-colors">Contact</a>
            </div>
            <p className="text-foreground/30 text-xs">
              &copy; {new Date().getFullYear()} Deep Sleep Reset. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
