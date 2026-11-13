import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Tag, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Promo & Penawaran Eksklusif | Arvanta Studio",
  description:
    "Daftar promo pembuatan website, diskon peluncuran, dan voucher hemat dari Arvanta Studio.",
};

export default async function PromoPage() {
  // Query active banners
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  // Query coupons
  const coupons = await prisma.coupon.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#EDECE8] flex flex-col text-[#2D2D2D] font-sans selection:bg-[#FF9857] selection:text-[#2D2D2D]">
      <Navbar />

      {/* Crafto Editorial Hero Header */}
      <section className="pt-36 pb-16 md:pt-48 md:pb-24 border-b border-[#D8D8D4] relative overflow-hidden">
        {/* Subtle architectural vertical grid guidelines */}
        <div className="absolute inset-0 pointer-events-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-4 opacity-30">
          <div className="border-r border-[#D8D8D4] h-full" />
          <div className="border-r border-[#D8D8D4] h-full" />
          <div className="border-r border-[#D8D8D4] h-full" />
          <div className="h-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF9857] animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-space text-[#787875] font-semibold">
              // PROGRAM KAMPANYE &amp; DISKON RESMI
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#2D2D2D] font-bebas leading-[0.92]">
            PENAWARAN &amp; PROMO SPESIAL STUDIO
          </h1>

          <p className="text-sm sm:text-base text-[#787875] max-w-2xl leading-relaxed font-sans">
            Dapatkan potongan harga langsung untuk pembuatan website bisnis, company profile, dan sistem digital Anda dengan kupon dan penawaran resmi Arvanta Studio.
          </p>
        </div>
      </section>

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Active Campaign Highlights */}
          {banners.length > 0 && (
            <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#2D2D2D] text-white p-8 sm:p-10 rounded-2xl border border-[#2D2D2D] relative overflow-hidden flex flex-col justify-between shadow-xl"
                >
                  <div className="space-y-3 relative z-10">
                    <span className="inline-block px-3 py-1 bg-[#FF9857] text-[#2D2D2D] text-[10px] font-space font-bold uppercase tracking-wider rounded-full">
                      {b.badge || "PROMO TERBATAS"}
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bebas font-bold text-white tracking-wide">
                      {b.title}
                    </h2>
                    {b.subtitle && (
                      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                        {b.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="pt-8 flex items-center justify-between relative z-10 border-t border-white/10 mt-6">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-space">
                      <Clock className="w-3.5 h-3.5 text-[#FF9857]" />
                      <span>Asia/Jakarta (WIB)</span>
                    </div>
                    <Link
                      href={b.targetUrl || "/order"}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#FF9857] text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-all cursor-pointer"
                    >
                      <span>Klaim Sekarang</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Voucher Coupons List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#D8D8D4] pb-4">
              <div>
                <span className="text-xs font-space uppercase tracking-widest text-[#787875] font-semibold block mb-1">
                  // VOUCHER CODE
                </span>
                <h3 className="text-2xl sm:text-3xl font-bebas font-bold text-[#2D2D2D]">
                  KUPON VOUCHER AKTIF
                </h3>
                <p className="text-xs text-[#787875]">
                  Gunakan kode voucher ini pada formulir pemesanan untuk potongan langsung.
                </p>
              </div>
              <span className="text-xs font-space text-[#787875] font-semibold uppercase bg-white px-3 py-1 rounded-full border border-[#D8D8D4]">
                {coupons.length} Kupon Aktif
              </span>
            </div>

            {coupons.length === 0 ? (
              <div className="p-12 text-center bg-white/80 border border-[#D8D8D4] rounded-2xl space-y-3">
                <Tag className="w-10 h-10 text-[#787875] mx-auto" />
                <h4 className="text-lg font-bebas font-bold text-[#2D2D2D]">Belum Ada Kupon Aktif</h4>
                <p className="text-xs text-[#787875] max-w-sm mx-auto font-sans">
                  Saat ini seluruh promo berjalan otomatis pada harga paket. Hubungi tim kami untuk penawaran khusus proyek skala besar.
                </p>
                <div className="pt-2">
                  <Link
                    href="/order"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-all"
                  >
                    <span>Mulai Pesan Website</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white/80 hover:bg-white border border-[#D8D8D4] hover:border-[#2D2D2D] p-7 rounded-2xl shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="px-3 py-1 bg-[#FF9857] text-[#2D2D2D] text-[10px] font-space font-bold uppercase rounded-full">
                          {c.discountType === "PERCENTAGE"
                            ? `Diskon ${c.discountValue}%`
                            : `Potongan Rp${c.discountValue.toLocaleString("id-ID")}`}
                        </span>
                        <span className="text-[10px] font-space text-[#787875]">
                          {c.usageLimit ? `Kuota: ${c.usageCount}/${c.usageLimit}` : "Kuota Terbuka"}
                        </span>
                      </div>

                      <div>
                        <div className="text-lg font-space font-bold tracking-wider text-[#2D2D2D] bg-[#EDECE8] p-3 rounded-xl border border-dashed border-[#D8D8D4] text-center select-all">
                          {c.code}
                        </div>
                        {c.minSpend > 0 && (
                          <span className="text-[11px] text-[#787875] block mt-2 font-sans">
                            Min. Transaksi: Rp{c.minSpend.toLocaleString("id-ID")}
                          </span>
                        )}
                        {c.maxDiscount && (
                          <span className="text-[11px] text-[#787875] block font-sans">
                            Maks. Potongan: Rp{c.maxDiscount.toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#D8D8D4] mt-6">
                      <Link
                        href={`/order?coupon=${c.code}`}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-all cursor-pointer"
                      >
                        <span>Gunakan Kode Ini ↗</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Terms info */}
          <div className="mt-16 p-6 sm:p-8 bg-white/80 border border-[#D8D8D4] rounded-2xl space-y-3">
            <h4 className="text-sm font-space font-bold uppercase tracking-wider text-[#2D2D2D] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF9857]" />
              <span>Ketentuan Penggunaan Kupon Promo</span>
            </h4>
            <ul className="text-xs text-[#787875] space-y-1.5 list-disc pl-5 font-sans">
              <li>Setiap kupon memiliki batas periode aktif dan kuota validasi langsung dari database server.</li>
              <li>Satu pesanan hanya dapat menggunakan satu kode voucher promo yang sah.</li>
              <li>Kupon tidak dapat diuangkan dan berlaku untuk paket pembuatan website di Arvanta Studio.</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
