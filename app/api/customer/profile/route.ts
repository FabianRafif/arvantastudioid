import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { fullName, phone, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });

    let updatedHash = user.passwordHash;
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Kata sandi saat ini diperlukan untuk mengubah kata sandi." }, { status: 400 });
      }
      const valid = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Kata sandi saat ini salah." }, { status: 400 });
      }
      updatedHash = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(fullName && { fullName }),
        ...(phone && { phone }),
        ...(newPassword && { passwordHash: updatedHash }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil akun berhasil diperbarui.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
