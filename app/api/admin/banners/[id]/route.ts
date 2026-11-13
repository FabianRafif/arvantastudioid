import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    const updated = await prisma.banner.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: String(body.title).trim() }),
        ...(body.subtitle !== undefined && { subtitle: body.subtitle ? String(body.subtitle).trim() : null }),
        ...(body.badge !== undefined && { badge: body.badge ? String(body.badge).trim() : null }),
        ...(body.imageUrl !== undefined && { imageUrl: String(body.imageUrl).trim() }),
        ...(body.targetUrl !== undefined && { targetUrl: body.targetUrl ? String(body.targetUrl).trim() : null }),
        ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      },
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
    return NextResponse.json({ success: true, message: "Banner berhasil dihapus." });
  } catch (error: any) {
    console.error("Admin delete banner error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
