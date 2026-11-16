import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { broadcastNotificationToAllClients } from "@/lib/push";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionUser();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    return NextResponse.json({
      success: true,
      isMaintenance: map.get("maintenance_mode") === "true",
      title: map.get("maintenance_title") || "Pemeliharaan Sistem Terjadwal",
      message:
        map.get("maintenance_message") ||
        "Kami sedang melakukan peningkatan infrastruktur server dan basis data untuk memberikan performa yang lebih optimal dan aman bagi seluruh klien Arvanta Studio.",
      eta: map.get("maintenance_eta") || "Segera kembali dalam waktu dekat",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { isMaintenance, title, message, eta, notifyClients } = body;

    const strIsMaintenance = isMaintenance ? "true" : "false";

    await prisma.$transaction([
      prisma.siteSetting.upsert({
        where: { key: "maintenance_mode" },
        update: { value: strIsMaintenance },
        create: { key: "maintenance_mode", value: strIsMaintenance, description: "Website maintenance lock mode" },
      }),
      prisma.siteSetting.upsert({
        where: { key: "maintenance_title" },
        update: { value: String(title || "Pemeliharaan Sistem Terjadwal").trim() },
        create: { key: "maintenance_title", value: String(title || "Pemeliharaan Sistem Terjadwal").trim(), description: "Maintenance headline" },
      }),
      prisma.siteSetting.upsert({
        where: { key: "maintenance_message" },
        update: { value: String(message || "").trim() },
        create: { key: "maintenance_message", value: String(message || "").trim(), description: "Maintenance details message" },
      }),
      prisma.siteSetting.upsert({
        where: { key: "maintenance_eta" },
        update: { value: String(eta || "").trim() },
        create: { key: "maintenance_eta", value: String(eta || "").trim(), description: "Maintenance ETA string" },
      }),
      prisma.siteSetting.upsert({
        where: { key: "last_data_version" },
        update: { value: String(Date.now()) },
        create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp data version" },
      }),
    ]);

    // If activating maintenance and notifyClients is requested, broadcast to all clients!
    if (isMaintenance && notifyClients !== false) {
      try {
        await broadcastNotificationToAllClients({
          title: `⚠️ ${title || "Pemeliharaan Sistem Sedang Berlangsung"}`,
          message: `${message ? message.slice(0, 140) + "... " : ""}Estimasi selesai: ${eta || "Segera kembali"}. Hubungi WhatsApp admin jika mendesak.`,
          link: "/maintenance",
          type: "MAINTENANCE",
        });
      } catch (err) {
        console.error("Failed to broadcast maintenance notification:", err);
      }
    }

    return NextResponse.json({
      success: true,
      isMaintenance: Boolean(isMaintenance),
      message: isMaintenance
        ? "Mode Maintenance BERHASIL DIAKTIFKAN. Seluruh akses website untuk publik dan klien telah dikunci."
        : "Mode Maintenance BERHASIL DINONAKTIFKAN. Seluruh website telah dibuka kembali untuk publik.",
    });
  } catch (error: any) {
    console.error("Admin toggle maintenance error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
