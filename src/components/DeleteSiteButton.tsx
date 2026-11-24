"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function DeleteSiteButton({
  siteId,
  country,
}: {
  siteId: string;
  country: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    const confirmed = window.confirm(
      `هل تريد حذف تثبيت ركن التطور في ${country} من لوحة الإدارة؟\nلن يُحذف موقع ووردبريس نفسه.`,
    );
    if (!confirmed) return;

    setError(null);
    try {
      const response = await fetch(`/api/sites/${siteId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("فشل الحذف");
      startTransition(() => {
        router.push("/");
        router.refresh();
      });
    } catch {
      setError("تعذر حذف الدولة من القائمة");
    }
  }

  return (
    <div className="health-action">
      <button
        type="button"
        className="btn-danger"
        onClick={remove}
        disabled={pending}
      >
        {pending ? "جاري الحذف..." : "حذف من اللوحة"}
      </button>
      {error ? <span className="form-error">{error}</span> : null}
    </div>
  );
}
