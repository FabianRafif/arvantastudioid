import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/security";

export async function GET() {
  try {
    const settingsList = await prisma.siteSetting.findMany();
    const settings: Record<string, string> = {};
    for (const s of settingsList) {
      settings[s.key] = s.value;
    }
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat pengaturan." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await req.json();
    const updates = body.settings as Record<string, string>;

    if (!updates) {
      return NextResponse.json({ error: "Data pengaturan kosong." }, { status: 400 });
    }

    for (const [key, value] of Object.entries(updates)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    await logActivity({
      userId: session.userId,
      action: "UPDATE_SITE_SETTINGS",
      details: `Pembaruan konfigurasi studio oleh ${session.username}`,
    });

    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan." });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menyimpan pengaturan." }, { status: 500 });
  }
}
