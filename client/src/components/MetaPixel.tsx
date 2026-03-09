/*
 * Meta Pixel Integration Component
 * 
 * HOW TO USE:
 * 1. Replace 'YOUR_PIXEL_ID' below with your actual Meta Pixel ID
 * 2. The component is already integrated into App.tsx and loads on every page
 * 3. Standard events (PageView) fire automatically on each route change
 * 4. Use trackEvent() helper to fire custom events (Purchase, AddToCart, etc.)
 * 
 * To get your Pixel ID:
 * - Go to Meta Events Manager: https://business.facebook.com/events_manager
 * - Click "Connect Data Sources" → "Web" → "Meta Pixel"
 * - Copy your Pixel ID (a 15-16 digit number)
 */

import { useEffect } from "react";
import { useLocation } from "wouter";

// ⚠️ REPLACE THIS WITH YOUR ACTUAL META PIXEL ID
const META_PIXEL_ID = "YOUR_PIXEL_ID";

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

  // Initialize the pixel on mount
  useEffect(() => {
    if (META_PIXEL_ID === "YOUR_PIXEL_ID") {
      console.log(
        "%c[Meta Pixel] Pixel ID not configured. Replace 'YOUR_PIXEL_ID' in MetaPixel.tsx with your actual Pixel ID.",
        "color: #d4a853; font-weight: bold;"
      );
      return;
    }

    const w = window as unknown as Record<string, unknown>;
    if (w.fbq) return; // Already initialized

    // Inject Meta Pixel script
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    // Initialize fbq queue before script loads
    const queue: unknown[][] = [];
    const fbq = function (...args: unknown[]) {
      queue.push(args);
    };
    w.fbq = fbq;
    w._fbq = fbq;

    script.onload = () => {
      // After script loads, fbq is replaced by the real function
      // Replay queued calls
      callFbq("init", META_PIXEL_ID);
      callFbq("track", "PageView");
    };
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (META_PIXEL_ID === "YOUR_PIXEL_ID") return;
    callFbq("track", "PageView");
  }, [location]);

  if (META_PIXEL_ID === "YOUR_PIXEL_ID") return null;

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
