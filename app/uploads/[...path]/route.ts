import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".jfif": "image/jpeg",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    if (!segments || segments.length === 0) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });
    }

    const uploadsBaseDir = path.resolve(process.cwd(), "public", "uploads");
    const safeFilePath = path.resolve(uploadsBaseDir, ...segments);

    // Guard against path traversal attacks
    if (!safeFilePath.startsWith(uploadsBaseDir)) {
      return NextResponse.json({ error: "Akses tidak diizinkan." }, { status: 403 });
    }

    if (!fs.existsSync(safeFilePath)) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 404 });
    }

    const stat = await fs.promises.stat(safeFilePath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: "Bukan file yang valid." }, { status: 400 });
    }

    const ext = path.extname(safeFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileBuffer = await fs.promises.readFile(safeFilePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stat.size.toString(),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error: any) {
    console.error("Dynamic upload serving error:", error);
    return NextResponse.json({ error: "Gagal menyajikan file." }, { status: 500 });
  }
}
