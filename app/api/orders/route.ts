import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/file-storage";
import { sendWhatsAppNotification, formatRupiah } from "@/lib/whatsapp";
import { sendPushNotificationToAdmins } from "@/lib/push";
import { logActivity } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const serviceType = (formData.get("serviceType") as string) || "WEBSITE";
    const customerName = formData.get("customerName") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const notes = (formData.get("notes") as string) || "";

    // Website fields
    const businessName = (formData.get("businessName") as string) || null;
    const websiteType = (formData.get("websiteType") as string) || null;
    const websiteGoal = (formData.get("websiteGoal") as string) || null;
    const featuresNeeded = (formData.get("featuresNeeded") as string) || null;
    const servicePackageId = (formData.get("servicePackageId") as string) || null;

    // Graphic Design fields
    const designCatalogId = (formData.get("designCatalogId") as string) || null;
    const designConcept = (formData.get("designConcept") as string) || null;
    const designSize = (formData.get("designSize") as string) || null;
    const designQuantity = parseInt((formData.get("designQuantity") as string) || "1", 10);
    const selectedColors = (formData.get("selectedColors") as string) || null;
    const textContent = (formData.get("textContent") as string) || null;

    const referenceUrl = (formData.get("referenceUrl") as string) || null;
    const preferredBudget = (formData.get("preferredBudget") as string) || null;
    const deadlineStr = formData.get("deadline") as string;
    const deadline = deadlineStr ? new Date(deadlineStr) : null;

    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: "Nama pemesan dan nomor WhatsApp wajib diisi." },
        { status: 400 }
      );
    }

    // Identify user or auto-register guest customer
    const session = await getSessionUser();
    let userId = session?.userId;

    if (!userId) {
      const cleanEmail = (customerEmail || `${customerPhone.replace(/\D/g, "")}@klien.arvanta.studio`).toLowerCase().trim();
      let user = await prisma.user.findFirst({
        where: {
          OR: [{ email: cleanEmail }, { phone: customerPhone }],
        },
      });

      if (!user) {
        const tempUsername = `klien_${Date.now().toString(36)}`;
        user = await prisma.user.create({
          data: {
            username: tempUsername,
            email: cleanEmail,
            fullName: customerName,
            phone: customerPhone,
            passwordHash: "TEMPORARY_GUEST_HASH",
            role: "CUSTOMER",
          },
        });
      }
      userId = user.id;
    }

    // Determine initial package price from database
    let baseAmount = 0;
    let packageNameOrProduct = "Layanan Pembuatan Website";
    let validServicePackageId: string | null = null;
    let validDesignCatalogId: string | null = null;

    if (serviceType === "WEBSITE" && servicePackageId) {
      const pkg = await prisma.servicePackage.findUnique({
        where: { id: servicePackageId },
        include: { service: true },
      });
      if (pkg) {
        validServicePackageId = pkg.id;
        baseAmount = pkg.price;
        packageNameOrProduct = `${pkg.service.name} — ${pkg.name}`;
      } else {
        baseAmount = 1500000;
      }
    } else if (serviceType === "GRAPHIC_DESIGN" && designCatalogId) {
      const design = await prisma.designCatalog.findUnique({
        where: { id: designCatalogId },
      });
      if (design) {
        validDesignCatalogId = design.id;
        baseAmount = (design.priceFinal || design.priceStarting) * (designQuantity || 1);
        packageNameOrProduct = `${design.name} (${designQuantity}x)`;
      }
    } else {
      baseAmount = 1500000;
    }

    // Validate Coupon / Voucher in Database
    const promoCode = ((formData.get("promoCode") as string) || "").trim().toUpperCase();
    let appliedDiscount = 0;
    let matchedCouponId: string | null = null;

    if (promoCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: promoCode },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const isStarted = !coupon.startDate || now >= coupon.startDate;
        const isNotEnded = !coupon.endDate || now <= coupon.endDate;
        const hasQuota = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;
        const meetsMinSpend = !coupon.minSpend || baseAmount >= coupon.minSpend;

        if (isStarted && isNotEnded && hasQuota && meetsMinSpend) {
          matchedCouponId = coupon.id;
          if (coupon.discountType === "PERCENTAGE") {
            appliedDiscount = Math.round((baseAmount * coupon.discountValue) / 100);
            if (coupon.maxDiscount && appliedDiscount > coupon.maxDiscount) {
              appliedDiscount = coupon.maxDiscount;
            }
          } else {
            appliedDiscount = coupon.discountValue;
          }
        }
      }
    }

    const totalAmount = Math.max(0, baseAmount - appliedDiscount);
    const dpAmount = Math.round(totalAmount * 0.5);
    const remainingAmount = totalAmount - dpAmount;

    // Generate atomic unique order number (e.g. ARV-202611-0001)
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    const count = await prisma.order.count();
    const orderNumber = `ARV-${currentYear}${currentMonth}-${String(count + 1).padStart(4, "0")}`;

    // Handle reference files upload
    const uploadedFiles: any[] = [];
    const fileEntries = formData.getAll("files");
    for (const entry of fileEntries) {
      if (entry instanceof File && entry.size > 0) {
        try {
          const saved = await saveUploadedFile(entry);
          uploadedFiles.push(saved);
        } catch (fileErr: any) {
          console.warn("Skipping file upload:", fileErr.message);
        }
      }
    }

    // Store immutable Price Snapshot in order notes metadata
    const priceSnapshotData = {
      serviceType,
      packageName: packageNameOrProduct,
      normalPrice: baseAmount,
      promoCode: promoCode || null,
      discountAmount: appliedDiscount,
      finalTotal: totalAmount,
      dpAmount,
      remainingAmount,
      snapshotTimestamp: new Date().toISOString(),
      priceVersion: "v2026.1",
    };

    const combinedNotes = `${notes ? notes + "\n\n" : ""}--- SNAPSHOT HARGA TERKUNCI ---\n${JSON.stringify(
      priceSnapshotData,
      null,
      2
    )}`;

    // Execute atomic order creation transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: userId!,
          serviceType,
          status: "MENUNGGU_KONFIRMASI",
          totalAmount,
          dpAmount,
          remainingAmount,
          customerName,
          customerPhone,
          customerEmail: customerEmail || "",
          businessName,
          websiteType,
          websiteGoal,
          featuresNeeded,
          designConcept,
          designSize,
          designQuantity: designQuantity || 1,
          selectedColors,
          textContent,
          referenceUrl,
          preferredBudget,
          deadline,
          notes: combinedNotes,
        },
      });

      // Increment coupon usage count atomically
      if (matchedCouponId) {
        await tx.coupon.update({
          where: { id: matchedCouponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Save order item
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          servicePackageId: validServicePackageId,
          designCatalogId: validDesignCatalogId,
          name: packageNameOrProduct,
          price: totalAmount,
          quantity: designQuantity || 1,
          subtotal: totalAmount,
        },
      });

      // Save uploaded files
      for (const f of uploadedFiles) {
        await tx.orderFile.create({
          data: {
            orderId: order.id,
            fileName: f.fileName,
            originalName: f.originalName,
            fileSize: f.fileSize,
            fileType: f.fileType,
            filePath: f.filePath,
            fileCategory: "REFERENCE",
            uploadedBy: "CUSTOMER",
          },
        });
      }

      // Initial status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: null,
          newStatus: "MENUNGGU_KONFIRMASI",
          notes: "Pesanan baru berhasil dibuat oleh pelanggan. Menunggu konfirmasi admin.",
        },
      });

      // Create initial Invoice for DP (50%)
      const invoiceNumber = `INV-${currentYear}${currentMonth}-${String(count + 1).padStart(4, "0")}-DP`;
      await tx.invoice.create({
        data: {
          invoiceNumber,
          orderId: order.id,
          subtotal: baseAmount,
          discountAmount: appliedDiscount,
          total: dpAmount,
          status: "UNPAID",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days due
        },
      });

      // Create in-app notification for admin
      await tx.notification.create({
        data: {
          userId: null,
          type: "ORDER_CREATED",
          title: `Pesanan Baru: ${order.orderNumber}`,
          message: `${customerName} (${customerPhone}) memesan ${packageNameOrProduct} senilai ${formatRupiah(totalAmount)}.`,
          link: `/admin/orders/${order.id}`,
        },
      });

      return order;
    });

    // Send WhatsApp notification to Admin & generate direct wa.me link
    let whatsappUrl = "";
    try {
      const waRes = await sendWhatsAppNotification({
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        customerName,
        customerPhone,
        serviceType,
        packageNameOrProduct,
        priceFormatted: formatRupiah(totalAmount),
        notes: notes || undefined,
        details:
          serviceType === "WEBSITE"
            ? `Website: ${websiteType || "-"}, Goal: ${websiteGoal || "-"}, Fitur: ${featuresNeeded || "-"}`
            : `Desain: ${designSize || "-"}, Qty: ${designQuantity}, Konsep: ${designConcept || "-"}`,
      });
      whatsappUrl = waRes.waLink || "";
    } catch (waErr: any) {
      console.warn("WhatsApp notification error:", waErr?.message);
    }

    // Notify admins via Web Push
    try {
      await sendPushNotificationToAdmins({
        title: `Pesanan Baru: ${newOrder.orderNumber}`,
        message: `${customerName} baru saja memesan ${packageNameOrProduct}. Total: ${formatRupiah(totalAmount)}.`,
        url: `/admin/orders/${newOrder.id}`,
      });
    } catch {}

    // Touch last_data_version for instant cross-tab real-time sync in Admin
    try {
      await prisma.siteSetting.upsert({
        where: { key: "last_data_version" },
        update: { value: Date.now().toString() },
        create: {
          key: "last_data_version",
          value: Date.now().toString(),
          description: "Global live sync trigger",
        },
      });
    } catch {}

    // Log Activity
    await logActivity({
      userId,
      action: "ORDER_CREATE",
      entityType: "ORDER",
      entityId: newOrder.id,
      details: `Pesanan ${newOrder.orderNumber} berhasil dibuat dengan total ${totalAmount}.`,
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
      orderNumber: newOrder.orderNumber,
      totalAmount,
      dpAmount,
      remainingAmount,
      whatsappUrl,
      manualWhatsAppUrl: whatsappUrl,
      message: "Pesanan berhasil dibuat dan langsung terhubung ke WhatsApp Admin.",
    });
  } catch (error: any) {
    console.error("Gagal membuat pesanan:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan pada sistem pemesanan." },
      { status: 500 }
    );
  }
}
