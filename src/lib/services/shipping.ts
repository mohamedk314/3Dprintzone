import { prisma } from "@/lib/db/prisma";

export type ShippingFeeType = "fixed" | "discussed";

export interface ShippingConfig {
  type: ShippingFeeType;
  amount: number;
}

const DEFAULTS: ShippingConfig = { type: "fixed", amount: 0 };

export async function getShippingConfig(): Promise<ShippingConfig> {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { in: ["shipping_fee_type", "shipping_fee_amount"] } },
  });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const type = (map["shipping_fee_type"] as ShippingFeeType) ?? DEFAULTS.type;
  const amount = map["shipping_fee_amount"] != null ? Number(map["shipping_fee_amount"]) : DEFAULTS.amount;
  return { type, amount };
}

export async function setShippingConfig(config: ShippingConfig): Promise<void> {
  await prisma.$transaction([
    prisma.siteSetting.upsert({
      where: { key: "shipping_fee_type" },
      create: { key: "shipping_fee_type", value: config.type },
      update: { value: config.type },
    }),
    prisma.siteSetting.upsert({
      where: { key: "shipping_fee_amount" },
      create: { key: "shipping_fee_amount", value: String(config.amount) },
      update: { value: String(config.amount) },
    }),
  ]);
}
