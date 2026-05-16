import "server-only";
import { prisma } from "@/lib/db/prisma";
import {
  DEFAULT_SITE_SETTINGS,
  mergeWithDefaults,
  type SiteSettings,
} from "./site-settings-types";

/**
 * Server-only helpers that read/write site settings from the database.
 * Client code should import from `./site-settings-types` instead (types
 * + defaults + merge helper, no Prisma).
 */

export const SITE_SETTINGS_KEY = "site_settings_v1";

/**
 * Defense against runaway payloads. The existing SiteSetting column is
 * MySQL TEXT (~64KB). With two brands × four legal bodies the JSON can
 * grow large, so we reserve the full budget but keep it below the column
 * cap. If you ever need more room, migrate the column to MEDIUMTEXT.
 */
export const SITE_SETTINGS_MAX_BYTES = 60 * 1024;

export {
  DEFAULT_SITE_SETTINGS,
  mergeWithDefaults,
};
export type { SiteSettings };

export async function readSiteSettings(): Promise<SiteSettings> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: SITE_SETTINGS_KEY } });
    if (!row?.value) return DEFAULT_SITE_SETTINGS;
    const parsed = JSON.parse(row.value);
    return mergeWithDefaults(parsed);
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function writeSiteSettings(input: unknown): Promise<SiteSettings> {
  const next = mergeWithDefaults(input);
  const json = JSON.stringify(next);
  if (json.length > SITE_SETTINGS_MAX_BYTES) {
    throw new Error("Settings payload too large");
  }
  await prisma.siteSetting.upsert({
    where: { key: SITE_SETTINGS_KEY },
    create: { key: SITE_SETTINGS_KEY, value: json },
    update: { value: json },
  });
  return next;
}
