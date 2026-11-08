import { prisma } from "./prisma";

export interface WhatsAppNotificationPayload {
  orderId?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  serviceType: string;
  packageNameOrProduct: string;
  priceFormatted: string;
  notes?: string;
  details?: string;
  mediaUrls?: string[];
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

export function buildOrderMessageText(data: WhatsAppNotificationPayload): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const dashboardLink = `${appUrl}/admin/orders/${data.orderId || data.orderNumber}`;

  return `[ORDER BARU — ARVANTA STUDIO]

Nomor Order: ${data.orderNumber}

Nama: ${data.customerName}
WhatsApp: ${data.customerPhone}

Layanan: ${data.serviceType}
Produk/Paket: ${data.packageNameOrProduct}
Harga: ${data.priceFormatted}

Catatan & Kebutuhan:
${data.notes || data.details || "Tidak ada catatan khusus."}

Silakan periksa dashboard admin untuk melihat detail pesanan:
${dashboardLink}`;
}

export function generateManualWhatsAppLink(
  recipientPhone: string,
  message: string
): string {
  const formattedPhone = formatWhatsAppNumber(recipientPhone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

export async function sendWhatsAppNotification(
  data: WhatsAppNotificationPayload
): Promise<{ success: boolean; status: string; message: string; waLink?: string }> {
  const adminPhone =
    process.env.ADMIN_WHATSAPP_NUMBER || "62895322465836";
  const formattedAdminPhone = formatWhatsAppNumber(adminPhone);
  const messageText = buildOrderMessageText(data);
  const manualLink = generateManualWhatsAppLink(formattedAdminPhone, messageText);

  const provider = (process.env.WHATSAPP_PROVIDER || "FONNTE").toUpperCase();
  const token =
    process.env.WHATSAPP_API_TOKEN || process.env.WHATSAPP_GATEWAY_TOKEN;
  const apiUrl =
    process.env.WHATSAPP_API_URL || "https://api.fonnte.com/send";

  // If no token is provided in environment variables, log as PENDING_CONFIG with fallback link
  if (!token) {
    await prisma.whatsappMessageLog.create({
      data: {
        orderId: data.orderId || null,
        recipient: formattedAdminPhone,
        messageType: "TEXT",
        content: messageText,
        status: "PENDING_CONFIG",
        errorMessage:
          "WhatsApp API Token belum dikonfigurasi pada environment variables (.env). Link WhatsApp manual telah disediakan.",
      },
    });

    return {
      success: false,
      status: "PENDING_CONFIG",
      message:
        "WhatsApp API belum dikonfigurasi. Notifikasi order tetap tercatat di sistem dan admin dapat membuka WhatsApp manual.",
      waLink: manualLink,
    };
  }

  try {
    let apiSuccess = false;
    let responseData: any = null;

    if (provider === "FONNTE") {
      // Fonnte API
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target: formattedAdminPhone,
          message: messageText,
        }),
      });

      responseData = await res.json().catch(() => null);
      apiSuccess = res.ok && (responseData?.status === true || responseData?.status === "success");

      // Send media files if present
      if (data.mediaUrls && data.mediaUrls.length > 0) {
        for (const mediaUrl of data.mediaUrls) {
          await fetch(apiUrl, {
            method: "POST",
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              target: formattedAdminPhone,
              url: mediaUrl,
              caption: `[Ref Media — ${data.orderNumber}] ${data.customerName}`,
            }),
          }).catch((err) => console.error("Error sending media WA:", err));
        }
      }
    } else if (provider === "WHATSAPP_CLOUD_API") {
      // Meta WhatsApp Business Cloud API
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      const cloudUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

      const res = await fetch(cloudUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedAdminPhone,
          type: "text",
          text: { body: messageText },
        }),
      });

      responseData = await res.json().catch(() => null);
      apiSuccess = res.ok && Boolean(responseData?.messages?.[0]?.id);

      // Cloud API media support
      if (data.mediaUrls && data.mediaUrls.length > 0) {
        for (const mediaUrl of data.mediaUrls) {
          await fetch(cloudUrl, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: formattedAdminPhone,
              type: "image",
              image: {
                link: mediaUrl,
                caption: `[Ref Media — ${data.orderNumber}] ${data.customerName}`,
              },
            }),
          }).catch((err) => console.error("Error sending cloud media WA:", err));
        }
      }
    }

    await prisma.whatsappMessageLog.create({
      data: {
        orderId: data.orderId || null,
        recipient: formattedAdminPhone,
        messageType: data.mediaUrls && data.mediaUrls.length > 0 ? "MEDIA" : "TEXT",
        content: messageText,
        mediaUrl: data.mediaUrls?.[0] || null,
        status: apiSuccess ? "SENT" : "FAILED",
        responsePayload: responseData ? JSON.stringify(responseData) : null,
        errorMessage: apiSuccess ? null : "API provider responded with error or rejected message",
      },
    });

    return {
      success: apiSuccess,
      status: apiSuccess ? "SENT" : "FAILED",
      message: apiSuccess
        ? "Pesan WhatsApp berhasil dikirim ke admin."
        : "Pengiriman via WhatsApp API gagal. Sedia fallback link manual.",
      waLink: manualLink,
    };
  } catch (error: any) {
    console.error("WhatsApp delivery exception:", error);
    await prisma.whatsappMessageLog.create({
      data: {
        orderId: data.orderId || null,
        recipient: formattedAdminPhone,
        messageType: "TEXT",
        content: messageText,
        status: "FAILED",
        errorMessage: error?.message || "Unknown network error",
      },
    });

    return {
      success: false,
      status: "FAILED",
      message: "Terjadi kesalahan koneksi ke WhatsApp API. Fallback link tersedia.",
      waLink: manualLink,
    };
  }
}
