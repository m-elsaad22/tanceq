import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { DeleteSiteButton } from "@/components/DeleteSiteButton";
import { HealthButton } from "@/components/HealthButton";
import { StatusDot } from "@/components/StatusDot";
import { formatRelativeArabic } from "@/lib/format";
import { getSite, listSites } from "@/lib/sites";
import { getAdminUrl, getSiteOrigin } from "@/lib/sites-client";
import { ADMIN_SHORTCUTS } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function SitePage({ params }: Params) {
  const { id } = await params;
  const [site, sites] = await Promise.all([getSite(id), listSites()]);
  if (!site) notFound();

  const adminUrl = getAdminUrl(site);
  const currentIndex = sites.findIndex((item) => item.id === site.id);
  const prev = currentIndex > 0 ? sites[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < sites.length - 1
      ? sites[currentIndex + 1]
      : null;

  return (
    <div className="page-shell">
      <AppHeader sites={sites} currentId={site.id} />

      <main className="page-main">
        <section className="site-hero" style={{ ["--site-accent" as string]: site.color }}>
          <div className="site-hero-top">
            <span className="site-hero-flag" aria-hidden>
              {site.flag}
            </span>
            <div>
              <p className="hero-kicker">تثبيت ووردبريس</p>
              <h1>ركن التطور — {site.country}</h1>
              <p className="hero-lead" dir="ltr">
                {getSiteOrigin(site)}
              </p>
            </div>
          </div>

          <div className="site-hero-meta">
            <StatusDot status={site.lastStatus} showLabel />
            <span>آخر فحص: {formatRelativeArabic(site.lastCheckedAt)}</span>
            <HealthButton siteId={site.id} />
          </div>

          <div className="hero-actions">
            <a
              href={adminUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              فتح لوحة تحكم ووردبريس
            </a>
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              زيارة الموقع
            </a>
            <Link href={`/sites/${site.id}/edit`} className="btn-ghost">
              تعديل البيانات
            </Link>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>اختصارات لوحة ووردبريس</h2>
              <p>انتقل مباشرة إلى أقسام الإدارة في موقع {site.country}</p>
            </div>
          </div>
          <div className="shortcut-grid">
            {ADMIN_SHORTCUTS.map((item) => (
              <a
                key={item.id}
                href={getAdminUrl(site, item.path)}
                target="_blank"
                rel="noopener noreferrer"
                className="shortcut-link"
              >
                {item.label}
              </a>
            ))}
          </div>
        </section>

        <section className="panel split">
          <div>
            <h2>التنقل بين الدول</h2>
            <p>انتقل للدولة السابقة أو التالية بدون الرجوع للقائمة.</p>
            <div className="hero-actions">
              {prev ? (
                <Link href={`/sites/${prev.id}`} className="btn-ghost">
                  السابق: {prev.flag} {prev.country}
                </Link>
              ) : (
                <span className="btn-ghost disabled">لا توجد دولة سابقة</span>
              )}
              {next ? (
                <Link href={`/sites/${next.id}`} className="btn-ghost">
                  التالي: {next.flag} {next.country}
                </Link>
              ) : (
                <span className="btn-ghost disabled">لا توجد دولة تالية</span>
              )}
            </div>
          </div>

          <div>
            <h2>ملاحظات</h2>
            <p className="notes-box">{site.notes || "لا توجد ملاحظات."}</p>
            <DeleteSiteButton siteId={site.id} country={site.country} />
          </div>
        </section>
      </main>
    </div>
  );
}
