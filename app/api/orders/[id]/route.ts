import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/security";
import { sendPushNotificationToAdmins } from "@/lib/push";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Akses tidak diizinkan." }, { status: 401 });
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            servicePackage: true,
            designCatalog: true,
          },
        },
        files: {
          orderBy: { createdAt: "desc" },
        },
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
        messages: {
          include: {
            sender: {
              select: { id: true, fullName: true, username: true, role: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        payments: {
          include: {
            proofs: true,
          },
        },
        invoices: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    // IDOR Protection: only admin or the order owner can view
    const isAdmin = session.role === "SUPER_ADMIN" || session.role === "ADMIN";
    if (!isAdmin && order.userId !== session.userId) {
      return NextResponse.json({ error: "Anda tidak memiliki akses ke pesanan ini." }, { status: 403 });
    }

    // Sanitize client notes: strip any legacy snapshot text, ensure "-" if empty
    if (order.notes) {
      if (order.notes.includes("--- SNAPSHOT HARGA TERKUNCI ---")) {
        const parts = order.notes.split("--- SNAPSHOT HARGA TERKUNCI ---");
        const clientPart = parts[0].trim();
        order.notes = clientPart && clientPart !== "-" ? clientPart : "-";
      } else if (!order.notes.trim() || order.notes.trim() === "-") {
        order.notes = "-";
      }
    } else {
      order.notes = "-";
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Get order detail error:", error);
    return NextResponse.json({ error: "Gagal memuat detail pesanan." }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Akses tidak diizinkan." }, { status: 401 });
    }

    const isAdmin = session.role === "SUPER_ADMIN" || session.role === "ADMIN";
    const body = await req.json();

    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    if (!isAdmin && order.userId !== session.userId) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const updateData: any = {};

    // Admin can update status
    if (body.status && isAdmin) {
      const prevStatus = order.status;
      updateData.status = body.status;

      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: prevStatus,
          newStatus: body.status,
          adminUserId: session.userId,
          notes: body.statusNotes || `Status diperbarui menjadi ${body.status}`,
        },
      });

      // Notification for customer
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: "ORDER_STATUS_CHANGED",
          title: `Pembaruan Status: ${order.orderNumber}`,
          message: `Status pesanan Anda telah diperbarui menjadi ${body.status}.`,
          link: `/dashboard/orders/${order.orderNumber}`,
        },
      });
    }

    // Admin can adjust price
    if (body.totalAmount !== undefined && isAdmin) {
      updateData.totalAmount = parseInt(body.totalAmount, 10);
      if (body.dpAmount !== undefined) {
        updateData.dpAmount = parseInt(body.dpAmount, 10);
      }
      updateData.remainingAmount = updateData.totalAmount - (updateData.dpAmount || order.dpAmount);
    }

    if (body.internalNotes !== undefined && isAdmin) {
      updateData.internalNotes = body.internalNotes;
    }

    // Customer or Admin can claim promo coupon during payment
    if (body.action === "CLAIM_PROMO" || body.action === "CLAIM_COUPON") {
      const code = (body.promoCode || body.couponCode || "").trim().toUpperCase();
      // Look up coupon from database or flash sale dynamically
      let validCoupon: { code: string; discountPercent: number; discountAmount: number } | null = null;

      const flashSaleActive = await prisma.siteSetting.findUnique({ where: { key: "flash_sale_active" } });
      const flashSaleVoucher = await prisma.siteSetting.findUnique({ where: { key: "flash_sale_voucher_code" } });
      const flashSaleDiscount = await prisma.siteSetting.findUnique({ where: { key: "flash_sale_discount_percent" } });

      if (
        flashSaleActive?.value === "true" &&
        code.toUpperCase() === (flashSaleVoucher?.value || "PROMO20").toUpperCase()
      ) {
        const pct = Number(flashSaleDiscount?.value) || 20;
        const disc = Math.round(order.totalAmount * (pct / 100));
        validCoupon = { code: code.toUpperCase(), discountPercent: pct, discountAmount: disc };
      } else {
        const dbCoupon = await prisma.coupon.findUnique({
          where: { code: code.toUpperCase() },
        });
        if (dbCoupon && dbCoupon.isActive) {
          let disc = 0;
          if (dbCoupon.discountType === "PERCENTAGE") {
            disc = Math.round(order.totalAmount * (dbCoupon.discountValue / 100));
          } else {
            disc = Math.min(order.totalAmount, dbCoupon.discountValue);
          }
          validCoupon = {
            code: dbCoupon.code,
            discountPercent: dbCoupon.discountType === "PERCENTAGE" ? dbCoupon.discountValue : 0,
            discountAmount: disc,
          };
        }
      }

      if (!validCoupon) {
        return NextResponse.json(
          { error: "Kode kupon tidak valid atau sudah kadaluarsa." },
          { status: 400 }
        );
      }

      if (order.notes?.includes(`[KUPON: ${validCoupon.code}`) || order.notes?.includes("Klaim Kupon")) {
        return NextResponse.json(
          { error: "Kupon diskon sudah diterapkan pada pesanan ini." },
          { status: 400 }
        );
      }

      if (order.status === "COMPLETED" || order.status === "DELIVERED") {
        return NextResponse.json(
          { error: "Pesanan sudah berstatus selesai. Kupon diskon tidak dapat diterapkan." },
          { status: 400 }
        );
      }

      const discount = validCoupon.discountAmount;
      const newTotal = Math.max(0, order.totalAmount - discount);
      const newDp = Math.round(newTotal * 0.5);
      const newRemaining = newTotal - newDp;

      updateData.totalAmount = newTotal;
      updateData.dpAmount = newDp;
      updateData.remainingAmount = newRemaining;
      updateData.notes = (order.notes ? order.notes + "\n" : "") +
        `[KUPON: ${validCoupon.code} - Hemat Rp${discount.toLocaleString("id-ID")}]`;

      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          newStatus: order.status,
          notes: `Klaim Kupon ${validCoupon.code} saat pembayaran: Hemat Rp${discount.toLocaleString("id-ID")}`,
        },
      });
    }

    // Customer can request revision
    if (body.action === "REQUEST_REVISION" && !isAdmin) {
      updateData.status = "REVISION";
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          newStatus: "REVISION",
          notes: `Permintaan revisi oleh pelanggan: ${body.revisionNotes || "Revisi diajukan"}`,
        },
      });

      await sendPushNotificationToAdmins({
        title: `Permintaan Revisi: ${order.orderNumber}`,
        message: `${order.customerName} mengajukan revisi untuk order ${order.orderNumber}.`,
        url: `/admin/orders/${order.id}`,
      });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: updateData,
    });

    await logActivity({
      userId: session.userId,
      action: "UPDATE_ORDER",
      entityType: "ORDER",
      entityId: order.id,
      details: `Pembaruan order ${order.orderNumber}`,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error("Order update error:", error);
    return NextResponse.json({ error: "Gagal memperbarui pesanan." }, { status: 500 });
  }
}
