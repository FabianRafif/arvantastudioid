import { prisma } from "./prisma";

// Safe cross-platform require for web-push
// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require("web-push");

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BJBS5fVVrsVjQziyYPVmoQORGXiV0VSA-kIdATdoSCaa-UsDkP8SAXI6drzqkaZYv5xCJuYdlLmPXSqjy9S4UvQ";
const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || "Ji1NJ5Shv5yIbakqk47Z9xSKNbvRWyjt2IUP4WtDCg8";
const VAPID_SUBJECT =
  process.env.VAPID_SUBJECT || "mailto:rafifazmi466@gmail.com";

try {
  if (webpush && typeof webpush.setVapidDetails === "function" && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  }
} catch (err) {
  console.error("Failed to initialize VAPID details:", err);
}

export async function sendPushNotificationToAdmins({
  title,
  message,
  url = "/admin/orders",
}: {
  title: string;
  message: string;
  url?: string;
}): Promise<{ totalSent: number; totalFailed: number }> {
  try {
    const adminSubscriptions = await prisma.pushSubscription.findMany({
      where: {
        user: {
          role: { in: ["SUPER_ADMIN", "ADMIN"] },
        },
      },
    });

    if (adminSubscriptions.length === 0) {
      return { totalSent: 0, totalFailed: 0 };
    }

    const payload = JSON.stringify({
      title,
      message,
      url,
      timestamp: Date.now(),
    });

    let sent = 0;
    let failed = 0;

    for (const sub of adminSubscriptions) {
      try {
        const pushSubscriptionObj = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        await webpush.sendNotification(pushSubscriptionObj, payload);
        sent++;
      } catch (error: any) {
        failed++;
        if (error?.statusCode === 410 || error?.statusCode === 404) {
          await prisma.pushSubscription
            .delete({ where: { id: sub.id } })
            .catch(() => {});
        }
      }
    }

    return { totalSent: sent, totalFailed: failed };
  } catch (err) {
    console.error("Error broadcasting push notification:", err);
    return { totalSent: 0, totalFailed: 0 };
  }
}
