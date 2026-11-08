import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { saveUploadedFile } from "@/lib/file-storage";
import { logActivity } from "@/lib/security";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Hanya admin yang dapat mengunggah file deliverables." }, { status: 403 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "File tidak boleh kosong." }, { status: 400 });
    }

    const saved = await saveUploadedFile(file);

    const createdFile = await prisma.orderFile.create({
      data: {
        orderId: order.id,
        fileName: saved.fileName,
        originalName: saved.originalName,
        fileSize: saved.fileSize,
        fileType: saved.fileType,
        filePath: saved.filePath,
        fileCategory: "DELIVERABLE",
        isDelivered: true,
        uploadedBy: "ADMIN",
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: "DELIVERABLE_UPLOADED",
        title: `Hasil Proyek Diunggah: ${order.orderNumber}`,
        message: `Admin Arvanta Studio telah mengunggah berkas hasil serah terima (${saved.originalName}). Silakan periksa dan unduh di dashboard.`,
        link: `/dashboard/orders/${order.orderNumber}`,
      },
    });

    await logActivity({
      userId: session.userId,
      action: "UPLOAD_DELIVERABLE",
      entityType: "ORDER",
      entityId: order.id,
      details: `File deliverable diunggah: ${saved.originalName} untuk order ${order.orderNumber}`,
    });

    return NextResponse.json({ success: true, file: createdFile });
  } catch (error: any) {
    console.error("Deliverable upload error:", error);
    return NextResponse.json({ error: error?.message || "Gagal mengunggah file hasil." }, { status: 500 });
  }
}
