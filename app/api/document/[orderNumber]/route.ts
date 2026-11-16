import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    const cleanId = decodeURIComponent(orderNumber).trim();

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: cleanId }, { id: cleanId }],
      },
      include: {
        items: {
          include: {
            servicePackage: true,
            designCatalog: true,
          },
        },
        invoices: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Dokumen pesanan tidak ditemukan. Periksa kembali nomor order Anda." },
        { status: 404 }
      );
    }

    // Sanitize client notes
    let cleanNotes = "-";
    if (order.notes) {
      if (order.notes.includes("--- SNAPSHOT HARGA TERKUNCI ---")) {
        const parts = order.notes.split("--- SNAPSHOT HARGA TERKUNCI ---");
        const clientPart = parts[0].trim();
        cleanNotes = clientPart && clientPart !== "-" ? clientPart : "-";
      } else if (order.notes.trim() && order.notes.trim() !== "-") {
        cleanNotes = order.notes.trim();
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        businessName: order.businessName || "-",
        serviceType: order.serviceType,
        websiteType: order.websiteType,
        designConcept: order.designConcept,
        designSize: order.designSize,
        designQuantity: order.designQuantity,
        totalAmount: order.totalAmount,
        dpAmount: order.dpAmount,
        remainingAmount: order.remainingAmount,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items,
        notes: cleanNotes,
      },
    });
  } catch (error: any) {
    console.error("Public order document lookup error:", error);
    return NextResponse.json(
      { error: "Gagal memuat dokumen faktur & kuitansi." },
      { status: 500 }
    );
  }
}
