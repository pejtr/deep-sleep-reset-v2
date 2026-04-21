/*
 * Variant C: Social Proof Wall Hook — Enhanced with User-Submitted Media
 *
 * Features:
 *  - Rotating testimonial ticker (static seed + approved user submissions)
 *  - Thumbnail strip of approved user photos/videos
 *  - "Share your story" button that opens an upload form
 *  - Live "X people changed their sleep this week" counter
 *  - CTA anchors to the offer section
 *
 * Conversion event: fired when user clicks the CTA.
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, Users, ChevronRight, Camera, Upload, CheckCircle, Loader2 } from "lucide-react";
import { trackEvent } from "@/components/MetaPixel";
import { getSessionId } from "@/lib/ab-hooks";
import { trpc } from "@/lib/trpc";
import type { HookVariant } from "@/lib/ab-hooks";

// ─── Seed testimonials (always shown) ────────────────────────────────────────
const SEED_TESTIMONIALS = [
  { name: "Sarah M.", location: "Austin, TX", text: "I cried the morning after Night 4. I'd forgotten what rested felt like.", stars: 5, mediaUrl: null },
  { name: "James K.", location: "London, UK", text: "The Night 4 breathing technique alone was worth 100x the price.", stars: 5, mediaUrl: null },
  { name: "Maria L.", location: "Toronto, CA", text: "4 years of broken sleep. Fixed in 7 nights. This is not normal for me.", stars: 5, mediaUrl: null },
  { name: "David R.", location: "Sydney, AU", text: "Woke up this morning and thought: 'That was the best sleep in years.'", stars: 5, mediaUrl: null },
  { name: "Emma T.", location: "Berlin, DE", text: "I was the biggest skeptic. Now I recommend this to everyone I know.", stars: 5, mediaUrl: null },
];

// ─── Live counter ─────────────────────────────────────────────────────────────
function useLiveCounter(base: number) {
  const [count, setCount] = useState(base);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3));
    }, 45000);
    return () => clearInterval(interval);
  }, []);
  return count;
}

// ─── Upload Form ──────────────────────────────────────────────────────────────
interface UploadFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

function UploadForm({ onClose, onSuccess }: UploadFormProps) {
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const submitMutation = trpc.testimonialMedia.submit.useMutation();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 16 * 1024 * 1024) {
      setError("File must be under 16 MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) {
      setError("Please fill in your name and story.");
      return;
    }
    setUploading(true);
    setError("");

    try {
      let mediaUrl: string | undefined;
      let mediaType: "image" | "video" | undefined;

      // Upload file to S3 via server if provided
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload/testimonial", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json() as { url: string };
          mediaUrl = data.url;
          mediaType = file.type.startsWith("video/") ? "video" : "image";
        }
      }

      await submitMutation.mutateAsync({
        name: name.trim(),
        quote: quote.trim(),
        rating,
        mediaUrl,
        mediaType,
      });

      onSuccess();
    } catch (_) {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-[340px] z-50 bg-[#0d1220] border border-amber/25 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="h-0.5 bg-gradient-to-r from-amber/0 via-amber/60 to-amber/0" />
      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground/90">Share your sleep story</h3>
          <button onClick={onClose} className="text-foreground/30 hover:text-foreground/60 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name */}
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name (e.g. Sarah M.)"
            maxLength={64}
            className="w-full bg-background/30 border border-border/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-amber/40 transition-colors"
          />

          {/* Quote */}
          <textarea
            value={quote}
            onChange={e => setQuote(e.target.value)}
            placeholder="How did the 7-Night Reset change your sleep?"
            maxLength={300}
            rows={3}
            className="w-full bg-background/30 border border-border/20 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-amber/40 transition-colors resize-none"
          />

          {/* Star rating */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className="transition-transform hover:scale-110"
              >
                <Star className={`w-5 h-5 ${s <= rating ? 'fill-amber text-amber' : 'text-foreground/20'}`} />
              </button>
            ))}
            <span className="text-xs text-foreground/40 ml-1">{rating}/5</span>
          </div>

          {/* Photo/video upload */}
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFile}
              className="hidden"
            />
            {preview ? (
              <div className="relative rounded-lg overflow-hidden">
                {file?.type.startsWith("video/") ? (
                  <video src={preview} className="w-full h-24 object-cover" muted />
                ) : (
                  <img src={preview} alt="Preview" className="w-full h-24 object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => { setFile(null); setPreview(null); }}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 border border-dashed border-border/30 hover:border-amber/30 rounded-lg py-3 text-xs text-foreground/40 hover:text-foreground/60 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Add a photo or video (optional, max 16 MB)
              </button>
            )}
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-amber text-background text-sm font-semibold py-2.5 rounded-lg hover:bg-amber/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
            ) : (
              <><Upload className="w-4 h-4" /> Submit My Story</>
            )}
          </button>
          <p className="text-foreground/25 text-[10px] text-center">
            Reviewed before publishing · No spam · Your story helps others sleep.
          </p>
        </form>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface SocialProofWallHookProps {
  onConversion?: () => void;
}

export default function SocialProofWallHook({ onConversion }: SocialProofWallHookProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<"all" | "photo" | "video">("all");
  const weeklyCount = useLiveCounter(847);

  const trackAbEvent = trpc.ab.trackEvent.useMutation();

  // Load approved user-submitted testimonials
  const approvedQ = trpc.testimonialMedia.listApproved.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
  });

  // Merge seed + approved user testimonials
  const allTestimonials = [
    ...SEED_TESTIMONIALS,
    ...(approvedQ.data ?? []).map(t => ({
      name: t.name,
      location: "Verified Buyer",
      text: t.quote,
      stars: t.rating,
      mediaUrl: t.mediaUrl ?? null,
    })),
  ];

  const trackImpression = useCallback(() => {
    trackAbEvent.mutate({
      variant: "social" as HookVariant,
      eventType: "impression",
      sessionId: getSessionId(),
    });
    trackEvent("ABHookImpression", { variant: "social" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(true);
      trackImpression();
    }, 3000);
    return () => clearTimeout(t);
  }, [trackImpression]);

  // Cycle testimonials every 5 seconds
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setCurrentIdx(i => (i + 1) % allTestimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible, allTestimonials.length]);

  const handleCTAClick = () => {
    trackAbEvent.mutate({
      variant: "social" as HookVariant,
      eventType: "conversion",
      sessionId: getSessionId(),
    });
    trackEvent("ABHookConversion", { variant: "social" });
    onConversion?.();
    document.getElementById("offer")?.scrollIntoView({ behavior: "smooth" });
    setDismissed(true);
  };

  const handleUploadSuccess = () => {
    setShowUploadForm(false);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 4000);
  };

  const testimonial = allTestimonials[currentIdx];

  // User-submitted media thumbnails (approved only), filtered by type
  const allMediaItems = (approvedQ.data ?? []).filter(t => t.mediaUrl);
  const mediaThumbnails = allMediaItems
    .filter(t => mediaFilter === "all" || (mediaFilter === "photo" ? t.mediaType === "image" : t.mediaType === "video"))
    .slice(0, 5);

  return (
    <>
      {/* Upload form overlay */}
      <AnimatePresence>
        {showUploadForm && (
          <UploadForm
            onClose={() => setShowUploadForm(false)}
            onSuccess={handleUploadSuccess}
          />
        )}
      </AnimatePresence>

      {/* Upload success toast */}
      <AnimatePresence>
        {uploadSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-2.5 rounded-xl shadow-lg"
          >
            <CheckCircle className="w-4 h-4" />
            Thank you! Your story is under review.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main bar */}
      <AnimatePresence>
        {visible && !dismissed && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-4"
          >
            <div className="w-full max-w-2xl bg-[#0d1220]/95 backdrop-blur-md border border-amber/20 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
              <div className="h-0.5 bg-gradient-to-r from-amber/0 via-amber/50 to-amber/0" />

              {/* Media thumbnail strip with filter tabs */}
              {allMediaItems.length > 0 && (
                <div className="px-4 pt-2.5 pb-0">
                  {/* Filter tabs */}
                  <div className="flex items-center gap-1.5 mb-2">
                    {(["all", "photo", "video"] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setMediaFilter(f)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border transition-all duration-150 ${
                          mediaFilter === f
                            ? 'border-amber/50 bg-amber/10 text-amber/80'
                            : 'border-border/20 text-foreground/30 hover:border-border/40 hover:text-foreground/50'
                        }`}
                      >
                        {f === "all" ? `All (${allMediaItems.length})` : f === "photo" ? `📷 Photos (${allMediaItems.filter(t => t.mediaType === "image").length})` : `🎥 Videos (${allMediaItems.filter(t => t.mediaType === "video").length})`}
                      </button>
                    ))}
                  </div>
                  {/* Thumbnails */}
                  <div className="flex items-center gap-2">
                    {mediaThumbnails.length > 0 ? mediaThumbnails.map((t) => (
                      <div key={t.id} className="relative w-9 h-9 rounded-lg overflow-hidden border border-amber/20 shrink-0">
                        {t.mediaType === "video" ? (
                          <>
                            <video src={t.mediaUrl!} className="w-full h-full object-cover" muted />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <span className="text-white text-[8px]">▶</span>
                            </div>
                          </>
                        ) : (
                          <img src={t.mediaUrl!} alt={t.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                    )) : (
                      <span className="text-[10px] text-foreground/25 italic">No {mediaFilter}s yet — be the first!</span>
                    )}
                    {mediaThumbnails.length > 0 && (
                      <span className="text-[10px] text-foreground/35 ml-1">
                        {(approvedQ.data?.length ?? 0)} verified stories
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-stretch gap-0">
                {/* Left: Live counter */}
                <div className="flex flex-col items-center justify-center px-4 py-3 border-r border-border/10 min-w-[90px] shrink-0">
                  <Users className="w-4 h-4 text-amber/70 mb-1" />
                  <motion.span
                    key={weeklyCount}
                    initial={{ scale: 1.2, color: "oklch(0.75 0.15 85)" }}
                    animate={{ scale: 1, color: "oklch(0.9 0.05 85)" }}
                    className="text-xl font-bold text-foreground/90 tabular-nums"
                  >
                    {weeklyCount.toLocaleString()}
                  </motion.span>
                  <span className="text-[10px] text-foreground/40 text-center leading-tight mt-0.5">
                    lives changed<br />this week
                  </span>
                </div>

                {/* Center: Rotating testimonial */}
                <div className="flex-1 px-4 py-3 min-w-0 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIdx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35 }}
                    >
                      <div className="flex gap-0.5 mb-1">
                        {Array.from({ length: testimonial.stars }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber text-amber" />
                        ))}
                      </div>
                      <p className="text-foreground/80 text-xs sm:text-sm leading-snug line-clamp-2">
                        "{testimonial.text}"
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-foreground/40 text-[10px]">
                          — {testimonial.name}, {testimonial.location}
                        </p>
                        {/* Share your story link */}
                        <button
                          onClick={() => setShowUploadForm(v => !v)}
                          className="text-[10px] text-amber/50 hover:text-amber/80 transition-colors flex items-center gap-0.5 shrink-0 ml-2"
                        >
                          <Camera className="w-3 h-3" />
                          Share yours
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Right: CTA + dismiss */}
                <div className="flex flex-col items-center justify-center px-3 py-3 shrink-0 gap-2">
                  <button
                    onClick={handleCTAClick}
                    className="flex items-center gap-1 bg-amber text-background text-xs font-bold px-3 py-2 rounded-lg hover:bg-amber/90 transition-colors whitespace-nowrap"
                  >
                    Try for $5
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDismissed(true)}
                    className="text-foreground/25 hover:text-foreground/50 transition-colors"
                    aria-label="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
