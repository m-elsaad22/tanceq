import { NextResponse } from "next/server";
import { createSite, listSites } from "@/lib/sites";
import type { CountrySiteInput } from "@/lib/types";

export async function GET() {
  const sites = await listSites();
  return NextResponse.json(sites);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CountrySiteInput;
    if (!body?.country?.trim() || !body?.url?.trim()) {
      return NextResponse.json(
        { error: "اسم الدولة ورابط الموقع مطلوبان" },
        { status: 400 },
      );
    }
    const site = await createSite({
      ...body,
      countryCode: body.countryCode || "XX",
    });
    return NextResponse.json(site, { status: 201 });
  } catch {
    return NextResponse.json({ error: "تعذر إضافة الدولة" }, { status: 500 });
  }
}
