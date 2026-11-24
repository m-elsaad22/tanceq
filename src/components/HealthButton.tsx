"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function HealthButton({ siteId }: { siteId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function check() {
    setError(null);
    try {
      const response = await fetch(`/api/sites/${siteId}/health`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("فشل الفحص");
      }
      startTransition(() => router.refresh());
    } catch {
      setError("تعذر فحص الموقع");
    }
  }

  return (
    <div className="health-action">
      <button
        type="button"
        className="btn-ghost"
        onClick={check}
        disabled={pending}
      >
        {pending ? "جاري الفحص..." : "فحص الحالة"}
      </button>
      {error ? <span className="form-error">{error}</span> : null}
    </div>
  );
}
