"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Bell, Volume2, VolumeX, CheckCheck, ExternalLink } from "lucide-react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const previousUnreadRef = useRef(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Generate Web Audio API subtle chime
    const playChime = () => {
      if (!soundEnabled) return;
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } catch (e) {
        // AudioContext blocked before interaction
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
          const count = data.unreadCount || 0;

          // If new unread arrives, chime!
          if (count > previousUnreadRef.current && previousUnreadRef.current !== 0) {
            playChime();
          }
          previousUnreadRef.current = count;
          setUnreadCount(count);
        }
      } catch (err) {
        // silent
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 8000); // Poll every 8s for live notifications
    return () => clearInterval(interval);
  }, [soundEnabled]);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-deep-charcoal hover:bg-soft-grey/40 rounded-xs transition-colors"
        title="Pusat Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-soft-grey shadow-xl rounded-xs z-50 overflow-hidden text-deep-charcoal">
          <div className="p-3 border-b border-soft-grey/60 flex items-center justify-between bg-warm-ivory">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">
                Notifikasi Real-Time
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-muted-olive text-warm-ivory px-1.5 py-0.5 rounded-full font-mono">
                  {unreadCount} Baru
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 text-deep-charcoal/60 hover:text-deep-charcoal"
                title={soundEnabled ? "Suara notifikasi aktif" : "Suara dimatikan"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-muted-olive" /> : <VolumeX className="w-4 h-4" />}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-muted-olive hover:underline flex items-center gap-1 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tandai Dibaca
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-soft-grey/30">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-deep-charcoal/50 font-mono">
                Belum ada notifikasi baru.
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link || "#"}
                  onClick={() => setIsOpen(false)}
                  className={`block p-3.5 hover:bg-warm-ivory transition-colors ${
                    !notif.isRead ? "bg-muted-olive/5 font-semibold" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-deep-charcoal leading-snug">{notif.title}</p>
                    <span className="text-[9px] text-deep-charcoal/50 whitespace-nowrap font-mono">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-deep-charcoal/70 line-clamp-2 mt-1 font-normal leading-relaxed">
                    {notif.message}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
