import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Hanya admin yang dapat menguji WhatsApp API." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const targetPhone = body.phone || process.env.ADMIN_WHATSAPP_NUMBER || "62895322465836";

    const result = await sendWhatsAppNotification({
      orderNumber: "TEST-ARV-001",
      customerName: "Tester Admin",
      customerPhone: targetPhone,
      serviceType: "Website Development",
      packageNameOrProduct: "Corporate Executive — Uji Integrasi",
      priceFormatted: "Rp 2.400.000",
      notes: "Ini adalah pesan tes integrasi WhatsApp API resmi Arvanta Studio.",
    });

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("WhatsApp test error:", error);
    return NextResponse.json({ error: "Gagal memproses tes WhatsApp." }, { status: 500 });
  }
}
