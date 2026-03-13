export const ORDER_STATUSES = [
  "delivered",
  "ordered_cod",
  "ordered_paid",
  "canceled",
] as const;

export const PAYMENT_METHODS = ["cod", "paymob"] as const;

export const PRODUCT_TYPES = ["physical", "digital", "service"] as const;

export const CUSTOM_REQUEST_TYPES = [
  "architecture",
  "gift",
  "dental",
  "mechanical",
] as const;