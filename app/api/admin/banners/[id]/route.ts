import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
    const banner = await prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      return NextResponse.json({ error: "Banner tidak ditemukan" }, { status: 404 });
    }
    return NextResponse.json({ success: true, banner });
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

    const data: any = {};
    if (body.title !== undefined) data.title = String(body.title).trim();
    if (body.subtitle !== undefined) data.subtitle = body.subtitle ? String(body.subtitle).trim() : null;
    if (body.badge !== undefined) data.badge = body.badge ? String(body.badge).trim() : null;
    if (body.imageUrl !== undefined) data.imageUrl = String(body.imageUrl).trim();
    if (body.targetUrl !== undefined) data.targetUrl = body.targetUrl ? String(body.targetUrl).trim() : null;
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);
    
    if (body.status !== undefined) {
      data.status = body.status === "DRAFT" ? "DRAFT" : "PUBLISHED";
      data.isActive = data.status === "PUBLISHED";
    } else if (body.isActive !== undefined) {
      data.isActive = Boolean(body.isActive);
      data.status = data.isActive ? "PUBLISHED" : "DRAFT";
    }

    if (body.startDate !== undefined) {
      data.startDate = body.startDate ? new Date(body.startDate) : null;
    }
    if (body.endDate !== undefined) {
      data.endDate = body.endDate ? new Date(body.endDate) : null;
    }

    const updated = await prisma.banner.update({
      where: { id },
      data,
    });

    await prisma.siteSetting.upsert({
      where: { key: "last_data_version" },
      update: { value: String(Date.now()) },
      create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp data version" },
    });

    return NextResponse.json({ success: true, banner: updated });
  } catch (error: any) {
    console.error("Admin update banner error:", error);
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
    await prisma.banner.delete({ where: { id } });

    await prisma.siteSetting.upsert({
      where: { key: "last_data_version" },
      update: { value: String(Date.now()) },
      create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp data version" },
    });

    return NextResponse.json({ success: true, message: "Banner berhasil dihapus." });
  } catch (error: any) {
    console.error("Admin delete banner error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
