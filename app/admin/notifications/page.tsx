"use client";

import { useState, useEffect } from "react";
import PushNotificationManager from "@/components/PushNotificationManager";
import { MessageCircle, Bell, Send, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function AdminNotificationsPage() {
  const [waPhone, setWaPhone] = useState("62895322465836");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);
  const [waLogs, setWaLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/notifications");
      // Logs could also be fetched from orders or general
    } catch {}
  };

  const handleTestWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: waPhone }),
      });

      const data = await res.json();
      setTestResult(data.result);
    } catch (err: any) {
      alert("Gagal menguji WhatsApp.");
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-[#D9D7CF] pb-4">
        <h1 className="text-2xl font-display font-bold text-deep-charcoal">
          Pusat Notifikasi Real-Time & Integrasi WhatsApp
        </h1>
        <p className="text-xs text-deep-charcoal/60 font-mono">
          Kelola Web Push Notification multi-perangkat (VAPID) dan integrasi pengiriman WhatsApp API.
        </p>
      </div>

      {/* Web Push PWA Manager */}
      <PushNotificationManager />

      {/* WhatsApp Integration Testing Console */}
      <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-5 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-[#D9D7CF] pb-3">
          <MessageCircle className="w-5 h-5 text-emerald-800" />
          <div>
            <h3 className="text-sm font-display font-bold text-deep-charcoal uppercase">
              Integrasi WhatsApp Business / Gateway API
            </h3>
            <p className="text-[11px] text-deep-charcoal/60">
              Nomor WhatsApp Admin Utama: <strong className="font-mono">0895322465836</strong> (Format: 62895322465836)
            </p>
          </div>
        </div>

        <form onSubmit={handleTestWhatsApp} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-deep-charcoal mb-1">
              Nomor Tujuan Uji Coba (WhatsApp)
            </label>
            <input
              type="text"
              value={waPhone}
              onChange={(e) => setWaPhone(e.target.value)}
              placeholder="62895322465836"
              className="w-full px-3.5 py-2.5 text-xs bg-warm-ivory border border-[#D9D7CF] rounded-xs font-mono font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={sendingTest}
            className="px-5 py-2.5 bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-emerald-900 transition-colors rounded-xs shadow-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sendingTest ? "Menguji API..." : "Kirim Uji Coba Pesan WhatsApp"}</span>
          </button>
        </form>

        {testResult && (
          <div className="p-4 bg-warm-ivory border border-[#D9D7CF] rounded-xs space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between font-bold">
              <span>Status Respons API:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] uppercase ${
                  testResult.success
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {testResult.status}
              </span>
            </div>
            <p className="text-deep-charcoal/80">{testResult.message}</p>
            {testResult.waLink && (
              <div className="pt-2">
                <a
                  href={testResult.waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-800 hover:underline font-bold"
                >
                  <span>Buka Fallback WhatsApp Manual →</span>
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
