/*
 * Privacy Policy Page
 * Design: Midnight Noir — consistent with all pages
 * Required for Meta Ads compliance
 */

import { Moon } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <p className="text-foreground/40 text-sm mb-12">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <div className="space-y-10 text-foreground/65 leading-relaxed">
          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              1. Introduction
            </h2>
            <p>
              Deep Sleep Reset ("we," "our," or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you visit our website and purchase our digital products.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              2. Information We Collect
            </h2>
            <p className="mb-3">We may collect the following types of information:</p>
            <p>
              <strong className="text-foreground/75">Personal Information:</strong> When you make a purchase,
              we collect your name, email address, and payment information. Payment processing is handled
              by our third-party payment processor; we do not store your credit card details on our servers.
            </p>
            <p className="mt-3">
              <strong className="text-foreground/75">Usage Data:</strong> We automatically collect certain
              information when you visit our website, including your IP address, browser type, operating
              system, referring URLs, and pages viewed. This data helps us improve our services.
            </p>
            <p className="mt-3">
              <strong className="text-foreground/75">Cookies and Tracking Technologies:</strong> We use
              cookies, web beacons, and similar technologies (including the Meta Pixel) to track activity
              on our website, measure the effectiveness of our advertising, and deliver relevant content.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside mt-3 space-y-2 pl-2">
              <li>Process your purchases and deliver digital products</li>
              <li>Send you transactional emails related to your order</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Improve our website, products, and services</li>
              <li>Analyze website usage and advertising performance</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              4. Meta (Facebook) Pixel
            </h2>
            <p>
              We use the Meta Pixel on our website. This technology allows us to measure the effectiveness
              of our advertising by understanding the actions people take on our website. The Meta Pixel
              may collect information such as your IP address, browser information, page views, and
              purchase events. This data is used to deliver targeted advertisements and optimize our
              ad campaigns. You can learn more about how Meta uses your data by visiting{" "}
              <a
                href="https://www.facebook.com/privacy/policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber hover:text-amber-light underline underline-offset-2"
              >
                Meta's Privacy Policy
              </a>.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              5. Third-Party Services
            </h2>
            <p>
              We may use third-party services that collect, monitor, and analyze data to improve our
              service. These third parties have their own privacy policies addressing how they use such
              information. Our third-party service providers include payment processors, email marketing
              platforms, and analytics services.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              6. Data Retention
            </h2>
            <p>
              We retain your personal information only for as long as necessary to fulfill the purposes
              for which it was collected, including to satisfy any legal, accounting, or reporting
              requirements. When we no longer need your information, we will securely delete or
              anonymize it.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              7. Your Rights
            </h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information,
              including the right to access, correct, delete, or port your data. To exercise any of these
              rights, please contact us at the email address provided below.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              8. Children's Privacy
            </h2>
            <p>
              Our services are not intended for individuals under the age of 18. We do not knowingly
              collect personal information from children. If you believe we have collected information
              from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-foreground/85 mb-3">
              10. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:{" "}
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
              <span className="text-amber/50">Privacy Policy</span>
              <Link href="/terms" className="hover:text-foreground/60 transition-colors">Terms of Service</Link>
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
