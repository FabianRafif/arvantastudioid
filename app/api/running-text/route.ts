import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { logActivity } from "@/lib/security";
import { DEFAULT_RUNNING_TEXT_CONFIG, RunningTextConfig } from "@/components/RunningTextMarquee";

export const dynamic = "force-dynamic";

const SETTING_KEY = "RUNNING_TEXT_SETTINGS";

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: SETTING_KEY },
    });

    let config: RunningTextConfig = DEFAULT_RUNNING_TEXT_CONFIG;
    if (setting?.value) {
      try {
        config = JSON.parse(setting.value);
      } catch {
        config = DEFAULT_RUNNING_TEXT_CONFIG;
      }
    }

    const version = setting?.updatedAt
      ? new Date(setting.updatedAt).getTime().toString()
      : "init";

    return NextResponse.json(
      { success: true, config, version },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, config: DEFAULT_RUNNING_TEXT_CONFIG, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const config: RunningTextConfig = {
      enabled: typeof body.enabled === "boolean" ? body.enabled : true,
      speed: Number(body.speed) || 28,
      theme: body.theme === "dark" || body.theme === "orange" ? body.theme : "light",
      separator: typeof body.separator === "string" ? body.separator : "✦",
      items: Array.isArray(body.items) ? body.items : DEFAULT_RUNNING_TEXT_CONFIG.items,
    };

    const valueStr = JSON.stringify(config);
    const nowVersion = Date.now().toString();

    // Upsert setting & touch last_data_version for global live sync
    await Promise.all([
      prisma.siteSetting.upsert({
        where: { key: SETTING_KEY },
        update: { value: valueStr },
        create: {
          key: SETTING_KEY,
          value: valueStr,
          description: "Pengaturan Running Text Marquee Beranda",
        },
      }),
      prisma.siteSetting.upsert({
        where: { key: "last_data_version" },
        update: { value: nowVersion },
        create: {
          key: "last_data_version",
          value: nowVersion,
          description: "Global data version for real-time live sync",
        },
      }),
    ]);

    await logActivity({
      userId: session.userId,
      action: "CMS_UPDATE",
      entityType: "RUNNING_TEXT",
      details: "Running Text Ticker diperbarui oleh administrator secara real-time.",
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({
      success: true,
      message: "Running text berhasil disimpan & disinkronkan secara real-time ke beranda!",
      version: nowVersion,
      config,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
