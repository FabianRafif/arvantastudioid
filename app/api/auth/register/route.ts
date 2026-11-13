import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";
import { checkRateLimit, logActivity } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown Browser";

    const rateCheck = checkRateLimit(`register-${ip}`, 5, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Terlalu banyak pendaftaran dari IP ini. Silakan coba lagi beberapa saat." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, fullName, email, phone, password } = body;

    if (!username || !fullName || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Semua data formulir pendaftaran wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).toLowerCase().trim().replace(/[^a-z0-9_]/g, "");
    const cleanEmail = String(email).toLowerCase().trim();

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: "Username minimal 3 karakter (hanya huruf, angka, underscore)." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter demi keamanan akun Anda." },
        { status: 400 }
      );
    }

    // Check unique username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanEmail }],
      },
    });

    if (existingUser) {
      if (existingUser.username === cleanUsername) {
        return NextResponse.json(
          { error: "Username ini sudah digunakan. Silakan pilih username lain." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Alamat email ini sudah terdaftar. Silakan gunakan menu Masuk." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        fullName: String(fullName).trim(),
        email: cleanEmail,
        phone: String(phone).trim(),
        passwordHash,
        role: "CUSTOMER",
        isActive: true,
      },
    });

    // Create session
    const token = await createSession(
      newUser.id,
      {
        userId: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        fullName: newUser.fullName,
      },
      ip,
      userAgent
    );

    await logActivity({
      userId: newUser.id,
      action: "REGISTER_SUCCESS",
      details: `Pendaftaran akun pelanggan baru: ${newUser.username}`,
      ipAddress: ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
      redirectUrl: "/dashboard",
    });

    response.cookies.set("arvanta_session", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Register route error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pendaftaran. Silakan coba kembali." },
      { status: 500 }
    );
  }
}
