import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const limit = Number(searchParams.get("limit")) || 20;
    const isUrgentOnly = searchParams.get("urgent") === "true";
    const isBar = searchParams.get("bar") === "true";

    const now = new Date();

    const where: any = {
      status: "PUBLISHED",
      isActive: true,
      publishDate: { lte: now },
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    };

    if (isUrgentOnly) {
      where.priority = { in: ["URGENT", "PENTING"] };
    } else if (isBar) {
      // Pengumuman Bar menampilkan pengumuman aktif berurutan: URGENT -> PENTING -> NORMAL
    } else if (priority && priority !== "ALL") {
      where.priority = priority.toUpperCase();
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [
        { priority: "desc" }, // URGENT, PENTING, NORMAL
        { publishDate: "desc" },
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        summary: true,
        content: true,
        imageUrl: true,
        priority: true,
        publishDate: true,
        endDate: true,
        authorName: true,
        views: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        announcements,
        total: announcements.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    console.error("Public fetch announcements error:", error);
    return NextResponse.json({ success: true, announcements: [] });
  }
}
