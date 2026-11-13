import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/security";

export async function GET() {
  try {
    const items = await prisma.designCatalog.findMany({
      include: {
        category: true,
        images: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const categories = await prisma.designCategory.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ items, categories });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat katalog desain." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      categoryId,
      description,
      priceStarting,
      priceFinal,
      deliveryDays,
      revisions,
      fileFormats,
      previewImage,
      isFeatured,
    } = body;

    if (!name || !slug || !categoryId) {
      return NextResponse.json({ error: "Nama, slug, dan kategori desain wajib diisi." }, { status: 400 });
    }

    const item = await prisma.designCatalog.create({
      data: {
        name,
        slug: slug.toLowerCase().trim(),
        categoryId,
        description: description || "",
        priceStarting: parseInt(priceStarting || "50000", 10),
        priceFinal: priceFinal ? parseInt(priceFinal, 10) : null,
        deliveryDays: parseInt(deliveryDays || "2", 10),
        revisions: parseInt(revisions || "3", 10),
        fileFormats: fileFormats || "AI, EPS, PNG, JPG, PDF",
        previewImage: previewImage || "/portfolio/logo-design.jpg",
        isFeatured: Boolean(isFeatured),
        isActive: true,
      },
    });

    await logActivity({
      userId: session.userId,
      action: "CREATE_DESIGN",
      entityType: "DESIGN",
      entityId: item.id,
      details: `Katalog desain baru: ${item.name}`,
    });

    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Gagal membuat katalog desain." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) return NextResponse.json({ error: "ID desain diperlukan." }, { status: 400 });

    const updated = await prisma.designCatalog.update({
      where: { id },
      data: {
        name: data.name,
        categoryId: data.categoryId ? data.categoryId : undefined,
        description: data.description,
        priceStarting: data.priceStarting ? parseInt(data.priceStarting, 10) : undefined,
        priceFinal: data.priceFinal ? parseInt(data.priceFinal, 10) : null,
        deliveryDays: data.deliveryDays ? parseInt(data.deliveryDays, 10) : undefined,
        revisions: data.revisions ? parseInt(data.revisions, 10) : undefined,
        fileFormats: data.fileFormats,
        isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : undefined,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
      },
    });

    await logActivity({
      userId: session.userId,
      action: "UPDATE_DESIGN",
      entityType: "DESIGN",
      entityId: id,
      details: `Update katalog desain: ${updated.name}`,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memperbarui katalog desain." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });

    await prisma.designCatalog.delete({ where: { id } });

    await logActivity({
      userId: session.userId,
      action: "DELETE_DESIGN",
      entityType: "DESIGN",
      entityId: id,
      details: `Hapus desain id: ${id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menghapus katalog desain." }, { status: 500 });
  }
}
