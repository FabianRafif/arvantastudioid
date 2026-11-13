import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({
    where: { slug },
  });

  if (!service) {
    return { title: "Layanan Tidak Ditemukan | Arvanta Studio" };
  }

  return {
    title: `${service.name} | Jasa Pembuatan Website Arvanta Studio`,
    description: service.description.slice(0, 160),
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;

  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      category: true,
      packages: {
        where: { isActive: true },
        orderBy: { price: "asc" },
      },
    },
  });

  if (!service) {
    notFound();
  }

  const featuresList = service.features
    ? service.features.split("\n").filter((f) => f.trim().length > 0)
    : [];

  return (
    <div className="min-h-screen bg-[#F5F2EB] flex flex-col text-deep-charcoal">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Category */}
          <div className="mb-8 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-deep-charcoal/60">
            <Link href="/" className="hover:text-deep-charcoal">Beranda</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-deep-charcoal">Layanan</Link>
            <span>/</span>
            <span className="text-muted-olive font-bold">{service.category.name}</span>
          </div>

          {/* Hero Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start border-b border-[#D9D7CF] pb-16 mb-16">
            <div className="lg:col-span-8 space-y-6">
              <span className="inline-block px-3 py-1 bg-muted-olive/15 text-muted-olive text-xs font-mono uppercase tracking-widest font-semibold rounded-xs">
                {service.category.name}
              </span>

              <h1 className="text-4xl sm:text-6xl font-display font-bold text-deep-charcoal tracking-tight leading-tight">
                {service.name}
              </h1>

              <p className="text-base sm:text-lg text-deep-charcoal/80 leading-relaxed max-w-3xl">
                {service.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-deep-charcoal/70">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-olive" />
                  <span>Estimasi: {service.deliveryDays} Hari Kerja</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-muted-olive" />
                  <span>Garansi Revisi: {service.revisionCount}x Putaran</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-muted-olive" />
                  <span>Garansi Pemeliharaan 30 Hari</span>
                </div>
              </div>
            </div>

            {/* Quick Price Summary Card */}
            <div className="lg:col-span-4 bg-white border border-[#D9D7CF] p-8 rounded-xs shadow-xs space-y-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-deep-charcoal/60 block mb-1">
                  Mulai Dari
                </span>
                <div className="text-3xl font-display font-bold text-deep-charcoal">
                  Rp{service.priceFrom.toLocaleString("id-ID")}
                </div>
                {service.priceTo && (
                  <span className="text-xs text-deep-charcoal/60 block mt-1">
                    Hingga Rp{service.priceTo.toLocaleString("id-ID")} (Tergantung Paket)
                  </span>
                )}
              </div>

              {service.domainHostingNote && (
                <div className="p-3 bg-[#F5F2EB] border border-[#D9D7CF] rounded-xs text-xs text-deep-charcoal/70 leading-relaxed font-mono">
                  {service.domainHostingNote}
                </div>
              )}

              <Link
                href={`/order?service=${service.slug}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-deep-charcoal text-warm-ivory text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-muted-olive transition-colors shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Pesan Layanan Ini</span>
              </Link>
            </div>
          </div>

          {/* Key Deliverables & Features */}
          <div className="mb-20 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
              Fitur & Keunggulan Spesifikasi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuresList.map((f, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#D9D7CF] p-5 rounded-xs flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-muted-olive shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-deep-charcoal font-medium">
                    {f}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Available Packages Comparison */}
          {service.packages.length > 0 && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#D9D7CF] pb-4">
                <div>
                  <span className="text-xs uppercase font-mono tracking-widest text-muted-olive font-semibold block mb-1">
                    Pilihan Tingkatan
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-deep-charcoal">
                    Paket Pembuatan yang Tersedia
                  </h2>
                </div>
                <span className="text-xs font-mono text-deep-charcoal/60">
                  Harga dinamis langsung tersinkronisasi dari database
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {service.packages.map((pkg) => {
                  let parsedFeatures: string[] = [];
                  try {
                    parsedFeatures = JSON.parse(pkg.features);
                  } catch {
                    parsedFeatures = pkg.features.split("\n").filter((x) => x.trim().length > 0);
                  }

                  return (
                    <div
                      key={pkg.id}
                      className={`bg-white border rounded-xs p-8 flex flex-col justify-between transition-all duration-200 ${
                        pkg.isPopular
                          ? "border-deep-charcoal shadow-md ring-1 ring-deep-charcoal"
                          : "border-[#D9D7CF] shadow-2xs hover:border-deep-charcoal"
                      }`}
                    >
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-display font-bold text-deep-charcoal">
                              {pkg.name}
                            </h3>
                            <p className="text-xs text-deep-charcoal/60 mt-1">
                              {pkg.description}
                            </p>
                          </div>
                          {pkg.isPopular && (
                            <span className="px-2.5 py-0.5 bg-muted-olive text-warm-ivory text-[10px] font-mono font-bold uppercase rounded-xs">
                              Populer
                            </span>
                          )}
                        </div>

                        <div className="border-t border-b border-[#D9D7CF]/60 py-4">
                          <span className="text-[10px] font-mono uppercase text-deep-charcoal/50 block">
                            Investasi Paket
                          </span>
                          <div className="text-2xl sm:text-3xl font-display font-black text-deep-charcoal">
                            Rp{pkg.price.toLocaleString("id-ID")}
                          </div>
                          <span className="text-[11px] text-muted-olive font-mono block mt-1">
                            Estimasi {pkg.deliveryDays} hari kerja • Revisi {pkg.revisions}x
                          </span>
                        </div>

                        <ul className="space-y-2.5 text-xs text-deep-charcoal/80">
                          {parsedFeatures.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-muted-olive shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-8 border-t border-[#D9D7CF]/60 mt-8">
                        <Link
                          href={`/order?service=${service.slug}&package=${pkg.slug}`}
                          className={`w-full inline-flex items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors ${
                            pkg.isPopular
                              ? "bg-deep-charcoal text-warm-ivory hover:bg-muted-olive"
                              : "border border-deep-charcoal text-deep-charcoal hover:bg-deep-charcoal hover:text-warm-ivory"
                          }`}
                        >
                          <span>Pilih Paket {pkg.name}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
