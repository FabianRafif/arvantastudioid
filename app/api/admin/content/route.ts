import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/security";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const settings = await prisma.siteSetting.findMany();
    const settingsMap: { [key: string]: string } = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    for (const [key, val] of Object.entries(body)) {
      if (typeof val === "string") {
        await prisma.siteSetting.upsert({
          where: { key },
          update: { value: val },
          create: { key, value: val, description: `Konten dinamis ${key}` },
        });
      }
    }

    await logActivity({
      userId: session.userId,
      action: "CMS_UPDATE",
      entityType: "SITE_SETTINGS",
      details: "Konten teks website & headline beranda diperbarui oleh administrator.",
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true, message: "Konten website berhasil disimpan dan dipublikasikan." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
