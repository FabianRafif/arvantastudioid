import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/security";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const devices = await prisma.trustedDevice.findMany({
      where: { userId: session.userId },
      orderBy: { lastUsedAt: "desc" },
    });

    return NextResponse.json({ devices });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memuat perangkat terpercaya." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await req.json();
    const { deviceId, isApproved } = body;

    const updated = await prisma.trustedDevice.update({
      where: { id: deviceId },
      data: { isApproved: Boolean(isApproved) },
    });

    await logActivity({
      userId: session.userId,
      action: "TRUSTED_DEVICE_UPDATE",
      details: `Status persetujuan perangkat ${updated.deviceName} diubah menjadi ${isApproved}`,
    });

    return NextResponse.json({ success: true, device: updated });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui status perangkat." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });

    const currentToken = req.cookies.get("arvanta_session")?.value;

    // Emergency logout all other sessions except current
    await prisma.userSession.deleteMany({
      where: {
        userId: session.userId,
        token: { not: currentToken },
      },
    });

    await logActivity({
      userId: session.userId,
      action: "EMERGENCY_LOGOUT_ALL_DEVICES",
      details: "Semua sesi login di perangkat lain telah diputus darurat.",
    });

    return NextResponse.json({
      success: true,
      message: "Seluruh sesi di perangkat lain telah berhasil di-logout secara darurat.",
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal melakukan emergency logout." }, { status: 500 });
  }
}
