import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status")?.trim().toUpperCase() || "ALL";

    const where: any = {};

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { subtitle: { contains: q } },
        { badge: { contains: q } },
      ];
    }

    if (status === "PUBLISHED") {
      where.status = "PUBLISHED";
      where.isActive = true;
    } else if (status === "DRAFT") {
      where.OR = [
        { status: "DRAFT" },
        { isActive: false },
      ];
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(
      { success: true, banners },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    console.error("Admin fetch banners error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      subtitle,
      badge,
      imageUrl,
      targetUrl,
      sortOrder,
      status,
      isActive,
      startDate,
      endDate,
    } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "File gambar banner wajib diisi." },
        { status: 400 }
      );
    }

    const effectiveTitle = (title || "BANNER PROMOSI ARVANTA").trim();
    const effectiveStatus = status === "DRAFT" ? "DRAFT" : "PUBLISHED";
    const effectiveIsActive = isActive !== undefined ? Boolean(isActive) : effectiveStatus === "PUBLISHED";

    const newBanner = await prisma.banner.create({
      data: {
        title: effectiveTitle,
        subtitle: subtitle ? String(subtitle).trim() : null,
        badge: badge ? String(badge).trim() : "PROMO SPESIAL",
        imageUrl: String(imageUrl).trim(),
        targetUrl: targetUrl ? String(targetUrl).trim() : "/order",
        sortOrder: Number(sortOrder) || 0,
        status: effectiveStatus,
        isActive: effectiveIsActive,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
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
