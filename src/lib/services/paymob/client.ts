import { createHmac } from "crypto";

const BASE = "https://accept.paymob.com/api";

export type PaymobConfig = {
  apiKey:        string;
  integrationId: string;
  iframeId:      string;
  hmacSecret:    string;
};

export function getPaymobConfig(): PaymobConfig | null {
  const { PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, PAYMOB_IFRAME_ID, PAYMOB_HMAC_SECRET } =
    process.env;

  if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID || !PAYMOB_IFRAME_ID || !PAYMOB_HMAC_SECRET) {
    return null;
  }

  return {
    apiKey:        PAYMOB_API_KEY,
    integrationId: PAYMOB_INTEGRATION_ID,
    iframeId:      PAYMOB_IFRAME_ID,
    hmacSecret:    PAYMOB_HMAC_SECRET,
  };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paymob ${path} failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

/** Step 1 — exchange API key for a short-lived auth token */
export async function getAuthToken(apiKey: string): Promise<string> {
  const data = await post<{ token: string }>("/auth/tokens", { api_key: apiKey });
  return data.token;
}

type PaymobOrderResponse = { id: number };

/** Step 2 — register the order with Paymob */
export async function registerOrder(
  token:          string,
  merchantOrderId: string,
  amountCents:    number,
  currency:       string,
  items:          { name: string; amount_cents: number; description: string; quantity: number }[]
): Promise<number> {
  const data = await post<PaymobOrderResponse>("/ecommerce/orders", {
    auth_token:          token,
    delivery_needed:     false,
    amount_cents:        amountCents,
    currency,
    merchant_order_id:   merchantOrderId,
    items,
  });

  return data.id;
}

type BillingData = {
  first_name:    string;
  last_name:     string;
  email:         string;
  phone_number:  string;
  apartment:     string;
  floor:         string;
  street:        string;
  building:      string;
  city:          string;
  country:       string;
  state:         string;
  postal_code:   string;
};

/** Step 3 — request a payment key */
export async function getPaymentKey(
  token:         string,
  paymobOrderId: number,
  amountCents:   number,
  currency:      string,
  integrationId: string,
  billing:       BillingData
): Promise<string> {
  const data = await post<{ token: string }>("/acceptance/payment_keys", {
    auth_token:     token,
    amount_cents:   amountCents,
    expiration:     3600,
    order_id:       paymobOrderId,
    currency,
    integration_id: Number(integrationId),
    billing_data:   billing,
  });

  return data.token;
}

/** Checkout iframe URL */
export function buildCheckoutUrl(iframeId: string, paymentKey: string): string {
  return `https://accept.paymob.com/api/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;
}

// ---------------------------------------------------------------------------
// HMAC verification
// Paymob concatenates these fields in this exact order, then HMAC-SHA512.
// ---------------------------------------------------------------------------
const HMAC_FIELDS = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order.id",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedValue(obj: Record<string, any>, path: string): string {
  const parts = path.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = obj;
  for (const part of parts) {
    current = current?.[part];
  }
  return String(current ?? "");
}

export function verifyWebhookHmac(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactionObj: Record<string, any>,
  receivedHmac:   string,
  hmacSecret:     string
): boolean {
  const concatenated = HMAC_FIELDS.map((field) =>
    getNestedValue(transactionObj, field)
  ).join("");

  const computed = createHmac("sha512", hmacSecret)
    .update(concatenated)
    .digest("hex");

  return computed === receivedHmac;
}
