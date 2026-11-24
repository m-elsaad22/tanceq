"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function CheckAllButton({ siteIds }: { siteIds: string[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  async function checkAll() {
    setMessage(null);
    let online = 0;
    for (const id of siteIds) {
      try {
        const response = await fetch(`/api/sites/${id}/health`, {
          method: "POST",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.status === "online") online += 1;
        }
      } catch {
        // continue remaining sites
      }
    }
    setMessage(`تم الفحص: ${online} متصل من ${siteIds.length}`);
    startTransition(() => router.refresh());
  }

  return (
    <div className="health-action">
      <button
        type="button"
        className="btn-ghost"
        onClick={checkAll}
        disabled={pending || siteIds.length === 0}
      >
        {pending ? "جاري فحص كل الدول..." : "فحص كل المواقع"}
      </button>
      {message ? <span className="form-hint">{message}</span> : null}
    </div>
  );
}
