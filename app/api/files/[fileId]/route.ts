import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import fs from "fs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const session = await getSessionUser();

    if (!session) {
      return NextResponse.json({ error: "Akses tidak diizinkan." }, { status: 401 });
    }

    const orderFile = await prisma.orderFile.findUnique({
      where: { id: fileId },
      include: {
        order: {
          select: { userId: true },
        },
      },
    });

    if (!orderFile) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });
    }

    // IDOR Protection: only admin or the order owner can download
    const isAdmin = session.role === "SUPER_ADMIN" || session.role === "ADMIN";
    const isOwner = orderFile.order.userId === session.userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Anda tidak memiliki otorisasi untuk mengakses file ini." },
        { status: 403 }
      );
    }

    if (!fs.existsSync(orderFile.filePath)) {
      return NextResponse.json(
        { error: "File fisik tidak ditemukan pada server penyimpanan." },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(orderFile.filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": orderFile.fileType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${encodeURIComponent(orderFile.originalName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("File download error:", error);
    return NextResponse.json({ error: "Gagal mengunduh file." }, { status: 500 });
  }
}
