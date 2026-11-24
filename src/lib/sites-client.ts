import type { CountrySite } from "./types";

export function getSiteOrigin(site: Pick<CountrySite, "url">): string {
  try {
    return new URL(site.url).hostname;
  } catch {
    return site.url;
  }
}

export function getAdminUrl(
  site: Pick<CountrySite, "url" | "adminPath">,
  subPath = "",
): string {
  const base = `${site.url.replace(/\/+$/, "")}${site.adminPath.replace(/\/+$/, "")}`;
  if (!subPath) return `${base}/`;
  return `${base}/${subPath.replace(/^\//, "")}`;
}

export function siteTitle(site: Pick<CountrySite, "flag" | "country">): string {
  return `${site.flag} ركن التطور — ${site.country}`;
}
