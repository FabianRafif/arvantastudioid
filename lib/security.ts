import { prisma } from "./prisma";

// In-memory rate limiting map (with automatic prune)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 20,
  windowMs: number = 60000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count };
}

export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
  userAgent,
}: {
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: userId || null,
        action,
        entityType: entityType || null,
        entityId: entityId || null,
        details: details || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
}

// Trusted Device Management
export async function verifyOrRegisterDevice({
  userId,
  deviceIdentifier,
  deviceName,
  ipAddress,
  userAgent,
}: {
  userId: string;
  deviceIdentifier: string;
  deviceName: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ isTrusted: boolean; device: any }> {
  try {
    let device = await prisma.trustedDevice.findUnique({
      where: { deviceIdentifier },
    });

    if (!device) {
      // Check if user already has trusted devices
      const existingCount = await prisma.trustedDevice.count({
        where: { userId },
      });

      // First device is auto-approved, subsequent require admin approval if enabled
      device = await prisma.trustedDevice.create({
        data: {
          userId,
          deviceIdentifier,
          deviceName,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
          isApproved: existingCount === 0, // auto approve first device
          lastUsedAt: new Date(),
        },
      });
    } else {
      await prisma.trustedDevice.update({
        where: { id: device.id },
        data: {
          lastUsedAt: new Date(),
          ipAddress: ipAddress || device.ipAddress,
        },
      });
    }

    return { isTrusted: device.isApproved, device };
  } catch (error) {
    console.error("Device check error:", error);
    return { isTrusted: true, device: null };
  }
}
