"use client";

import { useState, useEffect } from "react";
import { History, Shield, Clock, User, Filter } from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  details: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: { fullName: string; username: string; role: string };
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit-logs")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.logs) setLogs(data.logs);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
            Audit Log Aktivitas Sistem
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Catatan kekal transaksi, modifikasi harga, login administrator, dan tindakan sensitif server.
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#D9D7CF] rounded-xs shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#D9D7CF] flex items-center justify-between bg-[#FAFAF8]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted-olive" />
            <h2 className="text-sm font-bold text-deep-charcoal">
              Aktivitas Tercatat (Terbaru)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-muted-olive font-semibold">
            {logs.length} Log Entries
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-mono text-deep-charcoal/60">
            Memuat audit log...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-deep-charcoal/60">
            Belum ada aktivitas tercatat pada sistem.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F2EB] border-b border-[#D9D7CF] text-[10px] font-mono uppercase text-deep-charcoal/60">
                <tr>
                  <th className="p-4">Waktu (WIB)</th>
                  <th className="p-4">Tindakan Action</th>
                  <th className="p-4">Pelaku User</th>
                  <th className="p-4">Rincian Perubahan</th>
                  <th className="p-4">IP / Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D7CF]/60 font-mono">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF9F5]">
                    <td className="p-4 text-[10px] text-deep-charcoal/70 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("id-ID", {
                        timeZone: "Asia/Jakarta",
                        dateStyle: "short",
                        timeStyle: "medium",
                      })}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 bg-muted-olive/15 text-muted-olive font-bold text-[10px] rounded-xs">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-sans">
                      <span className="font-bold text-deep-charcoal block">
                        {log.user?.fullName || "Sistem / Tamu"}
                      </span>
                      <span className="text-[10px] font-mono text-deep-charcoal/60">
                        {log.user ? `@${log.user.username}` : "-"}
                      </span>
                    </td>
                    <td className="p-4 font-sans text-xs text-deep-charcoal/80 max-w-md">
                      {log.details || "-"}
                    </td>
                    <td className="p-4 text-[10px] text-deep-charcoal/50 whitespace-nowrap">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
