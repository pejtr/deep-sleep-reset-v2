/*
 * Meta Pixel Integration Component
 * Pixel ID: 2291810691310549
 * 
 * Fires PageView on every route change.
 * Use trackEvent() helper to fire custom events (Purchase, AddToCart, etc.)
 */

import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

const META_PIXEL_ID = "2291810691310549";

// Helper to safely call fbq
function callFbq(...args: unknown[]) {
  const w = window as unknown as Record<string, unknown>;
  if (typeof w.fbq === "function") {
    (w.fbq as (...a: unknown[]) => void)(...args);
  }
}

/**
 * Track custom Meta Pixel events from anywhere in the app.
 * 
 * Usage:
 *   trackEvent('Purchase', { value: 5.00, currency: 'USD' });
 *   trackEvent('AddToCart', { value: 10.00, currency: 'USD', content_name: 'Anxiety Audio Pack' });
 *   trackEvent('InitiateCheckout');
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  if (params) {
    callFbq("track", eventName, params);
  } else {
    callFbq("track", eventName);
  }
}

export default function MetaPixel() {
  const [location] = useLocation();
  const initialized = useRef(false);

  // Initialize the pixel on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const w = window as unknown as Record<string, unknown>;
    if (w.fbq) return; // Already initialized externally

    // Inject Meta Pixel script
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    // Initialize fbq queue before script loads
    const fbq = function (...args: unknown[]) {
      (fbq as unknown as { queue: unknown[][] }).queue.push(args);
    };
    (fbq as unknown as { queue: unknown[][] }).queue = [];
    (fbq as unknown as { loaded: boolean }).loaded = true;
    (fbq as unknown as { version: string }).version = "2.0";
    w.fbq = fbq;
    w._fbq = fbq;

    callFbq("init", META_PIXEL_ID);
    callFbq("track", "PageView");
  }, []);

  // Track page views on route changes (skip first render, handled by init)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    callFbq("track", "PageView");
  }, [location]);

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
