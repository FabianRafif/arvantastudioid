import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "ALL";
    const status = searchParams.get("status")?.trim().toUpperCase() || "ALL";
    const priority = searchParams.get("priority")?.trim().toUpperCase() || "ALL";

    const where: any = {};

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { summary: { contains: q } },
        { content: { contains: q } },
      ];
    }

    if (category !== "ALL") {
      where.category = category;
    }

    if (status !== "ALL") {
      where.status = status;
    }

    if (priority !== "ALL") {
      where.priority = priority;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [{ publishDate: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(
      { success: true, announcements },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    console.error("Admin fetch announcements error:", error);
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
      slug: customSlug,
      category,
      content,
      summary,
      imageUrl,
      priority,
      status,
      publishDate,
      endDate,
      authorName,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Judul dan isi pengumuman wajib diisi." },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = slugify(customSlug || title) || `pengumuman-${Date.now()}`;
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.announcement.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const effectiveStatus = status === "DRAFT" ? "DRAFT" : "PUBLISHED";
    const effectiveIsActive = effectiveStatus === "PUBLISHED";
    const effectivePriority = ["NORMAL", "PENTING", "URGENT"].includes(priority)
      ? priority
      : "NORMAL";

    const newAnnouncement = await prisma.announcement.create({
      data: {
        title: String(title).trim(),
        slug: finalSlug,
        category: category ? String(category).trim() : "PROMO",
        content: String(content),
        summary: summary ? String(summary).trim() : null,
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
        priority: effectivePriority,
        status: effectiveStatus,
        isActive: effectiveIsActive,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        authorName: authorName ? String(authorName).trim() : session.fullName || "Admin Arvanta",
      },
    });

    await prisma.siteSetting.upsert({
      where: { key: "last_data_version" },
      update: { value: String(Date.now()) },
      create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp data version" },
    });

    return NextResponse.json({ success: true, announcement: newAnnouncement });
  } catch (error: any) {
    console.error("Admin create announcement error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
