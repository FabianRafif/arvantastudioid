import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { Check, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Layanan Pembuatan Website & Sistem Digital | Arvanta Studio",
  description:
    "Daftar layanan pembuatan website, landing page, sistem kasir, POS, toko online, dan sistem kustom dari Arvanta Studio.",
};

export default async function ServicesPage() {
  const [categories, services] = await Promise.all([
    prisma.serviceCategory.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.service.findMany({
      where: { isActive: true },
      include: {
        category: true,
        packages: { where: { isActive: true }, orderBy: { price: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#EDECE8] text-[#2D2D2D] font-sans selection:bg-[#FF9857] selection:text-[#2D2D2D]">
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
              // KATALOG LAYANAN DIGITAL EKSKLUSIF
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#2D2D2D] font-bebas leading-[0.92]">
            CRAFTED WEBSITES &amp; DIGITAL SYSTEMS.
          </h1>

          <p className="text-sm sm:text-base text-[#787875] max-w-2xl leading-relaxed font-sans">
            Kami merancang solusi digital bernilai tinggi untuk bisnis, instansi, dan UMKM. Tanpa template murahan, setiap karya dirancang dengan presisi visual modern dan arsitektur kode Next.js 16 &amp; MySQL yang teruji.
          </p>
        </div>
      </section>

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Categories Overview */}
          <div className="space-y-3 bg-white/80 p-6 sm:p-8 rounded-2xl border border-[#D8D8D4] shadow-xs">
            <span className="text-xs uppercase tracking-wider text-[#787875] font-space font-semibold block">
              // KATEGORI SPESIALISASI:
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <span
                  key={c.id}
                  className="px-3.5 py-1.5 bg-[#EDECE8] border border-[#D8D8D4] text-xs font-space font-medium text-[#2D2D2D] rounded-full select-none"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          {/* Domain & Hosting Infrastructure Note */}
          <div className="p-6 bg-white border-l-4 border-l-[#FF9857] border border-[#D8D8D4] rounded-xl text-xs space-y-1 text-[#2D2D2D]">
            <strong className="block font-semibold font-space uppercase">
              Transparansi Domain &amp; Server Hosting:
            </strong>
            <p className="text-[#787875] leading-relaxed">
              Biaya jasa pengembangan website di bawah ini adalah investasi sistem. Domain (.com/.id) dan server hosting berkisar Rp500.000 – Rp700.000 per tahun, dibantu setup penuh atas kepemilikan Anda sendiri.
            </p>
          </div>

          {/* Services Grid */}
          <div className="space-y-8">
            <div className="border-b border-[#D8D8D4] pb-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-space uppercase text-[#787875] font-semibold block">
                  // DAFTAR LAYANAN
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#2D2D2D] font-bebas">
                  LAYANAN RESMI STUDIO
                </h2>
              </div>
              <span className="text-xs font-space font-semibold px-3 py-1 bg-white text-[#2D2D2D] border border-[#D8D8D4] rounded-full">
                {services.length} Layanan Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white/80 hover:bg-white border border-[#D8D8D4] hover:border-[#2D2D2D] p-8 rounded-2xl space-y-6 flex flex-col justify-between transition-all duration-300 shadow-xs"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs uppercase text-[#787875] font-space font-semibold tracking-wider block mb-1">
                          // {service.category.name}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] font-bebas">
                          {service.name}
                        </h3>
                      </div>
                      <span className="text-xs font-bold px-3.5 py-1 bg-[#FF9857] text-[#2D2D2D] rounded-full shrink-0 font-space uppercase tracking-wider">
                        Mulai Rp{service.priceFrom.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#787875] leading-relaxed font-sans">
                      {service.description}
                    </p>

                    {/* Features list */}
                    <div className="pt-3 border-t border-[#D8D8D4] space-y-2">
                      <span className="text-xs uppercase font-space font-semibold text-[#2D2D2D] block">
                        Spesifikasi yang Didapatkan:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#2D2D2D]">
                        {service.features
                          .split("\n")
                          .slice(0, 6)
                          .map((f: string, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-[#FF9857] shrink-0" />
                              <span className="line-clamp-1">{f.trim()}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Packages Preview */}
                    {service.packages.length > 0 && (
                      <div className="pt-3 border-t border-[#D8D8D4] space-y-2">
                        <span className="text-xs uppercase font-space font-semibold text-[#787875] block">
                          Pilihan Paket:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {service.packages.map((pkg: any) => (
                            <div
                              key={pkg.id}
                              className={`p-3 rounded-xl border text-xs ${
                                pkg.isPopular
                                  ? "bg-[#EDECE8] border-[#2D2D2D] font-bold text-[#2D2D2D]"
                                  : "bg-white border-[#D8D8D4] text-[#787875]"
                              }`}
                            >
                              <div className="font-semibold truncate">{pkg.name}</div>
                              <div className="text-[#2D2D2D] font-space text-[11px] font-bold mt-0.5">
                                Rp{pkg.price.toLocaleString("id-ID")}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#D8D8D4]">
                    <span className="text-xs text-[#787875] font-space">
                      Waktu: ~{service.deliveryDays} hari kerja • Revisi {service.revisionCount}x
                    </span>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link
                        href={`/services/${service.slug}`}
                        className="flex-1 sm:flex-none text-center px-4 py-2 border border-[#D8D8D4] hover:border-[#2D2D2D] text-[#2D2D2D] text-xs font-space font-semibold uppercase rounded-full transition-colors"
                      >
                        Detail
                      </Link>
                      <Link
                        href={`/order?service=${service.slug}`}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-all"
                      >
                        <span>Pesan</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
