import { useEffect } from "react";

interface SeoHeadProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  schemas?: object[];
}

/**
 * Injects SEO meta tags and JSON-LD structured data into <head>.
 * Use this on every public-facing page.
 */
export default function SeoHead({
  title = "Deep Sleep Reset — Fix Your Sleep in 7 Nights",
  description = "The 7-Night Deep Sleep Reset is a science-backed CBT-I protocol that fixes insomnia, racing thoughts, and broken sleep cycles. Just $5. 30-day guarantee.",
  canonicalUrl = "https://deep-sleep-reset.com",
  ogImage = "https://deep-sleep-reset.com/og-image.jpg",
  schemas = [],
}: SeoHeadProps) {
  useEffect(() => {
    // Title
    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", canonicalUrl);

    // Open Graph
    const ogTags: Record<string, string> = {
      "og:title": title,
      "og:description": description,
      "og:url": canonicalUrl,
      "og:type": "website",
      "og:image": ogImage,
      "og:site_name": "Deep Sleep Reset",
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": ogImage,
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(
        `meta[property="${property}"], meta[name="${property}"]`
      );
      if (!tag) {
        tag = document.createElement("meta");
        if (property.startsWith("twitter:")) {
          tag.setAttribute("name", property);
        } else {
          tag.setAttribute("property", property);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    // JSON-LD structured data
    // Remove any previously injected schemas
    document.querySelectorAll('[data-seo-schema]').forEach(el => el.remove());

    schemas.forEach((schema, i) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-schema", String(i));
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return () => {
      document.querySelectorAll('[data-seo-schema]').forEach(el => el.remove());
    };
  }, [title, description, canonicalUrl, ogImage, JSON.stringify(schemas)]);

  return null;
}
