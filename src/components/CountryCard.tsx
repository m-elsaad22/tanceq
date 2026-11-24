import Link from "next/link";
import type { CountrySite } from "@/lib/types";
import { formatRelativeArabic } from "@/lib/format";
import { getAdminUrl, getSiteOrigin } from "@/lib/sites-client";
import { StatusDot } from "./StatusDot";

export function CountryCard({ site }: { site: CountrySite }) {
  const adminUrl = getAdminUrl(site);

  return (
    <article className="country-row" style={{ ["--row-accent" as string]: site.color }}>
      <Link href={`/sites/${site.id}`} className="country-row-main">
        <span className="country-flag" aria-hidden>
          {site.flag}
        </span>
        <span className="country-copy">
          <strong>ركن التطور — {site.country}</strong>
          <small dir="ltr">{getSiteOrigin(site)}</small>
        </span>
        <StatusDot status={site.lastStatus} showLabel />
        <span className="country-meta">
          آخر فحص: {formatRelativeArabic(site.lastCheckedAt)}
        </span>
      </Link>

      <div className="country-row-actions">
        <a
          href={adminUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary compact"
        >
          فتح ووردبريس
        </a>
        <Link href={`/sites/${site.id}`} className="btn-ghost compact">
          التفاصيل
        </Link>
      </div>
    </article>
  );
}
