/*
 * i18n Language Context
 * Supports English (en) and Spanish (es) for South American market
 * Detects language from URL prefix (/es/) or defaults to English
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocation } from "wouter";
import en from "@/i18n/en";
import es from "@/i18n/es";

export type Locale = "en" | "es";

type TranslationMap = typeof en;

interface LanguageContextType {
  locale: Locale;
  t: TranslationMap;
  /** Get localized path (adds /es prefix for Spanish) */
  localePath: (path: string) => string;
  /** Get the other locale */
  otherLocale: Locale;
  /** Get URL to switch to other locale */
  switchUrl: (currentPath: string) => string;
}

const translations: Record<Locale, TranslationMap> = { en, es };

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const locale: Locale = location.startsWith("/es") ? "es" : "en";
  const t = translations[locale];

  const value = useMemo<LanguageContextType>(() => ({
    locale,
    t,
    localePath: (path: string) => {
      if (locale === "es") {
        return path === "/" ? "/es" : `/es${path}`;
      }
      return path;
    },
    otherLocale: locale === "en" ? "es" : "en",
    switchUrl: (currentPath: string) => {
      if (locale === "es") {
        // Remove /es prefix
        const stripped = currentPath.replace(/^\/es/, "") || "/";
        return stripped;
      }
      // Add /es prefix
      return currentPath === "/" ? "/es" : `/es${currentPath}`;
    },
  }), [locale, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
