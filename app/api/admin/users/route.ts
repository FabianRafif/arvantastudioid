import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { logActivity } from "@/lib/security";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Hanya Super Admin yang dapat mengakses." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      where: {
        role: { in: ["SUPER_ADMIN", "ADMIN"] },
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Hanya Super Admin yang dapat membuat staf baru." }, { status: 403 });
    }

    const { username, fullName, email, phone, password, role } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, dan kata sandi wajib diisi." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        username: username.toLowerCase().trim(),
        fullName,
        email: email.toLowerCase().trim(),
        phone: phone || "",
        passwordHash,
        role: role || "ADMIN",
        isActive: true,
      },
    });

    await logActivity({
      userId: session.userId,
      action: "USER_CREATE",
      entityType: "USER",
      entityId: newUser.id,
      details: `Admin / Staf baru @${newUser.username} (${newUser.role}) berhasil ditambahkan.`,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
