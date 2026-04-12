// Centralized product definitions for Deep Sleep Reset funnel
// All prices in cents (USD)

export const FUNNEL_PRODUCTS = {
  tripwire: {
    key: "tripwire",
    name: "7-Night Deep Sleep Reset",
    description: "Personalized 7-night sleep protocol for your chronotype",
    price: 100, // $1.00
    displayPrice: "$1",
    originalPrice: "$27",
    discountPercent: 96,
    successRedirect: "/upsell/1",
    cancelRedirect: "/order",
  },
  oto1: {
    key: "oto1",
    name: "30-Day Sleep Transformation",
    description: "Complete 30-day program for lasting sleep transformation",
    price: 700, // $7.00
    displayPrice: "$7",
    originalPrice: "$47",
    discountPercent: 85,
    successRedirect: "/upsell/2",
    cancelRedirect: "/upsell/2",
  },
  oto2: {
    key: "oto2",
    name: "Chronotype Audio Mastery Pack",
    description: "4 audio sessions for fast sleep onset and deep sleep",
    price: 1700, // $17.00
    displayPrice: "$17",
    originalPrice: "$67",
    discountPercent: 75,
    successRedirect: "/upsell/3",
    cancelRedirect: "/upsell/3",
  },
  oto3: {
    key: "oto3",
    name: "Deep Sleep Toolkit",
    description: "Complete toolkit — journal, tracker, recipes, supplement guide",
    price: 2700, // $27.00
    displayPrice: "$27",
    originalPrice: "$97",
    discountPercent: 72,
    successRedirect: "/thank-you",
    cancelRedirect: "/thank-you",
  },
} as const;

export type ProductKey = keyof typeof FUNNEL_PRODUCTS;

// Premium Subscription Tiers — Sleep Optimizers Community
// Klein principle: identity-based brand, not just a product
export const SUBSCRIPTION_TIERS = {
  basic: {
    key: "basic",
    name: "Sleep Optimizer Basic",
    tagline: "Start your sleep transformation",
    price: 999, // $9.99/month
    displayPrice: "$9.99",
    originalPrice: "$47",
    discountPercent: 79,
    interval: "month" as const,
    features: [
      "Monthly Sleep Protocol Update (PDF)",
      "Weekly Sleep Tips Email",
      "Chronotype-specific meal timing guide",
      "Access to Sleep Optimizer community",
      "Cancel anytime",
    ],
    valueStack: "$97 value",
    badge: null,
    color: "blue",
  },
  pro: {
    key: "pro",
    name: "Sleep Optimizer Pro",
    tagline: "The complete sleep system",
    price: 2700, // $27/month
    displayPrice: "$27",
    originalPrice: "$275",
    discountPercent: 90,
    interval: "month" as const,
    features: [
      "Everything in Basic",
      "Weekly AI Sleep Score Report",
      "Monthly Live Q&A Recording",
      "Exclusive Bonus Guides (2/month)",
      "Private Sleep Optimizers Community",
      "Priority email support",
      "Early access to new protocols",
    ],
    valueStack: "$275 value",
    badge: "MOST POPULAR",
    color: "purple",
  },
  elite: {
    key: "elite",
    name: "Sleep Optimizer Elite",
    tagline: "Maximum performance, maximum results",
    price: 4700, // $47/month
    displayPrice: "$47",
    originalPrice: "$497",
    discountPercent: 91,
    interval: "month" as const,
    features: [
      "Everything in Pro",
      "Personal Sleep Score Dashboard",
      "Monthly 1-on-1 AI coaching session",
      "VIP community badge & recognition",
      "Lifetime access to all past protocols",
      "First access to new products (free)",
      "Quarterly deep-dive sleep audit",
    ],
    valueStack: "$497 value",
    badge: "BEST VALUE",
    color: "gold",
  },
} as const;

export type SubscriptionTierKey = keyof typeof SUBSCRIPTION_TIERS;

