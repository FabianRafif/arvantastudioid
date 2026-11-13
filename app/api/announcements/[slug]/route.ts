import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const now = new Date();

    const announcement = await prisma.announcement.findFirst({
      where: {
        slug,
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
      },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: "Pengumuman tidak ditemukan atau sudah kedaluwarsa." },
        { status: 404 }
      );
    }

    // Safely increment views in background
    try {
      await prisma.announcement.update({
        where: { id: announcement.id },
        data: { views: { increment: 1 } },
      });
    } catch {}

    return NextResponse.json(
      {
        success: true,
        announcement,
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
    console.error("Public fetch single announcement error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
