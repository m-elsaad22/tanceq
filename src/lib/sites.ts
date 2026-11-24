import { promises as fs } from "fs";
import path from "path";
import {
  COUNTRY_PRESETS,
  SITE_COLORS,
  type CountrySite,
  type CountrySiteInput,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "sites.json");

function seedSites(): CountrySite[] {
  const now = new Date().toISOString();
  return COUNTRY_PRESETS.slice(0, 4).map((preset, index) => ({
    id: `demo-${preset.countryCode.toLowerCase()}`,
    country: preset.country,
    countryCode: preset.countryCode,
    flag: preset.flag,
    url: `https://${preset.countryCode.toLowerCase()}.roknaltatawur.example`,
    adminPath: "/wp-admin",
    notes:
      index === 0
        ? "مثال تجريبي — استبدل الرابط برابط تثبيت ووردبريس الفعلي لركن التطور في هذه الدولة"
        : "",
    color: preset.color,
    createdAt: now,
    updatedAt: now,
    lastStatus: "unknown" as const,
  }));
}

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

function normalizeAdminPath(raw?: string): string {
  const value = (raw || "/wp-admin").trim();
  if (!value) return "/wp-admin";
  return value.startsWith("/") ? value : `/${value}`;
}

function findPreset(countryCode: string, country: string) {
  const code = countryCode.trim().toUpperCase();
  return (
    COUNTRY_PRESETS.find((item) => item.countryCode === code) ||
    COUNTRY_PRESETS.find((item) => item.country === country.trim())
  );
}

async function ensureStore(): Promise<CountrySite[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as CountrySite[];
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid sites store");
    }
    return parsed;
  } catch {
    const seed = seedSites();
    await fs.writeFile(DATA_FILE, JSON.stringify(seed, null, 2), "utf8");
    return structuredClone(seed);
  }
}

async function writeStore(sites: CountrySite[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(sites, null, 2), "utf8");
}

export async function listSites(): Promise<CountrySite[]> {
  const sites = await ensureStore();
  return sites.sort((a, b) => a.country.localeCompare(b.country, "ar"));
}

export async function getSite(id: string): Promise<CountrySite | null> {
  const sites = await ensureStore();
  return sites.find((site) => site.id === id) ?? null;
}

export async function createSite(
  input: CountrySiteInput,
): Promise<CountrySite> {
  const sites = await ensureStore();
  const preset = findPreset(input.countryCode, input.country);
  const now = new Date().toISOString();
  const site: CountrySite = {
    id: crypto.randomUUID(),
    country: input.country.trim(),
    countryCode: (input.countryCode || preset?.countryCode || "XX")
      .trim()
      .toUpperCase(),
    flag: (input.flag || preset?.flag || "🌍").trim(),
    url: normalizeUrl(input.url),
    adminPath: normalizeAdminPath(input.adminPath),
    notes: (input.notes || "").trim(),
    color:
      input.color ||
      preset?.color ||
      SITE_COLORS[sites.length % SITE_COLORS.length],
    createdAt: now,
    updatedAt: now,
    lastStatus: "unknown",
  };

  sites.push(site);
  await writeStore(sites);
  return site;
}

export async function updateSite(
  id: string,
  input: Partial<CountrySiteInput> & {
    lastStatus?: CountrySite["lastStatus"];
    lastCheckedAt?: string;
  },
): Promise<CountrySite | null> {
  const sites = await ensureStore();
  const index = sites.findIndex((site) => site.id === id);
  if (index === -1) return null;

  const current = sites[index];
  const country = input.country?.trim() || current.country;
  const countryCode = (
    input.countryCode ||
    current.countryCode
  )
    .trim()
    .toUpperCase();
  const preset = findPreset(countryCode, country);

  const next: CountrySite = {
    ...current,
    country,
    countryCode,
    flag: input.flag?.trim() || current.flag || preset?.flag || "🌍",
    url: input.url ? normalizeUrl(input.url) : current.url,
    adminPath:
      input.adminPath !== undefined
        ? normalizeAdminPath(input.adminPath)
        : current.adminPath,
    notes: input.notes !== undefined ? input.notes.trim() : current.notes,
    color: input.color || current.color || preset?.color || SITE_COLORS[0],
    lastStatus: input.lastStatus ?? current.lastStatus,
    lastCheckedAt: input.lastCheckedAt ?? current.lastCheckedAt,
    updatedAt: new Date().toISOString(),
  };

  sites[index] = next;
  await writeStore(sites);
  return next;
}

export async function deleteSite(id: string): Promise<boolean> {
  const sites = await ensureStore();
  const next = sites.filter((site) => site.id !== id);
  if (next.length === sites.length) return false;
  await writeStore(next);
  return true;
}

export function getAdminUrl(site: CountrySite, subPath = ""): string {
  const base = `${site.url.replace(/\/+$/, "")}${site.adminPath.replace(/\/+$/, "")}`;
  if (!subPath) return `${base}/`;
  return `${base}/${subPath.replace(/^\//, "")}`;
}

export function getSiteOrigin(site: CountrySite): string {
  try {
    return new URL(site.url).hostname;
  } catch {
    return site.url;
  }
}
