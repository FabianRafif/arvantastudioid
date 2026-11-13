import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [banners, settingsList] = await Promise.all([
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.siteSetting.findMany({
        where: {
          key: {
            in: [
              "flash_sale_active",
              "flash_sale_title",
              "flash_sale_subtitle",
              "flash_sale_discount_percent",
              "flash_sale_voucher_code",
              "flash_sale_end_time",
            ],
          },
        },
      }),
    ]);

    const flashSale: Record<string, string> = {};
    for (const s of settingsList) {
      flashSale[s.key] = s.value;
    }

    // Compute a hash / latest updated timestamp for real-time polling
    const latestBannerDate = banners.reduce((max, b) => {
      const d = new Date(b.updatedAt).getTime();
      return d > max ? d : max;
    }, 0);

    return NextResponse.json({
      success: true,
      banners,
      flashSale: {
        isActive: flashSale["flash_sale_active"] === "true",
        title: (flashSale["flash_sale_title"] || "PROMO SPESIAL ARVANTA STUDIO").replace(/[⚡✨★⭐🔥]/g, "").trim(),
        subtitle: flashSale["flash_sale_subtitle"] || "Diskon Spesial Pembuatan Website & Desain Grafis Khusus Hari Ini!",
        discountPercent: flashSale["flash_sale_discount_percent"] || "20",
        voucherCode: flashSale["flash_sale_voucher_code"] || "PROMO20",
        endTime: flashSale["flash_sale_end_time"] || new Date(Date.now() + 86400000).toISOString(),
      },
      lastUpdated: latestBannerDate,
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    // Graceful fallback if database has temporary latency
    return NextResponse.json({
      success: true,
      banners: [
        {
          id: "fallback-1",
          title: "SOLUSI DIGITAL BISNIS & SISTEM MODERN",
          subtitle: "Layanan pembuatan website profesional dan sistem digital berkelas",
          badge: "PENAWARAN RESMI",
          imageUrl: "/uploads/banners/banner-web-development.svg",
          targetUrl: "/services",
          isActive: true,
          sortOrder: 1,
        },
      ],
      flashSale: {
        isActive: false,
        title: "PROMO SPESIAL ARVANTA STUDIO",
        subtitle: "Diskon Spesial Pembuatan Website & Desain Grafis",
        discountPercent: "20",
        voucherCode: "PROMO20",
        endTime: new Date(Date.now() + 86400000).toISOString(),
      },
      lastUpdated: Date.now(),
    });
  }
}
