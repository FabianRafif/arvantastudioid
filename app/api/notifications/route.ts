import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Akses tidak diizinkan." }, { status: 401 });
    }

    const isAdmin = session.role === "SUPER_ADMIN" || session.role === "ADMIN";

    // Admins see broadcast (userId: null) or their own; customers see only their own
    const where = isAdmin
      ? { OR: [{ userId: null }, { userId: session.userId }] }
      : { userId: session.userId };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        ...where,
        isRead: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Notifications error:", error);
    return NextResponse.json({ error: "Gagal memuat notifikasi." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Akses tidak diizinkan." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, markAll } = body;

    const isAdmin = session.role === "SUPER_ADMIN" || session.role === "ADMIN";
    const where = isAdmin
      ? { OR: [{ userId: null }, { userId: session.userId }] }
      : { userId: session.userId };

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          ...where,
          isRead: false,
        },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true, message: "Semua notifikasi ditandai dibaca." });
    }

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  } catch (error) {
    console.error("Mark notification error:", error);
    return NextResponse.json({ error: "Gagal memperbarui notifikasi." }, { status: 500 });
  }
}
