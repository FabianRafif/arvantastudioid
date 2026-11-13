import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, amount } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, error: "Kode voucher wajib diisi." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const subtotal = Number(amount) || 0;

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({
        valid: false,
        error: "Kode voucher tidak ditemukan atau sudah tidak aktif.",
      });
    }

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return NextResponse.json({
        valid: false,
        error: "Voucher ini belum memasuki periode aktif.",
      });
    }

    if (coupon.endDate && now > coupon.endDate) {
      return NextResponse.json({
        valid: false,
        error: "Masa berlaku voucher ini telah berakhir.",
      });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({
        valid: false,
        error: "Kuota penggunaan voucher ini telah habis.",
      });
    }

    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return NextResponse.json({
        valid: false,
        error: `Minimal transaksi untuk voucher ini adalah Rp${coupon.minSpend.toLocaleString("id-ID")}.`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount: Math.max(0, subtotal - discountAmount),
      message: `Voucher ${coupon.code} berhasil digunakan! Potongan Rp${discountAmount.toLocaleString("id-ID")}.`,
    });
  } catch (error: any) {
    console.error("Voucher validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Gagal memvalidasi kupon voucher." },
      { status: 500 }
    );
  }
}
