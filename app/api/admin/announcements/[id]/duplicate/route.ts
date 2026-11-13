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
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pengumuman tidak ditemukan" }, { status: 404 });
    }

    const uniqueSuffix = Date.now().toString().slice(-4);
    const newSlug = `${existing.slug}-salinan-${uniqueSuffix}`;

    const cloned = await prisma.announcement.create({
      data: {
        title: `${existing.title} (Salinan)`,
        slug: newSlug,
        category: existing.category,
        content: existing.content,
        summary: existing.summary,
        imageUrl: existing.imageUrl,
        priority: existing.priority,
        status: "DRAFT",
        isActive: false,
        publishDate: new Date(),
        endDate: existing.endDate,
        authorName: existing.authorName,
      },
    });

    await prisma.siteSetting.upsert({
      where: { key: "last_data_version" },
      update: { value: String(Date.now()) },
      create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp data version" },
    });

    return NextResponse.json({ success: true, announcement: cloned });
  } catch (error: any) {
    console.error("Duplicate announcement error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
