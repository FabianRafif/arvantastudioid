import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "arvanta-studio-production-secure-key-2026-purwokerto-digital-agency";

export interface SessionPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  fullName: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  plainText: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

export function generateToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("arvanta_session")?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    // Verify session validity against database
    const session = await prisma.userSession.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            role: true,
            isActive: true,
          },
        },
      },
    });

    if (!session || !session.user || !session.user.isActive) {
      return null;
    }

    if (new Date() > session.expiresAt) {
      await prisma.userSession.delete({ where: { token } }).catch(() => {});
      return null;
    }

    return {
      userId: session.user.id,
      username: session.user.username,
      email: session.user.email,
      role: session.user.role,
      fullName: session.user.fullName,
    };
  } catch (error) {
    console.error("Error reading session user:", error);
    return null;
  }
}

export async function createSession(
  userId: string,
  payload: SessionPayload,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = generateToken(payload);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.userSession.create({
    data: {
      userId,
      token,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("arvanta_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("arvanta_session")?.value;
    if (token) {
      await prisma.userSession.delete({ where: { token } }).catch(() => {});
      cookieStore.delete("arvanta_session");
    }
  } catch (error) {
    console.error("Error destroying session:", error);
  }
}
