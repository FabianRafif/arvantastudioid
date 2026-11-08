import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { sendPushNotificationToAdmins } from "@/lib/push";

export async function POST(
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
      where: { OR: [{ id }, { orderNumber: id }] },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    const isAdmin = session.role === "SUPER_ADMIN" || session.role === "ADMIN";
    if (!isAdmin && order.userId !== session.userId) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await req.json();
    const { message } = body;

    if (!message || String(message).trim() === "") {
      return NextResponse.json({ error: "Pesan tidak boleh kosong." }, { status: 400 });
    }

    const newMessage = await prisma.orderMessage.create({
      data: {
        orderId: order.id,
        senderId: session.userId,
        senderRole: isAdmin ? "ADMIN" : "CUSTOMER",
        message: String(message).trim(),
      },
      include: {
        sender: {
          select: { id: true, fullName: true, username: true, role: true },
        },
      },
    });

    // Send push notification if customer sent message
    if (!isAdmin) {
      await sendPushNotificationToAdmins({
        title: `Pesan Klien: ${order.orderNumber}`,
        message: `${order.customerName}: ${message.slice(0, 100)}`,
        url: `/admin/orders/${order.id}`,
      });
    } else {
      // Notify customer
      await prisma.notification.create({
        data: {
          userId: order.userId,
          type: "NEW_MESSAGE",
          title: `Pesan Baru dari Admin Arvanta: ${order.orderNumber}`,
          message: `${message.slice(0, 100)}`,
          link: `/dashboard/orders/${order.orderNumber}`,
        },
      });
    }

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    console.error("Order message error:", error);
    return NextResponse.json({ error: "Gagal mengirim pesan." }, { status: 500 });
  }
}
