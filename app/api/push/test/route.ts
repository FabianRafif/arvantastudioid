import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { sendPushNotificationToAdmins } from "@/lib/push";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Hanya admin yang dapat menguji notifikasi push." }, { status: 403 });
    }

    const result = await sendPushNotificationToAdmins({
      title: "Uji Notifikasi Arvanta Studio",
      message: "Tes koneksi Web Push API berhasil! Notifikasi HP & Browser aktif.",
      url: "/admin",
    });

    return NextResponse.json({
      success: true,
      result,
      message: `Notifikasi push dikirim: ${result.totalSent} berhasil, ${result.totalFailed} gagal.`,
    });
  } catch (error: any) {
    console.error("Test push error:", error);
    return NextResponse.json({ error: "Gagal mengirim tes push notification." }, { status: 500 });
  }
}
