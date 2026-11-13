"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  DollarSign,
  Download,
  Calendar,
  CreditCard,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";

interface ReportData {
  period: string;
  summary: {
    totalGrossOmzet: number;
    verifiedCashReceived: number;
    pendingReceivables: number;
    totalOrdersCount: number;
    totalCustomersCount: number;
  };
  popularPackages: { name: string; count: number; revenue: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    serviceType: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminReportsPage() {
  const [period, setPeriod] = useState("ALL");
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async (selectedPeriod: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reports?period=${selectedPeriod}`);
      const json = await res.json();
      if (res.ok) {
        setData(json);
      }
    } catch {
      console.error("Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(period);
  }, [period]);

  const exportCSV = () => {
    if (!data || !data.recentOrders) return;

    const headers = ["Nomor Pesanan", "Pelanggan", "Layanan", "Total (Rp)", "Status", "Tanggal"];
    const rows = data.recentOrders.map((o) => [
      o.orderNumber,
      `"${o.customerName}"`,
      `"${o.serviceType}"`,
      o.totalAmount,
      o.status,
      new Date(o.createdAt).toLocaleDateString("id-ID"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `laporan-arvanta-studio-${period}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
            Laporan Keuangan & Analitik Bisnis
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Pemisahan akurat antara total omzet pesanan, kas masuk terverifikasi, dan sisa piutang klien.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-white border border-[#D9D7CF] rounded-xs text-xs font-mono font-bold"
          >
            <option value="ALL">Semua Waktu</option>
            <option value="TODAY">Hari Ini</option>
            <option value="7DAYS">7 Hari Terakhir</option>
            <option value="30DAYS">30 Hari Terakhir</option>
          </select>

          <button
            onClick={exportCSV}
            disabled={!data || data.recentOrders.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {loading || !data ? (
        <div className="p-12 text-center text-xs font-mono text-deep-charcoal/60 bg-white border border-[#D9D7CF] rounded-xs">
          Mengalkulasi metrik keuangan...
        </div>
      ) : (
        <>
          {/* 3 Core Financial Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-2 shadow-xs">
              <span className="text-[10px] font-mono uppercase tracking-widest text-deep-charcoal/60 block font-bold">
                1. Total Omzet Nilai Pesanan
              </span>
              <div className="text-2xl sm:text-3xl font-display font-black text-deep-charcoal">
                Rp{data.summary.totalGrossOmzet.toLocaleString("id-ID")}
              </div>
              <span className="text-[11px] text-deep-charcoal/60 font-mono block">
                Total komitmen kontrak {data.summary.totalOrdersCount} pesanan
              </span>
            </div>

            <div className="p-6 bg-white border-2 border-emerald-700/80 rounded-xs space-y-2 shadow-xs bg-emerald-50/20">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 block font-bold">
                2. Uang Kas Masuk (Terverifikasi)
              </span>
              <div className="text-2xl sm:text-3xl font-display font-black text-emerald-800">
                Rp{data.summary.verifiedCashReceived.toLocaleString("id-ID")}
              </div>
              <span className="text-[11px] text-emerald-700 font-mono block">
                Dana riil masuk ke rekening studio
              </span>
            </div>

            <div className="p-6 bg-white border-2 border-amber-600/80 rounded-xs space-y-2 shadow-xs bg-amber-50/20">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 block font-bold">
                3. Piutang Tagihan (Belum Lunas)
              </span>
              <div className="text-2xl sm:text-3xl font-display font-black text-amber-800">
                Rp{data.summary.pendingReceivables.toLocaleString("id-ID")}
              </div>
              <span className="text-[11px] text-amber-700 font-mono block">
                Sisa tagihan menunggu pelunasan tahap akhir
              </span>
            </div>
          </div>

          {/* Popular Packages & Services */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#D9D7CF] pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-olive" />
                  <h3 className="text-sm font-bold text-deep-charcoal">
                    Layanan & Paket Terlaris
                  </h3>
                </div>
              </div>

              {data.popularPackages.length === 0 ? (
                <p className="text-xs text-deep-charcoal/60 font-mono py-4">
                  Belum ada data transaksi paket pada periode ini.
                </p>
              ) : (
                <div className="divide-y divide-[#D9D7CF]/60 text-xs">
                  {data.popularPackages.map((pkg, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-deep-charcoal block">{pkg.name}</span>
                        <span className="text-[10px] text-deep-charcoal/50 font-mono">
                          {pkg.count} pesanan
                        </span>
                      </div>
                      <span className="font-mono font-bold text-deep-charcoal">
                        Rp{pkg.revenue.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white border border-[#D9D7CF] rounded-xs p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#D9D7CF] pb-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-muted-olive" />
                  <h3 className="text-sm font-bold text-deep-charcoal">
                    Transaksi Pesanan Terbaru
                  </h3>
                </div>
              </div>

              {data.recentOrders.length === 0 ? (
                <p className="text-xs text-deep-charcoal/60 font-mono py-4">
                  Belum ada pesanan pada periode ini.
                </p>
              ) : (
                <div className="divide-y divide-[#D9D7CF]/60 text-xs">
                  {data.recentOrders.slice(0, 5).map((o) => (
                    <div key={o.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-deep-charcoal block">
                          {o.orderNumber}
                        </span>
                        <span className="text-[10px] text-deep-charcoal/60">
                          {o.customerName} • {o.status}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-deep-charcoal">
                        Rp{o.totalAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
