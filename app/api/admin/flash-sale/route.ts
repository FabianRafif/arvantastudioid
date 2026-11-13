import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { isActive, title, subtitle, discountPercent, voucherCode, endTime } = body;

    const updates = [
      { key: "flash_sale_active", value: isActive ? "true" : "false" },
      ...(title ? [{ key: "flash_sale_title", value: String(title).trim() }] : []),
      ...(subtitle ? [{ key: "flash_sale_subtitle", value: String(subtitle).trim() }] : []),
      ...(discountPercent ? [{ key: "flash_sale_discount_percent", value: String(discountPercent).trim() }] : []),
      ...(voucherCode ? [{ key: "flash_sale_voucher_code", value: String(voucherCode).trim() }] : []),
      ...(endTime ? [{ key: "flash_sale_end_time", value: String(endTime).trim() }] : []),
    ];

    for (const item of updates) {
      await prisma.siteSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value, description: "Pengaturan Promo & Flash Sale" },
      });
    }

    await prisma.siteSetting.upsert({
      where: { key: "last_data_version" },
      update: { value: String(Date.now()) },
      create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp data version" },
    });

    return NextResponse.json({ success: true, message: "Pengaturan Promo & Flash Sale berhasil diperbarui. Seluruh website otomatis tersinkronisasi." });
  } catch (error: any) {
    console.error("Flash sale update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
