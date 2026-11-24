import { NextResponse } from "next/server";
import { getSite, updateSite } from "@/lib/sites";
import type { SiteStatus } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) {
    return NextResponse.json({ error: "الدولة غير موجودة" }, { status: 404 });
  }

  let status: SiteStatus = "offline";
  let latencyMs: number | null = null;
  const started = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(site.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "RuknAlTatawur-Manager/1.0" },
      cache: "no-store",
    });
    clearTimeout(timeout);
    latencyMs = Date.now() - started;
    status = response.ok || response.status < 500 ? "online" : "offline";
  } catch {
    status = "offline";
    latencyMs = Date.now() - started;
  }

  const checkedAt = new Date().toISOString();
  const updated = await updateSite(id, {
    lastStatus: status,
    lastCheckedAt: checkedAt,
  });

  return NextResponse.json({
    id,
    status,
    latencyMs,
    checkedAt,
    site: updated,
  });
}
