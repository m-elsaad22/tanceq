import Link from "next/link";
import type { CountrySite } from "@/lib/types";
import { SiteSwitcher } from "./SiteSwitcher";

export function AppHeader({
  sites,
  currentId,
}: {
  sites: CountrySite[];
  currentId?: string;
}) {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden />
          <span className="brand-text">
            <strong>ركن التطور</strong>
            <small>إدارة المواقع حسب الدولة</small>
          </span>
        </Link>

        <SiteSwitcher sites={sites} currentId={currentId} />

        <nav className="header-nav" aria-label="التنقل الرئيسي">
          <Link href="/">كل الدول</Link>
          <Link href="/sites/new" className="btn-primary compact">
            إضافة دولة
          </Link>
        </nav>
      </div>
    </header>
  );
}
