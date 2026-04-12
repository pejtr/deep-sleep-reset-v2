// Centralized product definitions for Deep Sleep Reset funnel
// All prices in cents (USD)

export const FUNNEL_PRODUCTS = {
  tripwire: {
    key: "tripwire",
    name: "7-Night Deep Sleep Reset",
    description: "Personalizovaný 7-denní spánkový protokol pro tvůj chronotyp",
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
    description: "Kompletní 30-denní program pro trvalou změnu spánku",
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
    description: "4 audio session pro rychlé usnutí a hluboký spánek",
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
    description: "Kompletní toolkit — deník, tracker, recepty, supplement guide",
    price: 2700, // $27.00
    displayPrice: "$27",
    originalPrice: "$97",
    discountPercent: 72,
    successRedirect: "/thank-you",
    cancelRedirect: "/thank-you",
  },
} as const;

export type ProductKey = keyof typeof FUNNEL_PRODUCTS;
