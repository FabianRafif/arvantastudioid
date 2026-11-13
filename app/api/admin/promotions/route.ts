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

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ coupons });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      code,
      discountType,
      discountValue,
      minSpend,
      maxDiscount,
      usageLimit,
      startDate,
      endDate,
    } = body;

    if (!code || !discountValue) {
      return NextResponse.json(
        { error: "Kode voucher dan nilai diskon wajib diisi." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();

    const created = await prisma.coupon.create({
      data: {
        code: cleanCode,
        discountType: discountType || "PERCENTAGE",
        discountValue: Number(discountValue),
        minSpend: Number(minSpend) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
      },
    });

    await logActivity({
      userId: session.userId,
      action: "COUPON_CREATE",
      entityType: "COUPON",
      entityId: created.id,
      details: `Voucher baru ${created.code} (${created.discountType} ${created.discountValue}) berhasil dibuat.`,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent"),
    });

    await prisma.siteSetting.upsert({
      where: { key: "last_data_version" },
      update: { value: String(Date.now()) },
      create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp data version" },
    });

    return NextResponse.json({
      success: true,
      coupon: created,
      message: `Voucher ${created.code} berhasil diterbitkan.`,
    });
  } catch (error: any) {
    console.error("Gagal membuat voucher:", error);
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
    const { id, isActive, usageLimit, minSpend } = body;

    if (!id) {
      return NextResponse.json({ error: "ID voucher diperlukan." }, { status: 400 });
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(usageLimit !== undefined && { usageLimit: Number(usageLimit) }),
        ...(minSpend !== undefined && { minSpend: Number(minSpend) }),
      },
    });

    await prisma.siteSetting.upsert({
      where: { key: "last_data_version" },
      update: { value: String(Date.now()) },
      create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp data version" },
    });

    return NextResponse.json({
      success: true,
      coupon: updated,
      message: `Status voucher ${updated.code} diperbarui.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID voucher diperlukan." }, { status: 400 });
    }

    const deleted = await prisma.coupon.delete({ where: { id } });

    await logActivity({
      userId: session.userId,
      action: "COUPON_DELETE",
      entityType: "COUPON",
      entityId: id,
      details: `Voucher ${deleted.code} dihapus oleh administrator.`,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent"),
    });

    await prisma.siteSetting.upsert({
      where: { key: "last_data_version" },
      update: { value: String(Date.now()) },
      create: { key: "last_data_version", value: String(Date.now()), description: "Timestamp data version" },
    });

    return NextResponse.json({ success: true, message: `Voucher ${deleted.code} berhasil dihapus.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
