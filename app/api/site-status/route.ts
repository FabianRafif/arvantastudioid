import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "maintenance_mode",
            "maintenance_title",
            "maintenance_message",
            "maintenance_eta",
          ],
        },
      },
    });

    const map = new Map(settings.map((s) => [s.key, s.value]));

    const isMaintenance = map.get("maintenance_mode") === "true";
    const title = map.get("maintenance_title") || "Pemeliharaan Sistem Terjadwal";
    const message =
      map.get("maintenance_message") ||
      "Kami sedang melakukan peningkatan infrastruktur server dan basis data untuk memberikan performa yang lebih optimal dan aman bagi seluruh klien Arvanta Studio.";
    const eta = map.get("maintenance_eta") || "Segera kembali dalam waktu dekat";

    return NextResponse.json(
      {
        success: true,
        isMaintenance,
        title,
        message,
        eta,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch {
    return NextResponse.json({
      success: true,
      isMaintenance: false,
      title: "",
      message: "",
      eta: "",
    });
  }
}
