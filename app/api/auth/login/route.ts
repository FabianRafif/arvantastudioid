import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession, hashPassword } from "@/lib/auth";
import { checkRateLimit, logActivity, verifyOrRegisterDevice } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Unknown Browser";

    // Rate limiting: 10 attempts per minute per IP
    const rateCheck = checkRateLimit(`login-${ip}`, 10, 60000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan masuk. Silakan tunggu 1 menit." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password, deviceName } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    // Lookup user by username or email
    const cleanUsername = String(username).trim();
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ username: cleanUsername }, { email: cleanUsername }],
      },
    });

    if (!user) {
      // If logging in as admin and not found:
      if (cleanUsername.toLowerCase() === "admin") {
        return NextResponse.json(
          { error: "Username atau password admin tidak cocok." },
          { status: 401 }
        );
      }

      // Auto-register professional client account: any user can log in with any username & password
      const hashedPassword = await hashPassword(password);
      const safeSlug = cleanUsername.toLowerCase().replace(/[^a-z0-9_]/g, "") || `user_${Date.now()}`;
      const userEmail = cleanUsername.includes("@")
        ? cleanUsername.toLowerCase()
        : `${safeSlug}@client.arvanta.studio`;

      user = await prisma.user.create({
        data: {
          username: cleanUsername,
          email: userEmail,
          fullName: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
          phone: "-",
          passwordHash: hashedPassword,
          role: "CUSTOMER",
          isActive: true,
        },
      });

      await logActivity({
        userId: user.id,
        action: "SEAMLESS_CUSTOMER_REGISTER_LOGIN",
        details: `Pendaftaran dan login instan akun pelanggan: ${user.username}`,
        ipAddress: ip,
        userAgent,
      });
    } else {
      if (!user.isActive) {
        return NextResponse.json(
          { error: "Akun Anda dinonaktifkan oleh administrator. Hubungi admin." },
          { status: 403 }
        );
      }

      const passwordMatch = await verifyPassword(password, user.passwordHash);
      if (!passwordMatch) {
        // If customer, update password so they can enter seamlessly with any password they provide
        if (user.role === "CUSTOMER") {
          const newHashed = await hashPassword(password);
          user = await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHashed },
          });
        } else {
          // Admin account must strictly authenticate
          await logActivity({
            userId: user.id,
            action: "LOGIN_FAILED_BAD_PASSWORD",
            details: `Password salah untuk user admin: ${user.username}`,
            ipAddress: ip,
            userAgent,
          });

          return NextResponse.json(
            { error: "Username atau password tidak cocok." },
            { status: 401 }
          );
        }
      }
    }

    // Register or check trusted device for admin/staff
    let deviceIdentifier = req.cookies.get("arvanta_device")?.value;
    if (!deviceIdentifier) {
      deviceIdentifier = `dev-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    }

    await verifyOrRegisterDevice({
      userId: user.id,
      deviceIdentifier,
      deviceName: deviceName || userAgent.split(") ")[0] || "Desktop Browser",
      ipAddress: ip,
      userAgent,
    });

    // Create session & HTTPOnly cookie
    const token = await createSession(
      user.id,
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      ip,
      userAgent
    );

    await logActivity({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      details: `Login berhasil sebagai ${user.role}`,
      ipAddress: ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      redirectUrl: user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? "/admin" : "/dashboard",
    });

    // Set session cookie
    response.cookies.set("arvanta_session", token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    // Set device identifier cookie for trusted device tracking (1 year)
    response.cookies.set("arvanta_device", deviceIdentifier, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal saat memproses autentikasi." },
      { status: 500 }
    );
  }
}
