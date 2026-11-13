"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Check,
  ArrowUpRight,
  Sparkles,
  Palette,
  Globe,
  Search,
  MessageCircle,
  Layers,
  Smartphone,
  FileText,
  Package,
  SlidersHorizontal,
} from "lucide-react";

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  isPopular?: boolean;
}

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceFrom: number;
  deliveryDays: number;
  revisionCount: number;
  features: string;
  category: { id: string; name: string };
  packages: ServicePackage[];
}

export interface DesignItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceStarting: number;
  deliveryDays: number;
  revisions: number;
  fileFormats: string;
  isFeatured?: boolean;
  category?: { id: string; name: string };
}

interface ServicesExplorerProps {
  initialServices: ServiceItem[];
  initialDesignItems: DesignItem[];
  serviceCategories: { id: string; name: string }[];
  designCategories: { id: string; name: string }[];
}

function ServicesExplorerInner({
  initialServices,
  initialDesignItems,
  serviceCategories,
  designCategories,
}: ServicesExplorerProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const catParam = searchParams.get("category");

  // Main Tab: 'all' | 'website' | 'design'
  const [activeTab, setActiveTab] = useState<"all" | "website" | "design">("all");
  const [designSubCategory, setDesignSubCategory] = useState<string>("all");
  const [websiteSubCategory, setWebsiteSubCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Auto-switch tab and scroll when URL contains tab=design, category=design, or #design-catalog
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";

    if (
      tabParam === "design" ||
      catParam === "design" ||
      hash === "#design-catalog"
    ) {
      setActiveTab("design");
      setTimeout(() => {
        const el = document.getElementById("design-catalog");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    } else if (
      tabParam === "website" ||
      catParam === "website" ||
      hash === "#website-services"
    ) {
      setActiveTab("website");
      setTimeout(() => {
        const el = document.getElementById("website-services");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    }
  }, [tabParam, catParam]);

  // Listen to hash change dynamically
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === "#design-catalog") {
        setActiveTab("design");
        const el = document.getElementById("design-catalog");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (window.location.hash === "#website-services") {
        setActiveTab("website");
        const el = document.getElementById("website-services");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Filtered Website Services
  const filteredWebsites = useMemo(() => {
    return initialServices.filter((s) => {
      const matchCat =
        websiteSubCategory === "all" || s.category?.name === websiteSubCategory;
      const matchSearch =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [initialServices, websiteSubCategory, searchQuery]);

  // Filtered Design Items
  const filteredDesigns = useMemo(() => {
    return initialDesignItems.filter((d) => {
      const catName = d.category?.name || "";
      const matchCat =
        designSubCategory === "all" || catName === designSubCategory;
      const matchSearch =
        !searchQuery.trim() ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        catName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.fileFormats.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [initialDesignItems, designSubCategory, searchQuery]);

  return (
    <div className="space-y-12">
      {/* ========================================================= */}
      {/* TOP CONTROLS: MAIN TABS & SEARCH BAR */}
      {/* ========================================================= */}
      <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-[#D8D8D4] shadow-xs space-y-5 sticky top-20 z-30 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Main Segmented Switcher */}
          <div className="inline-flex p-1.5 bg-[#EDECE8] rounded-full border border-[#D8D8D4] overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => {
                setActiveTab("all");
              }}
              className={`px-4 sm:px-6 py-2 rounded-full text-xs font-space font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-[#2D2D2D] text-white shadow-xs"
                  : "text-[#787875] hover:text-[#2D2D2D]"
              }`}
            >
              Semua Layanan ({initialServices.length + initialDesignItems.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("website");
                const el = document.getElementById("website-services");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className={`flex items-center gap-1.5 px-4 sm:px-6 py-2 rounded-full text-xs font-space font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === "website"
                  ? "bg-[#2D2D2D] text-white shadow-xs"
                  : "text-[#787875] hover:text-[#2D2D2D]"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#FF9857]" />
              <span>Website &amp; Sistem ({initialServices.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("design");
                const el = document.getElementById("design-catalog");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className={`flex items-center gap-1.5 px-4 sm:px-6 py-2 rounded-full text-xs font-space font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === "design"
                  ? "bg-[#2D2D2D] text-white shadow-xs"
                  : "text-[#787875] hover:text-[#2D2D2D]"
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-[#FF9857]" />
              <span>Desain Grafis &amp; Brand ({initialDesignItems.length})</span>
            </button>
          </div>

          {/* Quick Search Field */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#787875] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari layanan (e.g. Logo, Toko Online)..."
              className="w-full pl-9 pr-4 py-2 bg-[#EDECE8] border border-[#D8D8D4] focus:border-[#2D2D2D] focus:bg-white rounded-full text-xs font-sans text-[#2D2D2D] outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#787875] hover:text-[#2D2D2D]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Category Sub-filters */}
        {activeTab === "website" && (
          <div className="pt-2 border-t border-[#D8D8D4]/60 flex items-center gap-2 overflow-x-auto text-xs font-space">
            <span className="text-[#787875] font-semibold uppercase tracking-wider shrink-0 text-[11px]">
              Kategori:
            </span>
            <button
              type="button"
              onClick={() => setWebsiteSubCategory("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                websiteSubCategory === "all"
                  ? "bg-[#FF9857] text-[#2D2D2D] font-bold"
                  : "bg-[#EDECE8] text-[#2D2D2D] hover:bg-[#D8D8D4]"
              }`}
            >
              Semua
            </button>
            {serviceCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setWebsiteSubCategory(c.name)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                  websiteSubCategory === c.name
                    ? "bg-[#FF9857] text-[#2D2D2D] font-bold"
                    : "bg-[#EDECE8] text-[#2D2D2D] hover:bg-[#D8D8D4]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {activeTab === "design" && (
          <div className="pt-2 border-t border-[#D8D8D4]/60 flex items-center gap-2 overflow-x-auto text-xs font-space">
            <span className="text-[#787875] font-semibold uppercase tracking-wider shrink-0 text-[11px]">
              Kategori Desain:
            </span>
            <button
              type="button"
              onClick={() => setDesignSubCategory("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                designSubCategory === "all"
                  ? "bg-[#FF9857] text-[#2D2D2D] font-bold"
                  : "bg-[#EDECE8] text-[#2D2D2D] hover:bg-[#D8D8D4]"
              }`}
            >
              Semua ({initialDesignItems.length})
            </button>
            {designCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setDesignSubCategory(c.name)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                  designSubCategory === c.name
                    ? "bg-[#FF9857] text-[#2D2D2D] font-bold"
                    : "bg-[#EDECE8] text-[#2D2D2D] hover:bg-[#D8D8D4]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: WEBSITE & SISTEM DIGITAL */}
      {/* ========================================================= */}
      {(activeTab === "all" || activeTab === "website") && (
        <section id="website-services" className="scroll-mt-36 space-y-8">
          <div className="border-b border-[#D8D8D4] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-space uppercase text-[#787875] font-semibold block mb-1">
                // 01 · PENGEMBANGAN WEBSITE &amp; SISTEM
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold text-[#2D2D2D] font-bebas tracking-wide">
                WEBSITE DEVELOPMENT &amp; SISTEM DIGITAL
              </h2>
              <p className="text-xs sm:text-sm text-[#787875] font-sans mt-1">
                Arsitektur Next.js 16 modern, performa tinggi, responsif, dan teroptimasi SEO mesin pencari.
              </p>
            </div>
            <span className="text-xs font-space font-semibold px-3.5 py-1 bg-white text-[#2D2D2D] border border-[#D8D8D4] rounded-full shrink-0 self-start sm:self-auto">
              {filteredWebsites.length} Layanan Ditemukan
            </span>
          </div>

          {/* Domain & Hosting Infrastructure Notice */}
          <div className="p-5 bg-white border-l-4 border-l-[#FF9857] border border-[#D8D8D4] rounded-xl text-xs space-y-1 text-[#2D2D2D]">
            <strong className="block font-semibold font-space uppercase tracking-wider">
              Transparansi Biaya Domain &amp; Hosting:
            </strong>
            <p className="text-[#787875] leading-relaxed">
              Biaya pembuatan di bawah ini adalah murni investasi pengembangan sistem &amp; desain. Untuk domain (.com/.id) dan server hosting berkisar Rp500.000 – Rp700.000/tahun dibantu setup 100% atas kepemilikan Anda sendiri.
            </p>
          </div>

          {filteredWebsites.length === 0 ? (
            <div className="p-12 text-center bg-white/60 rounded-2xl border border-[#D8D8D4] space-y-3">
              <p className="text-sm font-space text-[#787875]">
                Tidak ada layanan website yang cocok dengan pencarian &quot;{searchQuery}&quot;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setWebsiteSubCategory("all");
                }}
                className="text-xs font-space font-semibold text-[#FF9857] hover:underline"
              >
                Reset Filter Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredWebsites.map((service) => (
                <div
                  key={service.id}
                  className="bg-white/80 hover:bg-white border border-[#D8D8D4] hover:border-[#2D2D2D] p-8 rounded-2xl space-y-6 flex flex-col justify-between transition-all duration-300 shadow-xs group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs uppercase text-[#787875] font-space font-semibold tracking-wider block mb-1">
                          // {service.category?.name || "Digital Solutions"}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] font-bebas group-hover:text-[#FF9857] transition-colors">
                          {service.name}
                        </h3>
                      </div>
                      <span className="text-xs font-bold px-3.5 py-1 bg-[#FF9857] text-[#2D2D2D] rounded-full shrink-0 font-space uppercase tracking-wider shadow-2xs">
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
                    {service.packages && service.packages.length > 0 && (
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
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: DESAIN GRAFIS & BRAND IDENTITY (Anchor target) */}
      {/* ========================================================= */}
      {(activeTab === "all" || activeTab === "design") && (
        <section
          id="design-catalog"
          className="scroll-mt-36 space-y-8 pt-8 border-t border-[#D8D8D4]"
        >
          <div className="border-b border-[#D8D8D4] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <span className="text-xs font-space uppercase text-[#787875] font-semibold block mb-1">
                // 02 · KATALOG DESAIN GRAFIS &amp; BRAND IDENTITY
              </span>
              <h2 className="text-3xl sm:text-5xl font-bold text-[#2D2D2D] font-bebas tracking-wide">
                VISUAL IDENTITY &amp; GRAPHIC DESIGN STUDIO
              </h2>
              <p className="text-xs sm:text-sm text-[#787875] font-sans mt-1 max-w-2xl">
                14+ Kategori aset visual profesional: Desain logo orisinal, panduan brand guideline, kemasan produk, brosur, banner digital, hingga konten feed media sosial siap tayang.
              </p>
            </div>
            <span className="text-xs font-space font-semibold px-3.5 py-1 bg-white text-[#2D2D2D] border border-[#D8D8D4] rounded-full shrink-0 self-start sm:self-auto">
              {filteredDesigns.length} Layanan Desain
            </span>
          </div>

          {filteredDesigns.length === 0 ? (
            <div className="p-12 text-center bg-white/60 rounded-2xl border border-[#D8D8D4] space-y-3">
              <p className="text-sm font-space text-[#787875]">
                Tidak ada layanan desain yang cocok dengan pencarian &quot;{searchQuery}&quot;.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setDesignSubCategory("all");
                }}
                className="text-xs font-space font-semibold text-[#FF9857] hover:underline"
              >
                Reset Filter Pencarian
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDesigns.map((item) => {
                const catName = item.category?.name || "Desain Grafis";
                return (
                  <div
                    key={item.id}
                    className="bg-white/80 hover:bg-white border border-[#D8D8D4] hover:border-[#2D2D2D] p-6 sm:p-7 rounded-2xl space-y-5 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-md group"
                  >
                    <div className="space-y-4">
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EDECE8] border border-[#D8D8D4] text-[#2D2D2D] text-[11px] font-space font-semibold uppercase tracking-wider rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF9857]" />
                          <span>{catName}</span>
                        </span>
                        <span className="text-xs font-bold px-3 py-1 bg-[#FF9857] text-[#2D2D2D] font-space rounded-full uppercase tracking-wider shadow-2xs">
                          Mulai Rp{item.priceStarting.toLocaleString("id-ID")}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-[#2D2D2D] font-bebas tracking-wide group-hover:text-[#FF9857] transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-[#787875] font-sans leading-relaxed mt-2 line-clamp-3">
                          {item.description}
                        </p>
                      </div>

                      {/* Technical Specs Box */}
                      <div className="bg-[#EDECE8]/60 p-3.5 rounded-xl border border-[#D8D8D4]/60 space-y-1.5 text-xs font-space text-[#2D2D2D]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#787875]">Format File:</span>
                          <span className="font-semibold text-right truncate max-w-[170px]" title={item.fileFormats}>
                            {item.fileFormats}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#787875]">Pengerjaan &amp; Revisi:</span>
                          <span className="font-semibold">
                            ~{item.deliveryDays} hari • {item.revisions}x revisi
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="pt-4 border-t border-[#D8D8D4] space-y-2">
                      <Link
                        href={`/order?service=GRAPHIC_DESIGN&designId=${item.id}&catalog=${item.slug}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-all shadow-xs"
                      >
                        <span>Pesan Desain</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>

                      <a
                        href={`https://wa.me/6281234567890?text=${encodeURIComponent(
                          `Halo Arvanta Studio, saya ingin konsultasi pemesanan layanan desain: ${item.name}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-[#D8D8D4] hover:border-[#2D2D2D] hover:bg-white text-[#787875] hover:text-[#2D2D2D] text-[11px] font-space font-medium rounded-full transition-colors"
                      >
                        <MessageCircle className="w-3 h-3 text-[#25D366]" />
                        <span>Konsultasi WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default function ServicesExplorer(props: ServicesExplorerProps) {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs font-space text-[#787875]">
          Memuat katalog layanan Arvanta Studio...
        </div>
      }
    >
      <ServicesExplorerInner {...props} />
    </Suspense>
  );
}
