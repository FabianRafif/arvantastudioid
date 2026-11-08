import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/file-storage";
import { sendPushNotificationToAdmins } from "@/lib/push";
import { logActivity } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Silakan masuk terlebih dahulu." }, { status: 401 });
    }

    const formData = await req.formData();
    const orderId = formData.get("orderId") as string;
    const paymentType = (formData.get("paymentType") as string) || "DP"; // "DP" | "PELUNASAN" | "FULL"
    const method = (formData.get("method") as string) || "BANK_TRANSFER"; // "BANK_TRANSFER" | "QRIS"
    const amount = parseInt((formData.get("amount") as string) || "0", 10);
    const notes = (formData.get("notes") as string) || "";
    const proofFile = formData.get("proof") as File | null;

    if (!orderId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Order ID dan nominal pembayaran wajib diisi." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    const isAdmin = session.role === "SUPER_ADMIN" || session.role === "ADMIN";
    if (!isAdmin && order.userId !== session.userId) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    // Save proof file if provided
    let savedProof: any = null;
    if (proofFile && proofFile.size > 0) {
      savedProof = await saveUploadedFile(proofFile);
    }

    const currentYear = new Date().getFullYear();
    const payCount = await prisma.payment.count();
    const paymentNumber = `PAY-${currentYear}-${String(payCount + 1).padStart(4, "0")}`;

    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          paymentNumber,
          orderId: order.id,
          paymentType,
          method,
          amount,
          status: "PENDING",
          notes,
        },
      });

      if (savedProof) {
        await tx.paymentProof.create({
          data: {
            paymentId: createdPayment.id,
            filePath: savedProof.filePath,
            fileName: savedProof.fileName,
            fileSize: savedProof.fileSize,
          },
        });
      }

      // Update order status to MENUNGGU_KONFIRMASI or PEMBAYARAN_DIVERIFIKASI
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "MENUNGGU_KONFIRMASI",
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          newStatus: "MENUNGGU_KONFIRMASI",
          notes: `Bukti transfer ${paymentType} (${paymentNumber}) senilai Rp ${amount.toLocaleString("id-ID")} berhasil diunggah.`,
        },
      });

      // Notification
      await tx.notification.create({
        data: {
          type: "PAYMENT_SUBMITTED",
          title: `Bukti Pembayaran Masuk: ${paymentNumber}`,
          message: `${order.customerName} mengunggah bukti pembayaran ${paymentType} sebesar Rp ${amount.toLocaleString("id-ID")} untuk order ${order.orderNumber}.`,
          link: `/admin/orders/${order.id}`,
        },
      });

      return createdPayment;
    });

    await sendPushNotificationToAdmins({
      title: `Pembayaran Masuk: ${order.orderNumber}`,
      message: `${order.customerName} mengunggah bukti ${paymentType} Rp ${amount.toLocaleString("id-ID")}`,
      url: `/admin/orders/${order.id}`,
    });

    return NextResponse.json({
      success: true,
      payment,
      message: "Bukti pembayaran berhasil diunggah dan sedang dalam proses verifikasi tim admin.",
    });
  } catch (error: any) {
    console.error("Payment upload error:", error);
    return NextResponse.json({ error: "Gagal memproses unggah bukti pembayaran." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Hanya admin yang dapat memverifikasi pembayaran." }, { status: 403 });
    }

    const body = await req.json();
    const { paymentId, status, notes } = body; // status: "VERIFIED" | "REJECTED"

    if (!paymentId || !status) {
      return NextResponse.json({ error: "Payment ID dan status verifikasi wajib disertakan." }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Data pembayaran tidak ditemukan." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status,
          verifiedBy: session.username,
          verifiedAt: new Date(),
          notes: notes || null,
        },
      });

      if (status === "VERIFIED") {
        // Transition order status
        const nextStatus = payment.paymentType === "DP" ? "IN_PROGRESS" : "COMPLETED";
        await tx.order.update({
          where: { id: payment.orderId },
          data: {
            status: nextStatus,
            dpAmount: payment.paymentType === "DP" ? payment.amount : payment.order.dpAmount,
            remainingAmount: payment.order.totalAmount - payment.amount,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            previousStatus: payment.order.status,
            newStatus: nextStatus,
            adminUserId: session.userId,
            notes: `Pembayaran ${payment.paymentType} (${payment.paymentNumber}) senilai Rp ${payment.amount.toLocaleString("id-ID")} diverifikasi sah oleh admin.`,
          },
        });

        // Notify customer
        await tx.notification.create({
          data: {
            userId: payment.order.userId,
            type: "PAYMENT_VERIFIED",
            title: `Pembayaran Terverifikasi: ${payment.order.orderNumber}`,
            message: `Pembayaran ${payment.paymentType} Anda telah diverifikasi oleh admin. Proyek berlanjut ke tahap pengerjaan.`,
            link: `/dashboard/orders/${payment.order.orderNumber}`,
          },
        });
      }
    });

    await logActivity({
      userId: session.userId,
      action: `PAYMENT_${status}`,
      entityType: "PAYMENT",
      entityId: paymentId,
      details: `Verifikasi status pembayaran ${status} untuk order ${payment.order.orderNumber}`,
    });

    return NextResponse.json({ success: true, message: `Status pembayaran diperbarui menjadi ${status}` });
  } catch (error: any) {
    console.error("Payment verify error:", error);
    return NextResponse.json({ error: "Gagal memverifikasi pembayaran." }, { status: 500 });
  }
}
