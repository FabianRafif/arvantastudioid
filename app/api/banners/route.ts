import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const now = new Date();

    const [banners, settingsList] = await Promise.all([
      prisma.banner.findMany({
        where: {
          isActive: true,
          status: { in: ["PUBLISHED", "published", ""] },
          AND: [
            {
              OR: [
                { startDate: null },
                { startDate: { lte: now } },
              ],
            },
            {
              OR: [
                { endDate: null },
                { endDate: { gte: now } },
              ],
            },
          ],
        },
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

    const effectiveBanners =
      banners.length > 0
        ? banners
        : [
            {
              id: "default-banner-web",
              title: "SOLUSI DIGITAL BISNIS & SISTEM MODERN",
              subtitle: "Layanan pembuatan website profesional dan sistem digital berkelas",
              badge: "PENAWARAN RESMI",
              imageUrl: "/uploads/banners/banner-web-development.svg",
              targetUrl: "/services",
              isActive: true,
              status: "PUBLISHED",
              sortOrder: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "default-banner-design",
              title: "VISUAL IDENTITY & GRAPHIC DESIGN STUDIO",
              subtitle: "15+ Kategori Desain: Logo, Feed Media Sosial, Kemasan, Brosur, Poster",
              badge: "✨ DESAIN GRAFIS",
              imageUrl: "/uploads/banners/banner-graphic-design.svg",
              targetUrl: "/services#design-catalog",
              isActive: true,
              status: "PUBLISHED",
              sortOrder: 2,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];

    const sanitizedEffectiveBanners = effectiveBanners.map((b: any) => ({
      ...b,
      imageUrl:
        b.imageUrl && b.imageUrl.startsWith("data:")
          ? `/api/banners/${b.id}/image`
          : b.imageUrl,
    }));

    return NextResponse.json(
      {
        success: true,
        banners: sanitizedEffectiveBanners,
        flashSale: {
          isActive: flashSale["flash_sale_active"] === "true",
          title: (flashSale["flash_sale_title"] || "PROMO SPESIAL ARVANTA STUDIO").replace(/[⚡✨★⭐🔥]/g, "").trim(),
          subtitle: flashSale["flash_sale_subtitle"] || "Diskon Spesial Pembuatan Website & Desain Grafis Khusus Hari Ini!",
          discountPercent: flashSale["flash_sale_discount_percent"] || "20",
          voucherCode: flashSale["flash_sale_voucher_code"] || "PROMO20",
          endTime: flashSale["flash_sale_end_time"] || new Date(Date.now() + 86400000).toISOString(),
        },
        lastUpdated: latestBannerDate,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "CDN-Cache-Control": "no-store",
          "Vercel-CDN-Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching banners:", error);
    // Graceful fallback
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
          status: "PUBLISHED",
          sortOrder: 1,
        },
      ],
      flashSale: {
        isActive: false,
        title: "PROMO SPESIAL ARVANTA STUDIO",
        subtitle: "Diskon Pembuatan Website & Desain Grafis",
        discountPercent: "20",
        voucherCode: "PROMO20",
        endTime: new Date(Date.now() + 86400000).toISOString(),
      },
      lastUpdated: 0,
    });
  }
}
