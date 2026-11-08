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

    const serviceType = (formData.get("serviceType") as string) || "WEBSITE"; // "WEBSITE" | "GRAPHIC_DESIGN"
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
        { error: "Nama pelanggan dan nomor WhatsApp wajib diisi." },
        { status: 400 }
      );
    }

    // Determine current user or auto-associate
    const session = await getSessionUser();
    let userId = session?.userId;

    if (!userId) {
      // Find or create customer account by email/phone
      const cleanEmail = (customerEmail || `${customerPhone}@guest.arvanta.studio`).toLowerCase().trim();
      let user = await prisma.user.findFirst({
        where: {
          OR: [{ email: cleanEmail }, { phone: customerPhone }],
        },
      });

      if (!user) {
        const tempUsername = `user_${Date.now().toString(36)}`;
        user = await prisma.user.create({
          data: {
            username: tempUsername,
            email: cleanEmail,
            fullName: customerName,
            phone: customerPhone,
            passwordHash: "TEMPORARY_HASH",
            role: "CUSTOMER",
          },
        });
      }
      userId = user.id;
    }

    // Determine pricing and item details
    let totalAmount = 0;
    let packageNameOrProduct = "Pesanan Kustom";

    if (serviceType === "WEBSITE" && servicePackageId) {
      const pkg = await prisma.servicePackage.findUnique({
        where: { id: servicePackageId },
        include: { service: true },
      });
      if (pkg) {
        totalAmount = pkg.price;
        packageNameOrProduct = `${pkg.service.name} — ${pkg.name}`;
      }
    } else if (serviceType === "GRAPHIC_DESIGN" && designCatalogId) {
      const design = await prisma.designCatalog.findUnique({
        where: { id: designCatalogId },
      });
      if (design) {
        totalAmount = (design.priceFinal || design.priceStarting) * (designQuantity || 1);
        packageNameOrProduct = `${design.name} (${designQuantity}x)`;
      }
    }

    // Default 50% DP
    const dpAmount = Math.round(totalAmount * 0.5);
    const remainingAmount = totalAmount - dpAmount;

    // Generate unique order number (e.g. ARV-2026-0001)
    const currentYear = new Date().getFullYear();
    const count = await prisma.order.count();
    const orderNumber = `ARV-${currentYear}-${String(count + 1).padStart(4, "0")}`;

    // Handle uploaded reference files
    const uploadedFiles: any[] = [];
    const mediaUrlsForWA: string[] = [];

    const fileEntries = formData.getAll("files");
    for (const entry of fileEntries) {
      if (entry instanceof File && entry.size > 0) {
        try {
          const saved = await saveUploadedFile(entry);
          uploadedFiles.push(saved);
        } catch (fileErr: any) {
          console.warn("Skipping invalid file upload:", fileErr.message);
        }
      }
    }

    // Execute order creation transaction
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
          notes,
        },
      });

      // Save order item
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          servicePackageId: servicePackageId || null,
          designCatalogId: designCatalogId || null,
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
          notes: "Pesanan baru berhasil dibuat oleh pelanggan.",
        },
      });

      // Automated system notification for admin
      await tx.notification.create({
        data: {
          type: "NEW_ORDER",
          title: `Pesanan Baru: ${orderNumber}`,
          message: `${customerName} melakukan pemesanan ${serviceType === "WEBSITE" ? "Website" : "Desain Grafis"} (${packageNameOrProduct}) senilai ${formatRupiah(totalAmount)}.`,
          link: `/admin/orders/${order.id}`,
        },
      });

      return order;
    });

    // Send Real WhatsApp Notification to Admin
    const waResult = await sendWhatsAppNotification({
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerName,
      customerPhone,
      serviceType: serviceType === "WEBSITE" ? "Website Development" : "Graphic Design",
      packageNameOrProduct,
      priceFormatted: formatRupiah(totalAmount),
      notes,
      details: notes || websiteGoal || designConcept || "Tidak ada rincian tambahan",
      mediaUrls: mediaUrlsForWA,
    });

    // Send Web Push Notification to Admin Devices
    await sendPushNotificationToAdmins({
      title: `Order Masuk: ${newOrder.orderNumber}`,
      message: `${customerName} memesan ${packageNameOrProduct} (${formatRupiah(totalAmount)})`,
      url: `/admin/orders/${newOrder.id}`,
    });

    await logActivity({
      userId,
      action: "CREATE_ORDER",
      entityType: "ORDER",
      entityId: newOrder.id,
      details: `Order dibuat: ${orderNumber} - ${packageNameOrProduct}`,
    });

    return NextResponse.json({
      success: true,
      orderNumber: newOrder.orderNumber,
      orderId: newOrder.id,
      totalAmount,
      dpAmount,
      whatsAppResult: waResult,
      manualWhatsAppUrl: waResult.waLink,
      message: "Pesanan Anda berhasil dikirim ke Arvanta Studio!",
    });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat memproses pesanan." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Akses tidak diizinkan." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (session.role === "CUSTOMER") {
      where.userId = session.userId;
    }
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        files: true,
        payments: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pesanan." }, { status: 500 });
  }
}
