import { NextResponse } from "next/server";
import { deleteSite, getSite, updateSite } from "@/lib/sites";
import type { CountrySiteInput } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const site = await getSite(id);
  if (!site) {
    return NextResponse.json({ error: "الدولة غير موجودة" }, { status: 404 });
  }
  return NextResponse.json(site);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = (await request.json()) as Partial<CountrySiteInput>;
    const site = await updateSite(id, body);
    if (!site) {
      return NextResponse.json({ error: "الدولة غير موجودة" }, { status: 404 });
    }
    return NextResponse.json(site);
  } catch {
    return NextResponse.json({ error: "تعذر تحديث الدولة" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const ok = await deleteSite(id);
  if (!ok) {
    return NextResponse.json({ error: "الدولة غير موجودة" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
