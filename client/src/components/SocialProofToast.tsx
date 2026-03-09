/*
 * Social Proof FOMO Notifications
 * Design: Midnight Noir — subtle toast in bottom-left
 * Shows randomized "X from Y just purchased..." messages
 * Cycles every 15-30 seconds with realistic timing
 * Only shows on the main sales page
 */

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";

interface ProofItem {
  name: string;
  location: string;
  product: string;
  timeAgo: string;
}

const PROOF_DATA: ProofItem[] = [
  { name: "Sarah M.", location: "Austin, TX", product: "Deep Sleep Reset", timeAgo: "2 minutes ago" },
  { name: "James K.", location: "London, UK", product: "Deep Sleep Reset", timeAgo: "5 minutes ago" },
  { name: "Maria L.", location: "Toronto, CA", product: "Complete Bundle", timeAgo: "3 minutes ago" },
  { name: "David R.", location: "Sydney, AU", product: "Deep Sleep Reset", timeAgo: "8 minutes ago" },
  { name: "Emma W.", location: "Berlin, DE", product: "Anxiety Audio Pack", timeAgo: "1 minute ago" },
  { name: "Michael T.", location: "New York, NY", product: "Deep Sleep Reset", timeAgo: "4 minutes ago" },
  { name: "Lisa P.", location: "Dublin, IE", product: "Complete Bundle", timeAgo: "6 minutes ago" },
  { name: "Robert H.", location: "Cape Town, ZA", product: "Deep Sleep Reset", timeAgo: "2 minutes ago" },
  { name: "Anna S.", location: "Warsaw, PL", product: "Sleep Optimizer", timeAgo: "7 minutes ago" },
  { name: "Chris B.", location: "Vancouver, CA", product: "Deep Sleep Reset", timeAgo: "3 minutes ago" },
  { name: "Sophie N.", location: "Amsterdam, NL", product: "Complete Bundle", timeAgo: "5 minutes ago" },
  { name: "Tom G.", location: "Melbourne, AU", product: "Deep Sleep Reset", timeAgo: "1 minute ago" },
  { name: "Rachel F.", location: "Manchester, UK", product: "Anxiety Audio Pack", timeAgo: "4 minutes ago" },
  { name: "Daniel M.", location: "Bucharest, RO", product: "Deep Sleep Reset", timeAgo: "9 minutes ago" },
  { name: "Olivia K.", location: "Kuala Lumpur, MY", product: "Deep Sleep Reset", timeAgo: "2 minutes ago" },
];

// Spanish-friendly names for /es routes
const PROOF_DATA_ES: ProofItem[] = [
  { name: "Carlos M.", location: "Buenos Aires, AR", product: "Deep Sleep Reset", timeAgo: "hace 2 minutos" },
  { name: "Ana G.", location: "Ciudad de México, MX", product: "Deep Sleep Reset", timeAgo: "hace 5 minutos" },
  { name: "María L.", location: "Bogotá, CO", product: "Paquete Completo", timeAgo: "hace 3 minutos" },
  { name: "Diego R.", location: "Lima, PE", product: "Deep Sleep Reset", timeAgo: "hace 8 minutos" },
  { name: "Sofía W.", location: "Santiago, CL", product: "Audio Anti-Ansiedad", timeAgo: "hace 1 minuto" },
  { name: "Miguel T.", location: "Madrid, ES", product: "Deep Sleep Reset", timeAgo: "hace 4 minutos" },
  { name: "Laura P.", location: "Quito, EC", product: "Paquete Completo", timeAgo: "hace 6 minutos" },
  { name: "Roberto H.", location: "Montevideo, UY", product: "Deep Sleep Reset", timeAgo: "hace 2 minutos" },
  { name: "Isabella S.", location: "Medellín, CO", product: "Kit Optimizador", timeAgo: "hace 7 minutos" },
  { name: "Javier B.", location: "Caracas, VE", product: "Deep Sleep Reset", timeAgo: "hace 3 minutos" },
  { name: "Valentina N.", location: "Córdoba, AR", product: "Paquete Completo", timeAgo: "hace 5 minutos" },
  { name: "Tomás G.", location: "Barcelona, ES", product: "Deep Sleep Reset", timeAgo: "hace 1 minuto" },
  { name: "Camila F.", location: "Guadalajara, MX", product: "Audio Anti-Ansiedad", timeAgo: "hace 4 minutos" },
  { name: "Daniel M.", location: "Asunción, PY", product: "Deep Sleep Reset", timeAgo: "hace 9 minutos" },
  { name: "Luciana K.", location: "São Paulo, BR", product: "Deep Sleep Reset", timeAgo: "hace 2 minutos" },
];

const SESSION_KEY = "dsr-proof-index";

export default function SocialProofToast() {
  const [current, setCurrent] = useState<ProofItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const isSpanish = window.location.pathname.startsWith("/es");
  const data = isSpanish ? PROOF_DATA_ES : PROOF_DATA;
  const purchasedLabel = isSpanish ? "Compró" : "Purchased";

  const showNext = useCallback(() => {
    // Don't show on non-sales pages
    const path = window.location.pathname;
    if (path !== "/" && path !== "/es" && path !== "/es/") return;

    // Get next index from session (cycle through all)
    const idx = parseInt(sessionStorage.getItem(SESSION_KEY) || "0", 10);
    const item = data[idx % data.length];
    sessionStorage.setItem(SESSION_KEY, String((idx + 1) % data.length));

    // Randomize the timeAgo for freshness
    const minutes = Math.floor(Math.random() * 12) + 1;
    const timeAgo = isSpanish
      ? (minutes === 1 ? "hace 1 minuto" : `hace ${minutes} minutos`)
      : (minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`);

    setCurrent({ ...item, timeAgo });
    setIsVisible(true);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  }, [data, isSpanish]);

  useEffect(() => {
    // Initial delay: 20 seconds after page load
    const initialTimer = setTimeout(() => {
      showNext();

      // Then show every 18-35 seconds (randomized for realism)
      const interval = setInterval(() => {
        const delay = Math.random() * 17000 + 18000; // 18-35s
        setTimeout(showNext, delay);
      }, 25000);

      return () => clearInterval(interval);
    }, 20000);

    return () => clearTimeout(initialTimer);
  }, [showNext]);

  return (
    <AnimatePresence>
      {isVisible && current && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-20 lg:bottom-6 left-4 z-40 max-w-xs"
        >
          <div className="bg-[#111827]/95 backdrop-blur-md border border-border/20 rounded-xl p-3.5 shadow-xl shadow-black/30 flex items-start gap-3">
            {/* Icon */}
            <div className="w-9 h-9 rounded-full bg-amber/15 flex items-center justify-center shrink-0 mt-0.5">
              <ShoppingBag className="w-4 h-4 text-amber" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-foreground/80 text-sm leading-snug">
                <strong className="text-foreground/95">{current.name}</strong>{" "}
                {isSpanish ? "de" : "from"} {current.location}
              </p>
              <p className="text-foreground/50 text-xs mt-0.5">
                {purchasedLabel} <span className="text-amber/80">{current.product}</span>
              </p>
              <p className="text-foreground/30 text-[11px] mt-1">{current.timeAgo}</p>
            </div>

            {/* Close */}
            <button
              onClick={() => setIsVisible(false)}
              className="text-foreground/20 hover:text-foreground/40 transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
