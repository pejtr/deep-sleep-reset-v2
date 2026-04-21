/**
 * Meta Conversions API (CAPI) helper.
 * Sends server-side events to Meta for improved attribution.
 *
 * Events: Purchase, Lead, InitiateCheckout
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import { ENV } from "./_core/env";
import crypto from "crypto";

const GRAPH_API_VERSION = "v21.0";

interface MetaEventData {
  eventName: "Purchase" | "Lead" | "InitiateCheckout" | "ViewContent";
  eventTime?: number; // Unix timestamp in seconds
  eventSourceUrl?: string;
  actionSource?: "website" | "email" | "app";
  userData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbc?: string; // Facebook click ID cookie
    fbp?: string; // Facebook browser ID cookie
  };
  customData?: {
    currency?: string;
    value?: number;
    contentName?: string;
    contentIds?: string[];
    contentType?: string;
    numItems?: number;
  };
}

/**
 * Hash a value using SHA-256 for Meta's hashing requirement.
 * Returns empty string if value is falsy.
 */
function hashValue(value: string | undefined): string {
  if (!value) return "";
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

/**
 * Send a server-side event to Meta Conversions API.
 * Silently fails if META_PIXEL_ID or META_CAPI_TOKEN are not configured.
 */
export async function sendMetaEvent(data: MetaEventData): Promise<boolean> {
  const pixelId = ENV.metaPixelId;
  const accessToken = ENV.metaCapiToken;

  if (!pixelId || !accessToken) {
    console.log("[Meta CAPI] Skipping — META_PIXEL_ID or META_CAPI_TOKEN not configured");
    return false;
  }

  const eventTime = data.eventTime ?? Math.floor(Date.now() / 1000);
  const eventId = `${data.eventName}_${eventTime}_${crypto.randomUUID()}`;

  const payload = {
    data: [
      {
        event_name: data.eventName,
        event_time: eventTime,
        event_id: eventId,
        event_source_url: data.eventSourceUrl,
        action_source: data.actionSource ?? "website",
        user_data: {
          em: data.userData.email ? [hashValue(data.userData.email)] : undefined,
          fn: data.userData.firstName ? [hashValue(data.userData.firstName)] : undefined,
          ln: data.userData.lastName ? [hashValue(data.userData.lastName)] : undefined,
          client_ip_address: data.userData.clientIpAddress,
          client_user_agent: data.userData.clientUserAgent,
          fbc: data.userData.fbc,
          fbp: data.userData.fbp,
        },
        custom_data: data.customData
          ? {
              currency: data.customData.currency ?? "USD",
              value: data.customData.value,
              content_name: data.customData.contentName,
              content_ids: data.customData.contentIds,
              content_type: data.customData.contentType ?? "product",
              num_items: data.customData.numItems,
            }
          : undefined,
      },
    ],
  };

  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events?access_token=${accessToken}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Meta CAPI] Failed to send ${data.eventName}:`, response.status, errorBody);
      return false;
    }

    const result = await response.json();
    console.log(`[Meta CAPI] ${data.eventName} sent successfully:`, result);
    return true;
  } catch (error) {
    console.error(`[Meta CAPI] Error sending ${data.eventName}:`, error);
    return false;
  }
}

/**
 * Fire a Purchase event server-side.
 */
export async function fireMetaPurchase(opts: {
  email: string;
  value: number; // in dollars
  currency?: string;
  productName: string;
  ip?: string;
  userAgent?: string;
  sourceUrl?: string;
}): Promise<boolean> {
  return sendMetaEvent({
    eventName: "Purchase",
    eventSourceUrl: opts.sourceUrl,
    userData: {
      email: opts.email,
      clientIpAddress: opts.ip,
      clientUserAgent: opts.userAgent,
    },
    customData: {
      currency: opts.currency ?? "USD",
      value: opts.value,
      contentName: opts.productName,
      contentType: "product",
    },
  });
}

/**
 * Fire a Lead event server-side.
 */
export async function fireMetaLead(opts: {
  email: string;
  source?: string;
  ip?: string;
  userAgent?: string;
  sourceUrl?: string;
}): Promise<boolean> {
  return sendMetaEvent({
    eventName: "Lead",
    eventSourceUrl: opts.sourceUrl,
    userData: {
      email: opts.email,
      clientIpAddress: opts.ip,
      clientUserAgent: opts.userAgent,
    },
    customData: {
      contentName: opts.source ?? "quiz",
    },
  });
}

/**
 * Fire an InitiateCheckout event server-side.
 */
export async function fireMetaInitiateCheckout(opts: {
  email?: string;
  value: number;
  currency?: string;
  productName: string;
  ip?: string;
  userAgent?: string;
  sourceUrl?: string;
}): Promise<boolean> {
  return sendMetaEvent({
    eventName: "InitiateCheckout",
    eventSourceUrl: opts.sourceUrl,
    userData: {
      email: opts.email,
      clientIpAddress: opts.ip,
      clientUserAgent: opts.userAgent,
    },
    customData: {
      currency: opts.currency ?? "USD",
      value: opts.value,
      contentName: opts.productName,
      contentType: "product",
    },
  });
}
