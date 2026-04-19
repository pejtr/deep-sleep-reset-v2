export const DEEP_SLEEP_RESET_PRODUCT = {
  key: "deepsleepreset-premium",
  name: "DeepSleepReset",
  description: "Premium sleep improvement program with guided content, Petra support, and structured daily reset steps.",
  mode: "subscription" as const,
  successPath: "/checkout/success",
  cancelPath: "/checkout",
  priceLookupKey: "deepsleepreset-premium-monthly",
};

export const PRODUCT_CATALOG = [DEEP_SLEEP_RESET_PRODUCT] as const;

export function getPrimaryProduct() {
  return DEEP_SLEEP_RESET_PRODUCT;
}
