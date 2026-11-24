import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { CheckAllButton } from "@/components/CheckAllButton";
import { CountryCard } from "@/components/CountryCard";
import { listSites } from "@/lib/sites";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sites = await listSites();
  const online = sites.filter((site) => site.lastStatus === "online").length;

  return (
    <div className="page-shell">
      <AppHeader sites={sites} />

      <main className="page-main">
        <section className="hero">
          <div className="hero-glow" aria-hidden />
          <p className="hero-kicker">لوحة الإدارة المركزية</p>
          <h1>ركن التطور</h1>
          <p className="hero-lead">
            أدِر كل تثبيتات ووردبريس — دولة بدولة — من مكان واحد، وانتقل إلى لوحة
            تحكم أي دولة بضغطة واحدة.
          </p>
          <div className="hero-actions">
            <Link href="/sites/new" className="btn-primary">
              إضافة دولة
            </Link>
            {sites[0] ? (
              <Link href={`/sites/${sites[0].id}`} className="btn-ghost">
                فتح أول دولة
              </Link>
            ) : null}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>كل الدول</h2>
              <p>
                {sites.length} تثبيت ووردبريس
                {sites.length ? ` · ${online} متصل` : ""}
              </p>
            </div>
            <CheckAllButton siteIds={sites.map((site) => site.id)} />
          </div>

          {sites.length === 0 ? (
            <div className="empty-state">
              <p>لا توجد دول بعد. أضف أول تثبيت لووردبريس لركن التطور.</p>
              <Link href="/sites/new" className="btn-primary">
                إضافة دولة
              </Link>
            </div>
          ) : (
            <div className="country-list">
              {sites.map((site) => (
                <CountryCard key={site.id} site={site} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
