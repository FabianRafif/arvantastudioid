"use client";

import { useState, useEffect } from "react";
import { Smartphone, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const VAPID_PUBLIC_KEY =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    "BJBS5fVVrsVjQziyYPVmoQORGXiV0VSA-kIdATdoSCaa-UsDkP8SAXI6drzqkaZYv5xCJuYdlLmPXSqjy9S4UvQ";

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      checkExistingSubscription();
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const checkExistingSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(Boolean(sub));
    } catch (e) {
      console.warn("Could not check push subscription:", e);
    }
  };

  const subscribeToPush = async () => {
    setLoading(true);
    setMessage("");

    try {
      // Register service worker if not registered
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Izin notifikasi ditolak oleh browser Anda.");
        setLoading(false);
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send to server
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(
              String.fromCharCode.apply(
                null,
                new Uint8Array(subscription.getKey("p256dh")!) as any
              )
            ),
            auth: btoa(
              String.fromCharCode.apply(
                null,
                new Uint8Array(subscription.getKey("auth")!) as any
              )
            ),
          },
          userAgent: navigator.userAgent,
        }),
      });

      if (res.ok) {
        setIsSubscribed(true);
        setMessage("Perangkat ini berhasil terdaftar untuk menerima Push Notification real-time!");
      } else {
        setMessage("Gagal mendaftarkan perangkat ke server.");
      }
    } catch (err: any) {
      console.error("Push subscription error:", err);
      setMessage(`Gagal mengaktifkan push: ${err.message || "Error"}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTestPush = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Tes notifikasi berhasil dikirim!");
      } else {
        setMessage(data.error || "Gagal mengirim tes notifikasi.");
      }
    } catch {
      setMessage("Koneksi gagal saat menguji notifikasi.");
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-warm-ivory border border-soft-grey text-xs text-deep-charcoal/70 rounded-xs flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600" />
        <span>Browser ini belum mendukung Web Push Notifications. Gunakan Chrome, Edge, atau Safari terbaru.</span>
      </div>
    );
  }

  return (
    <div className="p-5 bg-white border border-soft-grey rounded-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Smartphone className="w-5 h-5 text-muted-olive" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-deep-charcoal">
              Web Push Notification (PWA / Mobile HP)
            </h4>
            <p className="text-[11px] text-deep-charcoal/60 mt-0.5">
              Dapatkan peringatan pesanan langsung ke HP atau PC meskipun website tidak sedang dibuka.
            </p>
          </div>
        </div>
        <div>
          {isSubscribed ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Aktif di Perangkat Ini
            </span>
          ) : (
            <button
              onClick={subscribeToPush}
              disabled={loading}
              className="px-3.5 py-1.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs disabled:opacity-50"
            >
              {loading ? "Mendaftarkan..." : "Aktifkan di HP / PC"}
            </button>
          )}
        </div>
      </div>

      {isSubscribed && (
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={sendTestPush}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-deep-charcoal text-deep-charcoal text-xs font-medium hover:bg-deep-charcoal hover:text-warm-ivory transition-colors rounded-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Kirim Tes Notifikasi ke HP
          </button>
        </div>
      )}

      {message && (
        <p className="text-xs font-mono text-muted-olive bg-warm-ivory p-2 rounded-xs">
          {message}
        </p>
      )}
    </div>
  );
}
