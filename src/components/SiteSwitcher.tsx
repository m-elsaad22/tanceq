"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { CountrySite } from "@/lib/types";
import { getSiteOrigin } from "@/lib/sites-client";
import { StatusDot } from "./StatusDot";

export function SiteSwitcher({
  sites,
  currentId,
}: {
  sites: CountrySite[];
  currentId?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const current =
    sites.find((site) => site.id === currentId) ||
    sites.find((site) => pathname.startsWith(`/sites/${site.id}`));

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="site-switcher" ref={ref}>
      <button
        type="button"
        className="site-switcher-trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="site-flag" aria-hidden>
          {current?.flag || "🌍"}
        </span>
        <span className="site-switcher-copy">
          <strong>{current ? `ركن التطور — ${current.country}` : "اختر دولة"}</strong>
          <small>
            {current ? getSiteOrigin(current) : "التنقل بين كل الدول بسرعة"}
          </small>
        </span>
        <span className="chevron" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div className="site-switcher-panel" id={panelId} role="listbox">
          <div className="site-switcher-heading">دول ركن التطور</div>
          <ul>
            {sites.map((site) => (
              <li key={site.id}>
                <button
                  type="button"
                  className={site.id === current?.id ? "is-active" : undefined}
                  onClick={() => {
                    setOpen(false);
                    router.push(`/sites/${site.id}`);
                  }}
                >
                  <span className="site-flag" aria-hidden>
                    {site.flag}
                  </span>
                  <span className="site-switcher-copy">
                    <strong>{site.country}</strong>
                    <small>{getSiteOrigin(site)}</small>
                  </span>
                  <StatusDot status={site.lastStatus} />
                </button>
              </li>
            ))}
          </ul>
          <Link
            href="/sites/new"
            className="site-switcher-add"
            onClick={() => setOpen(false)}
          >
            + إضافة دولة جديدة
          </Link>
        </div>
      ) : null}
    </div>
  );
}
