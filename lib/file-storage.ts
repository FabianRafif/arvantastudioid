import fs from "fs";
import path from "path";
import crypto from "crypto";

// Allowed MIME types and extensions
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "application/zip",
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".svg", ".pdf", ".zip"];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export interface SavedFileResult {
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
}

/**
 * Returns upload directory safely.
 * On Vercel / serverless environment, filesystem is read-only except /tmp.
 */
function getUploadDir(): string {
  const isVercel = !!process.env.VERCEL;
  const dir = isVercel
    ? path.join("/tmp", "uploads")
    : path.join(process.cwd(), "storage", "uploads");

  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (err: any) {
    console.warn("Could not create upload directory, falling back to /tmp:", err?.message);
    return "/tmp";
  }

  return dir;
}

export async function saveUploadedFile(file: File): Promise<SavedFileResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `Ukuran file melebihi batas maksimal 15MB (${(file.size / 1024 / 1024).toFixed(1)}MB)`
    );
  }

  const mimeType = file.type.toLowerCase();
  const originalName = file.name;
  const ext = path.extname(originalName).toLowerCase();

  if (
    !ALLOWED_EXTENSIONS.includes(ext) ||
    (!ALLOWED_MIME_TYPES.includes(mimeType) && mimeType !== "")
  ) {
    throw new Error(
      `Format file "${ext}" tidak diizinkan. Gunakan JPG, PNG, WEBP, SVG, PDF, atau ZIP.`
    );
  }

  // Prevent dangerous executable naming
  if (/\.(exe|bat|cmd|sh|php|js|jsx|ts|tsx|py|vbs|msi)$/i.test(originalName)) {
    throw new Error("Tipe file berbahaya terdeteksi dan ditolak oleh sistem keamanan.");
  }

  const uploadDir = getUploadDir();
  const randomHash = crypto.randomBytes(16).toString("hex");
  const safeFileName = `${Date.now()}-${randomHash}${ext}`;
  const targetPath = path.join(uploadDir, safeFileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    await fs.promises.writeFile(targetPath, buffer);
  } catch (writeErr: any) {
    console.warn("Failed to write to targetPath, falling back to /tmp directly:", writeErr?.message);
    const fallbackPath = path.join("/tmp", safeFileName);
    try {
      await fs.promises.writeFile(fallbackPath, buffer);
      return {
        fileName: safeFileName,
        originalName: originalName.slice(0, 200),
        fileSize: file.size,
        fileType: mimeType || "application/octet-stream",
        filePath: fallbackPath,
      };
    } catch {
      // If disk write fails completely, encode as Data URL so data is never lost
      const base64 = buffer.toString("base64");
      const dataUri = `data:${mimeType || "application/octet-stream"};base64,${base64}`;
      return {
        fileName: safeFileName,
        originalName: originalName.slice(0, 200),
        fileSize: file.size,
        fileType: mimeType || "application/octet-stream",
        filePath: dataUri,
      };
    }
  }

  return {
    fileName: safeFileName,
    originalName: originalName.slice(0, 200),
    fileSize: file.size,
    fileType: mimeType || "application/octet-stream",
    filePath: targetPath,
  };
}

export function getFileBuffer(filePath: string): Buffer {
  if (filePath.startsWith("data:")) {
    const base64Part = filePath.split(",")[1];
    return Buffer.from(base64Part, "base64");
  }
  if (!fs.existsSync(filePath)) {
    throw new Error("File tidak ditemukan di server.");
  }
  return fs.readFileSync(filePath);
}
