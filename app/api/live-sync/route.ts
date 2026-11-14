import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [packages, services, banners, coupons, settingsList] = await Promise.all([
      prisma.servicePackage.findMany({
        where: { isActive: true },
        include: {
          service: {
            select: { id: true, name: true, slug: true, categoryId: true },
          },
        },
        orderBy: { price: "asc" },
      }),
      prisma.service.findMany({
        where: { isActive: true },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          packages: {
            where: { isActive: true },
            orderBy: { price: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      }),
      prisma.coupon.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
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
              "last_data_version",
              "RUNNING_TEXT_SETTINGS",
            ],
          },
        },
      }),
    ]);

    const settingsMap: Record<string, string> = {};
    for (const s of settingsList) {
      settingsMap[s.key] = s.value;
    }

    const now = new Date();
    const flashSaleEndTime = settingsMap["flash_sale_end_time"]
      ? new Date(settingsMap["flash_sale_end_time"])
      : null;
    const isFlashSaleTimeValid = flashSaleEndTime ? now < flashSaleEndTime : false;
    const isFlashSaleActive =
      settingsMap["flash_sale_active"] === "true" && isFlashSaleTimeValid;

    // Filter valid coupons (active, not expired, usage under limit)
    const validCoupons = coupons.filter((c) => {
      if (c.startDate && now < new Date(c.startDate)) return false;
      if (c.endDate && now > new Date(c.endDate)) return false;
      if (c.usageLimit && c.usageCount >= c.usageLimit) return false;
      return true;
    });

    // Calculate lowest website price
    const websitePackages = packages.filter(
      (p) => !p.service.name.toLowerCase().includes("desain")
    );
    const lowestWebsitePrice =
      websitePackages.length > 0
        ? Math.min(...websitePackages.map((p) => p.price))
        : 1500000;

    // Calculate lowest design price
    const designPackages = packages.filter((p) =>
      p.service.name.toLowerCase().includes("desain")
    );
    const lowestDesignPrice =
      designPackages.length > 0
        ? Math.min(...designPackages.map((p) => p.price))
        : 39000;

    // Navbar badge logic: only display if an active promo exists!
    let navbarBadge: string | null = null;
    if (isFlashSaleActive) {
      navbarBadge = settingsMap["flash_sale_discount_percent"]
        ? `${settingsMap["flash_sale_discount_percent"]}% OFF`
        : "PROMO";
    } else if (validCoupons.length > 0) {
      const topCoupon = validCoupons[0];
      navbarBadge =
        topCoupon.discountType === "PERCENTAGE"
          ? `${topCoupon.discountValue}% OFF`
          : topCoupon.code;
    }

    // Determine version token for fast client comparison
    const maxPackageTime = packages.reduce((max, p) => {
      const t = new Date(p.updatedAt).getTime();
      return t > max ? t : max;
    }, 0);
    const maxBannerTime = banners.reduce((max, b) => {
      const t = new Date(b.updatedAt).getTime();
      return t > max ? t : max;
    }, 0);
    const version = [
      settingsMap["last_data_version"] || "0",
      maxPackageTime,
      maxBannerTime,
      isFlashSaleActive ? "fs1" : "fs0",
      validCoupons.length,
      packages.length,
      lowestWebsitePrice,
    ].join("_");

    return NextResponse.json({
      success: true,
      version,
      timestamp: Date.now(),
      pricing: {
        packages,
        services,
        lowestWebsitePrice,
        lowestDesignPrice,
      },
      promotions: {
        flashSale: {
          isActive: isFlashSaleActive,
          title: settingsMap["flash_sale_title"] || "PROMO SPESIAL ARVANTA STUDIO",
          subtitle:
            settingsMap["flash_sale_subtitle"] ||
            "Dapatkan penawaran terbaik pembuatan website & sistem digital Anda.",
          discountPercent: Number(settingsMap["flash_sale_discount_percent"]) || 20,
          voucherCode: settingsMap["flash_sale_voucher_code"] || "PROMO20",
          endTime: settingsMap["flash_sale_end_time"] || null,
        },
        coupons: validCoupons,
        banners,
        navbarBadge,
      },
      runningText: settingsMap["RUNNING_TEXT_SETTINGS"]
        ? (() => {
            try {
              return JSON.parse(settingsMap["RUNNING_TEXT_SETTINGS"]);
            } catch {
              return null;
            }
          })()
        : null,
    });
  } catch (error: any) {
    console.error("Live-sync API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
