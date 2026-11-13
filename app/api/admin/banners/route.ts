import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({ success: true, banners });
  } catch (error: any) {
    console.error("Admin fetch banners error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subtitle, badge, imageUrl, targetUrl, sortOrder, isActive } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "File gambar banner wajib diisi." },
        { status: 400 }
      );
    }

    const effectiveTitle = (title || "BANNER PROMOSI ARVANTA").trim();

    const newBanner = await prisma.banner.create({
      data: {
        title: effectiveTitle,
        subtitle: subtitle ? String(subtitle).trim() : null,
        badge: badge ? String(badge).trim() : "PROMO SPESIAL",
        imageUrl: String(imageUrl).trim(),
        targetUrl: targetUrl ? String(targetUrl).trim() : "/order",
        sortOrder: Number(sortOrder) || 0,
        isActive: isActive !== false,
      },
    });

    await prisma.siteSetting.upsert({
      where: { key: "last_data_version" },
      update: { value: String(Date.now()) },
      create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp data version" },
    });

    return NextResponse.json({ success: true, banner: newBanner });
  } catch (error: any) {
    console.error("Admin create banner error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
