"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { COUNTRY_PRESETS, type CountrySite } from "@/lib/types";

export function SiteForm({
  initial,
  mode = "create",
}: {
  initial?: CountrySite;
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [country, setCountry] = useState(initial?.country || "");
  const [countryCode, setCountryCode] = useState(initial?.countryCode || "");
  const [flag, setFlag] = useState(initial?.flag || "");
  const [url, setUrl] = useState(initial?.url || "");
  const [adminPath, setAdminPath] = useState(initial?.adminPath || "/wp-admin");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [color, setColor] = useState(initial?.color || COUNTRY_PRESETS[0].color);

  const usedCodes = useMemo(() => new Set<string>(), []);

  function applyPreset(code: string) {
    const preset = COUNTRY_PRESETS.find((item) => item.countryCode === code);
    if (!preset) return;
    setCountry(preset.country);
    setCountryCode(preset.countryCode);
    setFlag(preset.flag);
    setColor(preset.color);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      country,
      countryCode,
      flag,
      url,
      adminPath,
      notes,
      color,
    };

    try {
      const response = await fetch(
        mode === "edit" && initial
          ? `/api/sites/${initial.id}`
          : "/api/sites",
        {
          method: mode === "edit" ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "تعذر الحفظ");
      }

      startTransition(() => {
        router.push(`/sites/${data.id}`);
        router.refresh();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر الحفظ");
    }
  }

  return (
    <form className="site-form" onSubmit={onSubmit}>
      <div className="form-block">
        <label htmlFor="preset">اختيار سريع لدولة</label>
        <select
          id="preset"
          value={countryCode}
          onChange={(event) => applyPreset(event.target.value)}
        >
          <option value="">— اختر من القائمة أو اكتب يدوياً —</option>
          {COUNTRY_PRESETS.map((preset) => (
            <option
              key={preset.countryCode}
              value={preset.countryCode}
              disabled={usedCodes.has(preset.countryCode)}
            >
              {preset.flag} {preset.country}
            </option>
          ))}
        </select>
      </div>

      <div className="form-grid">
        <div className="form-block">
          <label htmlFor="country">اسم الدولة</label>
          <input
            id="country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="مثال: السعودية"
            required
          />
        </div>
        <div className="form-block">
          <label htmlFor="countryCode">رمز الدولة</label>
          <input
            id="countryCode"
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value.toUpperCase())}
            placeholder="SA"
            maxLength={3}
            required
          />
        </div>
        <div className="form-block">
          <label htmlFor="flag">العلم</label>
          <input
            id="flag"
            value={flag}
            onChange={(event) => setFlag(event.target.value)}
            placeholder="🇸🇦"
          />
        </div>
        <div className="form-block">
          <label htmlFor="color">اللون</label>
          <input
            id="color"
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </div>
      </div>

      <div className="form-block">
        <label htmlFor="url">رابط موقع ركن التطور في هذه الدولة</label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://sa.example.com"
          required
          dir="ltr"
        />
      </div>

      <div className="form-block">
        <label htmlFor="adminPath">مسار لوحة ووردبريس</label>
        <input
          id="adminPath"
          value={adminPath}
          onChange={(event) => setAdminPath(event.target.value)}
          placeholder="/wp-admin"
          dir="ltr"
        />
      </div>

      <div className="form-block">
        <label htmlFor="notes">ملاحظات</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="بيانات الدخول، الاستضافة، أو أي ملاحظة إدارية"
        />
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending
            ? "جاري الحفظ..."
            : mode === "edit"
              ? "حفظ التعديلات"
              : "إضافة الدولة"}
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => router.back()}
          disabled={pending}
        >
          رجوع
        </button>
      </div>
    </form>
  );
}
