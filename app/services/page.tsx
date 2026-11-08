import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { Check, ArrowUpRight, Palette, Code2, ShieldAlert } from "lucide-react";

export const revalidate = 60;

export default async function ServicesPage() {
  const [services, designCatalog, designCategories] = await Promise.all([
    prisma.service.findMany({
      where: { isActive: true },
      include: { packages: { where: { isActive: true } } },
    }),
    prisma.designCatalog.findMany({
      where: { isActive: true },
      include: { category: true },
    }),
    prisma.designCategory.findMany(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-warm-ivory text-deep-charcoal">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Header */}
          <div className="max-w-3xl space-y-4">
            <span className="text-xs uppercase tracking-widest font-mono text-muted-olive font-bold">
              Katalog Layanan Arvanta Studio
            </span>
            <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-deep-charcoal editorial-title">
              Crafted Websites & Graphic Design Systems.
            </h1>
            <p className="text-sm sm:text-base text-deep-charcoal/80 leading-relaxed font-normal">
              Kami merancang solusi digital bernilai tinggi untuk UMKM, korporat, startup, dan kreator. Tanpa template murahan, setiap karya dirancang dengan presisi visual dan kode yang bersih.
            </p>
          </div>

          {/* Section 1: Website Development Services */}
          <div id="website" className="space-y-8 scroll-mt-28">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D9D7CF] pb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-muted-olive font-bold uppercase mb-1">
                  <Code2 className="w-4 h-4" />
                  <span>Kategori 01</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-deep-charcoal">
                  Jasa Pembuatan Website Profesional
                </h2>
              </div>
              <div className="text-xs text-deep-charcoal/70 font-mono">
                Rentang Harga: Rp500.000 – Rp3.000.000
              </div>
            </div>

            {/* Domain Hosting Transparency Callout */}
            <div className="p-5 bg-white border-l-4 border-l-muted-olive border border-[#D9D7CF] rounded-xs text-xs space-y-1">
              <span className="font-bold text-deep-charcoal block">
                Catatan Transparansi Domain & Hosting:
              </span>
              <p className="text-deep-charcoal/80 leading-relaxed">
                Biaya jasa pembuatan website di bawah ini <strong>belum termasuk biaya domain dan cloud hosting</strong>. Estimasi biaya domain (.com / .id) dan server hosting berkisar <strong>Rp500.000 – Rp700.000 per tahun</strong>, dibayarkan terpisah sesuai spesifikasi dan kuota traffic yang Anda butuhkan.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white border border-[#D9D7CF] p-8 rounded-xs space-y-6 flex flex-col justify-between hover:border-deep-charcoal transition-colors"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl font-display font-bold text-deep-charcoal">
                        {service.name}
                      </h3>
                      <span className="text-xs font-mono px-2.5 py-1 bg-warm-ivory text-deep-charcoal border border-[#D9D7CF] rounded-xs font-bold">
                        Rp{service.priceFrom.toLocaleString("id-ID")} – Rp{service.priceTo.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <p className="text-xs text-deep-charcoal/75 leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features list */}
                    <div className="pt-2 border-t border-[#D9D7CF]/60 space-y-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-muted-olive font-bold block">
                        Fitur yang Didapatkan:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-deep-charcoal/80">
                        {service.features.split("\n").map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-muted-olive shrink-0" />
                            <span>{f.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Packages comparison if available */}
                    {service.packages.length > 0 && (
                      <div className="pt-3 border-t border-[#D9D7CF]/60 space-y-2">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-deep-charcoal/60 font-bold block">
                          Pilihan Paket:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {service.packages.map((pkg) => (
                            <div
                              key={pkg.id}
                              className={`p-3 rounded-xs border text-xs ${
                                pkg.isPopular
                                  ? "bg-warm-ivory border-deep-charcoal"
                                  : "bg-white border-[#D9D7CF]"
                              }`}
                            >
                              <div className="flex justify-between items-center font-bold text-deep-charcoal">
                                <span>{pkg.name}</span>
                                <span>Rp{pkg.price.toLocaleString("id-ID")}</span>
                              </div>
                              <span className="text-[10px] text-deep-charcoal/60 block mt-0.5">
                                {pkg.deliveryDays} hari kerja • Revisi {pkg.revisions}x
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-4 border-t border-[#D9D7CF]">
                    <span className="text-xs text-deep-charcoal/60 font-mono">
                      Waktu: ~{service.deliveryDays} hari kerja
                    </span>
                    <Link
                      href={`/order?service=WEBSITE&serviceId=${service.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider hover:bg-muted-olive transition-colors rounded-xs shadow-xs"
                    >
                      <span>Order Website Ini</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Graphic Design Services */}
          <div id="graphic-design" className="space-y-8 scroll-mt-28 pt-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#D9D7CF] pb-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-muted-olive font-bold uppercase mb-1">
                  <Palette className="w-4 h-4" />
                  <span>Kategori 02</span>
                </div>
                <h2 className="text-3xl font-display font-bold text-deep-charcoal">
                  Katalog Graphic Design (15 Kategori)
                </h2>
              </div>
              <div className="text-xs text-deep-charcoal/70 font-mono">
                Harga Mulai: Rp50.000 (Vector Ready)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {designCatalog.map((design) => (
                <div
                  key={design.id}
                  className="bg-white border border-[#D9D7CF] rounded-xs p-6 flex flex-col justify-between hover:border-deep-charcoal transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-olive font-bold">
                        {design.category.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-deep-charcoal bg-warm-ivory px-2 py-0.5 rounded-xs border border-[#D9D7CF]">
                        Mulai Rp{design.priceStarting.toLocaleString("id-ID")}
                      </span>
                    </div>

                    <h3 className="text-lg font-display font-bold text-deep-charcoal">
                      {design.name}
                    </h3>

                    <p className="text-xs text-deep-charcoal/70 leading-relaxed">
                      {design.description}
                    </p>

                    <div className="space-y-1.5 pt-2 text-[11px] text-deep-charcoal/80 font-mono">
                      <div>Format: {design.fileFormats}</div>
                      <div>Pengerjaan: {design.deliveryDays} hari • Revisi {design.revisions}x</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#D9D7CF]">
                    <Link
                      href={`/order?service=GRAPHIC_DESIGN&designId=${design.id}`}
                      className="w-full inline-flex items-center justify-between px-4 py-2.5 bg-warm-ivory text-deep-charcoal text-xs font-semibold uppercase tracking-wider hover:bg-deep-charcoal hover:text-warm-ivory transition-colors rounded-xs"
                    >
                      <span>Pesan Desain</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
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
