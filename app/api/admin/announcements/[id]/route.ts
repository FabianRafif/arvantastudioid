import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { broadcastNotificationToAllClients } from "@/lib/push";

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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      return NextResponse.json({ error: "Pengumuman tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, announcement });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pengumuman tidak ditemukan" }, { status: 404 });
    }

    const data: any = {};
    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.category !== undefined) data.category = String(body.category).trim();
    if (body.content !== undefined) data.content = String(body.content);
    if (body.summary !== undefined) data.summary = body.summary ? String(body.summary).trim() : null;
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl ? String(body.imageUrl).trim() : null;
    if (body.priority !== undefined) {
      data.priority = ["NORMAL", "PENTING", "URGENT"].includes(body.priority)
        ? body.priority
        : "NORMAL";
    }

    if (body.status !== undefined) {
      data.status = body.status === "DRAFT" ? "DRAFT" : "PUBLISHED";
      data.isActive = data.status === "PUBLISHED";
    } else if (body.isActive !== undefined) {
      data.isActive = Boolean(body.isActive);
      data.status = data.isActive ? "PUBLISHED" : "DRAFT";
    }

    if (body.publishDate !== undefined) {
      data.publishDate = body.publishDate ? new Date(body.publishDate) : new Date();
    }
    if (body.endDate !== undefined) {
      data.endDate = body.endDate ? new Date(body.endDate) : null;
    }

    // Slug check if slug was changed
    if (body.slug && body.slug !== existing.slug) {
      let baseSlug = slugify(body.slug);
      let finalSlug = baseSlug;
      let counter = 1;
      while (
        await prisma.announcement.findFirst({
          where: { slug: finalSlug, NOT: { id } },
        })
      ) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      data.slug = finalSlug;
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data,
    });

    await prisma.siteSetting.upsert({
      where: { key: "last_data_version" },
      update: { value: String(Date.now()) },
      create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp data version" },
    });

    let broadcastStats = { totalInApp: 0, totalPush: 0 };
    const shouldBroadcast =
      updated.status === "PUBLISHED" &&
      updated.isActive &&
      (existing.status !== "PUBLISHED" || body.broadcast === true);

    if (shouldBroadcast) {
      try {
        const cleanSnippet = (updated.summary || updated.content.replace(/<[^>]*>?/gm, ""))
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 160);

        const res = await broadcastNotificationToAllClients({
          title: `📢 ${updated.title.trim()}`,
          message: cleanSnippet || "Ada pembaruan pengumuman resmi dari Arvanta Studio.",
          link: `/pengumuman/${updated.slug}`,
          type: "ANNOUNCEMENT",
        });

        broadcastStats = {
          totalInApp: res.totalInApp,
          totalPush: res.pushResult.totalSent,
        };
      } catch (e) {
        console.error("Failed to broadcast announcement update to clients:", e);
      }
    }

    return NextResponse.json({
      success: true,
      announcement: updated,
      broadcastStats,
    });
  } catch (error: any) {
    console.error("Admin update announcement error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.announcement.delete({ where: { id } });

    await prisma.siteSetting.upsert({
      where: { key: "last_data_version" },
      update: { value: String(Date.now()) },
      create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp data version" },
    });

    return NextResponse.json({ success: true, message: "Pengumuman berhasil dihapus." });
  } catch (error: any) {
    console.error("Admin delete announcement error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
