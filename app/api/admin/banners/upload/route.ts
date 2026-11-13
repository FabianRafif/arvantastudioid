import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const BANNERS_DIR = path.join(process.cwd(), "public", "uploads", "banners");

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/pjpeg",
  "image/jfif",
  "application/octet-stream",
];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".jfif"];
const MAX_BANNER_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  try {
    if (!fs.existsSync(BANNERS_DIR)) {
      await fs.promises.mkdir(BANNERS_DIR, { recursive: true });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File banner tidak ditemukan dalam request." }, { status: 400 });
    }

    if (file.size > MAX_BANNER_SIZE) {
      return NextResponse.json(
        { error: "Ukuran banner melebihi batas maksimal 50MB. Silakan gunakan resolusi standar web (misal: 2560 x 960 px)." },
        { status: 400 }
      );
    }

    const originalName = file.name || "banner.png";
    const ext = path.extname(originalName).toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Format file "${ext}" tidak didukung. Harap gunakan gambar JPG, PNG, WEBP, atau SVG.` },
        { status: 400 }
      );
    }

    const randomHash = crypto.randomBytes(8).toString("hex");
    const safeFileName = `banner-${Date.now()}-${randomHash}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let publicUrl = "";
    try {
      if (!fs.existsSync(BANNERS_DIR)) {
        await fs.promises.mkdir(BANNERS_DIR, { recursive: true });
      }
      const destinationPath = path.join(BANNERS_DIR, safeFileName);
      await fs.promises.writeFile(destinationPath, buffer);
      publicUrl = `/uploads/banners/${safeFileName}`;
    } catch (fsErr) {
      // Vercel serverless Lambda has read-only filesystem (/var/task/public)
      // Fallback gracefully to Base64 Data URL which is stored in Prisma's @db.LongText
      console.warn("Filesystem is read-only (e.g. Vercel serverless), storing banner as Data URL:", fsErr);
      const mime =
        file.type ||
        (ext === ".webp"
          ? "image/webp"
          : ext === ".png"
          ? "image/png"
          : ext === ".svg"
          ? "image/svg+xml"
          : "image/jpeg");
      publicUrl = `data:${mime};base64,${buffer.toString("base64")}`;
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      apiUrl: publicUrl,
      fileName: safeFileName,
      originalName,
      fileSize: file.size,
    });
  } catch (error: any) {
    console.error("Banner upload error:", error);
    return NextResponse.json({ error: error.message || "Gagal mengunggah banner." }, { status: 500 });
  }
}
