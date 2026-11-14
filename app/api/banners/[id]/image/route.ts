import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const banner = await prisma.banner.findUnique({
      where: { id },
      select: { imageUrl: true },
    });

    if (!banner || !banner.imageUrl) {
      return new NextResponse("Banner not found", { status: 404 });
    }

    // If it's a Base64 Data URL, decode and serve as binary WebP/PNG with strong immutable caching
    if (banner.imageUrl.startsWith("data:")) {
      const commaIdx = banner.imageUrl.indexOf(",");
      if (commaIdx === -1) {
        return new NextResponse("Invalid image data", { status: 400 });
      }

      const header = banner.imageUrl.substring(0, commaIdx);
      const base64Data = banner.imageUrl.substring(commaIdx + 1);

      let contentType = "image/webp";
      const mimeMatch = header.match(/:(.*?);/);
      if (mimeMatch && mimeMatch[1]) {
        contentType = mimeMatch[1];
      }

      const buffer = Buffer.from(base64Data, "base64");

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Content-Length": buffer.length.toString(),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // If it's already an external or local URL, redirect directly
    return NextResponse.redirect(new URL(banner.imageUrl, req.url));
  } catch (error) {
    console.error("Banner image serving error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
