/*
 * A/B Hook Router — 3-Variant Conversion Hook Testing
 *
 * Assigns visitors to one of three hook variants and caches the assignment
 * for 24 hours in localStorage. Tracks impressions and conversions per variant
 * via the tRPC ab.trackEvent procedure.
 *
 * Variants:
 *   'quiz'    — Variant A: Sleep Score Quiz (5-question lead gen + personalized result)
 *   'chatbot' — Variant B: Chatbot Teaser (animated chat bubble with curiosity opener)
 *   'social'  — Variant C: Social Proof Wall (live testimonial ticker + urgency counter)
 *
 * Assignment: deterministic random, 33/33/34 split, 24h TTL
 */

export type HookVariant = "quiz" | "chatbot" | "social";

const STORAGE_KEY = "dsr-hook-variant";
const TIMESTAMP_KEY = "dsr-hook-assigned-at";
const SESSION_KEY = "dsr-session-id";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Generate or retrieve a persistent anonymous session ID */
export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/** Assign or retrieve the visitor's hook variant (24h cache) */
export function getHookVariant(): HookVariant {
  const stored = localStorage.getItem(STORAGE_KEY) as HookVariant | null;
  const assignedAt = parseInt(localStorage.getItem(TIMESTAMP_KEY) ?? "0", 10);
  const isValid = stored && Date.now() - assignedAt < TTL_MS;

  if (isValid && (stored === "quiz" || stored === "chatbot" || stored === "social")) {
    return stored;
  }

  // Assign new variant — equal 33/33/34 split
  const rand = Math.random();
  const variant: HookVariant = rand < 0.333 ? "quiz" : rand < 0.666 ? "chatbot" : "social";

  localStorage.setItem(STORAGE_KEY, variant);
  localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());

  return variant;
}

/** Force a specific variant (for testing/admin preview) */
export function forceHookVariant(variant: HookVariant): void {
  localStorage.setItem(STORAGE_KEY, variant);
  localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
}

/** Clear the cached variant (forces re-assignment on next load) */
export function clearHookVariant(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TIMESTAMP_KEY);
}
