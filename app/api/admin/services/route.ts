import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/security";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: {
        category: true,
        packages: {
          orderBy: { price: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ services });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat layanan." }, { status: 500 });
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
      priceFrom,
      priceTo,
      domainHostingNote,
      domainHostingMin,
      domainHostingMax,
      features,
      deliveryDays,
      revisionCount,
    } = body;

    if (!name || !slug || !categoryId) {
      return NextResponse.json({ error: "Nama, slug, dan kategori layanan wajib diisi." }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        slug: slug.toLowerCase().trim(),
        categoryId,
        description: description || "",
        priceFrom: parseInt(priceFrom || "500000", 10),
        priceTo: parseInt(priceTo || "3000000", 10),
        domainHostingNote: domainHostingNote || "Estimasi domain & hosting Rp 500.000 – Rp 700.000 / tahun (terpisah).",
        domainHostingMin: parseInt(domainHostingMin || "500000", 10),
        domainHostingMax: parseInt(domainHostingMax || "700000", 10),
        features: features || "",
        deliveryDays: parseInt(deliveryDays || "7", 10),
        revisionCount: parseInt(revisionCount || "3", 10),
      },
    });

    await logActivity({
      userId: session.userId,
      action: "CREATE_SERVICE",
      entityType: "SERVICE",
      entityId: service.id,
      details: `Layanan website baru: ${service.name}`,
    });

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    console.error("Create service error:", error);
    return NextResponse.json({ error: error?.message || "Gagal membuat layanan." }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ error: "ID layanan diperlukan." }, { status: 400 });
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        priceFrom: data.priceFrom ? parseInt(data.priceFrom, 10) : undefined,
        priceTo: data.priceTo ? parseInt(data.priceTo, 10) : undefined,
        description: data.description,
        domainHostingNote: data.domainHostingNote,
        domainHostingMin: data.domainHostingMin ? parseInt(data.domainHostingMin, 10) : undefined,
        domainHostingMax: data.domainHostingMax ? parseInt(data.domainHostingMax, 10) : undefined,
        features: data.features,
        deliveryDays: data.deliveryDays ? parseInt(data.deliveryDays, 10) : undefined,
        revisionCount: data.revisionCount ? parseInt(data.revisionCount, 10) : undefined,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
      },
    });

    await logActivity({
      userId: session.userId,
      action: "UPDATE_SERVICE",
      entityType: "SERVICE",
      entityId: id,
      details: `Update layanan website: ${updated.name}`,
    });

    return NextResponse.json({ success: true, service: updated });
  } catch (error: any) {
    console.error("Update service error:", error);
    return NextResponse.json({ error: "Gagal memperbarui layanan." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Hanya Super Admin yang dapat menghapus layanan." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID tidak valid." }, { status: 400 });

    await prisma.service.delete({ where: { id } });

    await logActivity({
      userId: session.userId,
      action: "DELETE_SERVICE",
      entityType: "SERVICE",
      entityId: id,
      details: `Hapus layanan website id: ${id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menghapus layanan." }, { status: 500 });
  }
}
