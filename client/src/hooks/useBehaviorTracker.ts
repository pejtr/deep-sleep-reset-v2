/**
 * useBehaviorTracker — Behavioral psychology + heat map tracking hook
 * Tracks: clicks, rage clicks, scroll depth, session time, element interactions
 * Data-driven: every event feeds the nightly AI analyzer for funnel optimization
 */
import { useEffect, useRef, useCallback } from "react";

const SESSION_ID = Math.random().toString(36).slice(2, 10);

interface TrackEvent {
  event: string;
  page: string;
  product?: string;
  element?: string;
  depth?: number;
  duration?: number;
  x?: number;
  y?: number;
  ts?: number;
  sessionId?: string;
}

async function sendEvent(data: TrackEvent) {
  try {
    await fetch("/api/behavior/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, sessionId: SESSION_ID, ts: Date.now() }),
      keepalive: true,
    });
  } catch {
    // Never fail silently — analytics should never break the funnel
  }
}

export function useBehaviorTracker(page: string, product?: string) {
  const sessionStartRef = useRef<number>(Date.now());
  const clickTimestampsRef = useRef<number[]>([]);
  const scrollDepthRef = useRef<Set<number>>(new Set());
  const lastScrollRef = useRef<number>(0);

  // Track session start
  useEffect(() => {
    sessionStartRef.current = Date.now();
    sendEvent({ event: "page_view", page, product });

    // Track session end / page leave
    const handleBeforeUnload = () => {
      const duration = Math.round((Date.now() - sessionStartRef.current) / 1000);
      sendEvent({ event: "session_end", page, product, duration });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [page, product]);

  // Scroll depth tracking — 25%, 50%, 75%, 90%, 100%
  useEffect(() => {
    const THRESHOLDS = [25, 50, 75, 90, 100];

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;

      const pct = Math.round((scrollTop / docHeight) * 100);
      const now = Date.now();

      // Throttle: max 1 event per 500ms
      if (now - lastScrollRef.current < 500) return;
      lastScrollRef.current = now;

      for (const threshold of THRESHOLDS) {
        if (pct >= threshold && !scrollDepthRef.current.has(threshold)) {
          scrollDepthRef.current.add(threshold);
          sendEvent({ event: "scroll_depth", page, product, depth: threshold });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, product]);

  // Click tracking + rage click detection
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const element = target.tagName.toLowerCase() +
        (target.id ? `#${target.id}` : "") +
        (target.className && typeof target.className === "string"
          ? `.${target.className.split(" ")[0]}`
          : "");

      const now = Date.now();
      clickTimestampsRef.current.push(now);

      // Keep only clicks in last 2 seconds
      clickTimestampsRef.current = clickTimestampsRef.current.filter(
        (t) => now - t < 2000
      );

      // Rage click: 3+ clicks in 2 seconds on same area
      if (clickTimestampsRef.current.length >= 3) {
        sendEvent({
          event: "rage_click",
          page,
          product,
          element,
          x: Math.round(e.clientX),
          y: Math.round(e.clientY),
        });
        clickTimestampsRef.current = []; // Reset after rage click detected
      } else {
        sendEvent({
          event: "click",
          page,
          product,
          element,
          x: Math.round(e.clientX),
          y: Math.round(e.clientY),
        });
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [page, product]);

  // Manual track function for custom events (CTA clicks, form submits, etc.)
  const track = useCallback(
    (event: string, extra?: Partial<TrackEvent>) => {
      sendEvent({ event, page, product, ...extra });
    },
    [page, product]
  );

  return { track };
}
