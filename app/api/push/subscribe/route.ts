import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Akses tidak diizinkan." }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint, keys, userAgent } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Payload push subscription tidak lengkap." }, { status: 400 });
    }

    // Upsert push subscription
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId: session.userId,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || null,
      },
      create: {
        userId: session.userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: userAgent || null,
      },
    });

    return NextResponse.json({ success: true, message: "Perangkat berhasil didaftarkan untuk Web Push Notification." });
  } catch (error: any) {
    console.error("Push subscribe error:", error);
    return NextResponse.json({ error: "Gagal menyimpan subscription push notification." }, { status: 500 });
  }
}
