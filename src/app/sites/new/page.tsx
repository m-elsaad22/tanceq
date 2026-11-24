import { AppHeader } from "@/components/AppHeader";
import { SiteForm } from "@/components/SiteForm";
import { listSites } from "@/lib/sites";

export const dynamic = "force-dynamic";

export default async function NewSitePage() {
  const sites = await listSites();

  return (
    <div className="page-shell">
      <AppHeader sites={sites} />
      <main className="page-main narrow">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h2>إضافة دولة</h2>
              <p>
                سجّل رابط تثبيت ووردبريس لركن التطور في الدولة، ثم افتح لوحته من
                هنا مباشرة.
              </p>
            </div>
          </div>
          <SiteForm mode="create" />
        </section>
      </main>
    </div>
  );
}
