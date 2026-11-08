import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "storage", "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

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

export async function saveUploadedFile(file: File): Promise<SavedFileResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Ukuran file melebihi batas maksimal 15MB (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
  }

  const mimeType = file.type.toLowerCase();
  const originalName = file.name;
  const ext = path.extname(originalName).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext) || (!ALLOWED_MIME_TYPES.includes(mimeType) && mimeType !== "")) {
    throw new Error(`Format file "${ext}" tidak diizinkan. Gunakan JPG, PNG, WEBP, SVG, PDF, atau ZIP.`);
  }

  // Prevent dangerous executable naming
  if (/\.(exe|bat|cmd|sh|php|js|jsx|ts|tsx|py|vbs|msi)$/i.test(originalName)) {
    throw new Error("Tipe file berbahaya terdeteksi dan ditolak oleh sistem keamanan.");
  }

  const randomHash = crypto.randomBytes(16).toString("hex");
  const safeFileName = `${Date.now()}-${randomHash}${ext}`;
  const targetPath = path.join(UPLOAD_DIR, safeFileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.promises.writeFile(targetPath, buffer);

  return {
    fileName: safeFileName,
    originalName: originalName.slice(0, 200),
    fileSize: file.size,
    fileType: mimeType || "application/octet-stream",
    filePath: targetPath,
  };
}

export function getFileBuffer(filePath: string): Buffer {
  if (!fs.existsSync(filePath)) {
    throw new Error("File tidak ditemukan di server.");
  }
  return fs.readFileSync(filePath);
}
