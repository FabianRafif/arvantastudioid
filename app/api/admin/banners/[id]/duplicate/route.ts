import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Banner tidak ditemukan" }, { status: 404 });
    }

    const maxSort = await prisma.banner.aggregate({
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder || 0) + 1;

    const cloned = await prisma.banner.create({
      data: {
        title: `${existing.title} (Salinan)`,
        subtitle: existing.subtitle,
        badge: existing.badge,
        imageUrl: existing.imageUrl,
        targetUrl: existing.targetUrl,
        sortOrder: nextSort,
        status: "DRAFT",
        isActive: false,
        startDate: existing.startDate,
        endDate: existing.endDate,
      },
    });

    await prisma.siteSetting.upsert({
      where: { key: "last_data_version" },
      update: { value: String(Date.now()) },
      create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp data version" },
    });

    return NextResponse.json({ success: true, banner: cloned });
  } catch (error: any) {
    console.error("Duplicate banner error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
