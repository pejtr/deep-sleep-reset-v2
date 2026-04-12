// Centralized product download URLs (CDN)
export const PRODUCT_DOWNLOADS = {
  tripwire: {
    name: "7-Night Deep Sleep Reset",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/89740521/oMP8CH8vmujDrxr428gHAC/tripwire-7night-reset_2a20e100.pdf",
    filename: "7-Night-Deep-Sleep-Reset.pdf",
  },
  oto1: {
    name: "30-Day Sleep Transformation Program",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/89740521/oMP8CH8vmujDrxr428gHAC/oto1-30day-transformation_2ab85980.pdf",
    filename: "30-Day-Sleep-Transformation.pdf",
  },
  oto2: {
    name: "Chronotype Mastery Pack",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/89740521/oMP8CH8vmujDrxr428gHAC/oto2-chronotype-mastery_02bf8aef.pdf",
    filename: "Chronotype-Mastery-Pack.pdf",
  },
  oto3: {
    name: "Deep Sleep Toolkit",
    url: "https://d2xsxph8kpxj0f.cloudfront.net/89740521/oMP8CH8vmujDrxr428gHAC/oto3-deep-sleep-toolkit_e02cd38f.pdf",
    filename: "Deep-Sleep-Toolkit.pdf",
  },
} as const;

export type ProductDownloadKey = keyof typeof PRODUCT_DOWNLOADS;
