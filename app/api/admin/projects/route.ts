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

    const projects = await prisma.order.findMany({
      include: {
        items: true,
        user: { select: { fullName: true, phone: true, email: true } },
        files: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ projects });
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
    const { orderId, status, internalNotes, clientNotes, deadline } = body;

    if (!orderId) {
      return NextResponse.json({ error: "ID pesanan / proyek diperlukan." }, { status: 400 });
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!currentOrder) {
      return NextResponse.json({ error: "Proyek tidak ditemukan." }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id: orderId },
        data: {
          ...(status && { status }),
          ...(internalNotes !== undefined && { internalNotes }),
          ...(clientNotes !== undefined && { notes: clientNotes }),
          ...(deadline && { deadline: new Date(deadline) }),
        },
      });

      if (status && status !== currentOrder.status) {
        await tx.orderStatusHistory.create({
          data: {
            orderId,
            previousStatus: currentOrder.status,
            newStatus: status,
            adminUserId: session.userId,
            notes: `Status pengerjaan diperbarui oleh ${session.fullName}`,
          },
        });

        // Notify client in dashboard
        await tx.notification.create({
          data: {
            userId: currentOrder.userId,
            type: "ORDER_STATUS_CHANGED",
            title: `Update Proyek: ${currentOrder.orderNumber}`,
            message: `Status pesanan Anda kini berada pada tahap: ${status}.`,
            link: `/dashboard/orders/${currentOrder.orderNumber}`,
          },
        });
      }

      return ord;
    });

    await logActivity({
      userId: session.userId,
      action: "PROJECT_UPDATE",
      entityType: "ORDER",
      entityId: orderId,
      details: `Proyek ${currentOrder.orderNumber} status diperbarui ke ${status || currentOrder.status}.`,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({
      success: true,
      project: updated,
      message: "Progres proyek berhasil diperbarui.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
