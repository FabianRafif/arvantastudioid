import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/security";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const packages = await prisma.servicePackage.findMany({
      include: {
        service: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { price: "asc" },
    });

    const recentLogs = await prisma.activityLog.findMany({
      where: {
        action: "PRICE_UPDATE",
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: { select: { fullName: true, username: true } },
      },
    });

    return NextResponse.json({ packages, logs: recentLogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { packageId, newPrice, newDeliveryDays, newRevisions, isPopular, isActive } = body;

    if (!packageId || newPrice === undefined) {
      return NextResponse.json(
        { error: "ID paket dan harga baru wajib disertakan." },
        { status: 400 }
      );
    }

    const currentPackage = await prisma.servicePackage.findUnique({
      where: { id: packageId },
      include: { service: true },
    });

    if (!currentPackage) {
      return NextResponse.json({ error: "Paket tidak ditemukan." }, { status: 404 });
    }

    const oldPrice = currentPackage.price;
    const priceChanged = oldPrice !== Number(newPrice);

    // Update package price in database
    const updated = await prisma.servicePackage.update({
      where: { id: packageId },
      data: {
        price: Number(newPrice),
        ...(newDeliveryDays !== undefined && { deliveryDays: Number(newDeliveryDays) }),
        ...(newRevisions !== undefined && { revisions: Number(newRevisions) }),
        ...(isPopular !== undefined && { isPopular: Boolean(isPopular) }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    // Also update parent service priceFrom / priceTo accordingly
    const allSiblings = await prisma.servicePackage.findMany({
      where: { serviceId: currentPackage.serviceId, isActive: true },
    });
    if (allSiblings.length > 0) {
      const minPrice = Math.min(...allSiblings.map((p) => p.price));
      const maxPrice = Math.max(...allSiblings.map((p) => p.price));
      await prisma.service.update({
        where: { id: currentPackage.serviceId },
        data: {
          priceFrom: minPrice,
          priceTo: maxPrice,
        },
      });
    }

    // Log the change for Audit & Price History
    if (priceChanged) {
      await logActivity({
        userId: session.userId,
        action: "PRICE_UPDATE",
        entityType: "SERVICE_PACKAGE",
        entityId: packageId,
        details: `Harga ${currentPackage.service.name} (${currentPackage.name}) diubah dari Rp${oldPrice.toLocaleString(
          "id-ID"
        )} menjadi Rp${Number(newPrice).toLocaleString("id-ID")}.`,
        ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        userAgent: req.headers.get("user-agent"),
      });
    }

    // Touch data version for live instant client sync
    await prisma.siteSetting.upsert({
      where: { key: "last_data_version" },
      update: { value: String(Date.now()) },
      create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp data version" },
    });

    return NextResponse.json({
      success: true,
      package: updated,
      oldPrice,
      newPrice: Number(newPrice),
      message: `Harga ${currentPackage.name} berhasil diperbarui ke Rp${Number(newPrice).toLocaleString("id-ID")}. Seluruh halaman frontend otomatis tersinkronisasi.`,
    });
  } catch (error: any) {
    console.error("Gagal mengupdate harga:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
