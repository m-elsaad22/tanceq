import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { SiteForm } from "@/components/SiteForm";
import { getSite, listSites } from "@/lib/sites";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function EditSitePage({ params }: Params) {
  const { id } = await params;
  const [site, sites] = await Promise.all([getSite(id), listSites()]);
  if (!site) notFound();

  return (
    <div className="page-shell">
      <AppHeader sites={sites} currentId={site.id} />
      <main className="page-main narrow">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>
                تعديل {site.flag} {site.country}
              </h2>
              <p>حدّث رابط التثبيت أو مسار لوحة ووردبريس لهذه الدولة.</p>
            </div>
          </div>
          <SiteForm mode="edit" initial={site} />
        </section>
      </main>
    </div>
  );
}
