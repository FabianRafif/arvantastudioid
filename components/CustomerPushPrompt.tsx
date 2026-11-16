"use client";

import { useState, useEffect } from "react";
import { Smartphone, Bell, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function CustomerPushPrompt() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [dismissed, setDismissed] = useState(false);

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
    } catch {
      // Ignore
    }
  };

  const subscribeToPush = async () => {
    setLoading(true);
    setMessage("");

    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Izin notifikasi ditolak oleh browser Anda. Aktifkan di pengaturan browser jika ingin menerima notifikasi.");
        setLoading(false);
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

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
        setMessage("Berhasil! HP Anda kini otomatis menerima notifikasi pengumuman & status pesanan langsung ke layar ponsel.");
      } else {
        setMessage("Gagal mendaftarkan perangkat ke server.");
      }
    } catch (err: any) {
      setMessage(`Gagal mengaktifkan push: ${err.message || "Terjadi kesalahan"}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported || dismissed) {
    return null;
  }

  if (isSubscribed) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xs text-xs text-emerald-900">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">
            Notifikasi HP Aktif: Perangkat Anda otomatis menerima pengumuman maintenance & progres proyek secara langsung.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-r from-[#2D2D2D] to-[#1C1C1C] text-warm-ivory border border-[#3E3E3E] rounded-xs shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-[#FF9857]/20 border border-[#FF9857]/30 rounded-full text-[#FF9857] shrink-0 mt-0.5">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-space font-bold text-sm tracking-wide text-white">
              Aktifkan Notifikasi Resmi ke HP Anda
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF9857] text-[#2D2D2D] uppercase">
              Rekomendasi
            </span>
          </div>
          <p className="text-xs text-[#EDECE8]/80 mt-1 max-w-2xl leading-relaxed">
            Dapatkan peringatan instan di layar ponsel saat admin mengumumkan maintenance server, update pengerjaan website, pengiriman file, atau promo spesial secara real-time.
          </p>
          {message && (
            <p className="text-xs text-[#FF9857] mt-2 font-medium bg-black/30 px-3 py-1.5 rounded-xs border border-[#FF9857]/30">
              {message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="px-3 py-2 text-xs text-warm-ivory/60 hover:text-warm-ivory transition-colors cursor-pointer"
        >
          Nanti Saja
        </button>
        <button
          type="button"
          onClick={subscribeToPush}
          disabled={loading}
          className="px-4 py-2 bg-[#FF9857] hover:bg-[#FF8840] active:scale-95 text-[#2D2D2D] text-xs font-bold font-space uppercase tracking-wider rounded-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <Bell className="w-3.5 h-3.5" />
              <span>Aktifkan di HP</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
