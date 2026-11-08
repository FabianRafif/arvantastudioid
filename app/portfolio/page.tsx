import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { ArrowUpRight } from "lucide-react";

export const revalidate = 60;

export default async function PortfolioPage() {
  const portfolios = await prisma.portfolio.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-warm-ivory text-deep-charcoal">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs uppercase tracking-widest font-mono text-muted-olive font-bold">
              Portofolio & Arsip Proyek
            </span>
            <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-deep-charcoal editorial-title">
              Crafted Work with Purpose & Precision.
            </h1>
            <p className="text-sm sm:text-base text-deep-charcoal/80 leading-relaxed font-normal">
              Koleksi karya pembuatan website, identitas visual, branding, dan desain grafis yang kami bangun bersama klien dari berbagai skala bisnis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {portfolios.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#D9D7CF] rounded-xs overflow-hidden flex flex-col justify-between hover:border-deep-charcoal transition-all group"
              >
                <div className="h-72 bg-gradient-to-br from-warm-ivory to-[#D9D7CF]/70 p-8 flex flex-col justify-between border-b border-[#D9D7CF]">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-olive font-bold">
                    {item.category}
                  </span>
                  <div>
                    <span className="text-xs font-mono text-deep-charcoal/60 block mb-1">
                      Klien: {item.clientName || "Partner Arvanta"}
                    </span>
                    <h3 className="text-2xl font-display font-bold text-deep-charcoal">
                      {item.title}
                    </h3>
                  </div>
                </div>

                <div className="p-8 space-y-4">
                  <p className="text-xs text-deep-charcoal/75 leading-relaxed">
                    {item.description}
                  </p>

                  {item.techStack && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#D9D7CF]/60">
                      {item.techStack.split(",").map((tech, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-warm-ivory text-[10px] font-mono text-deep-charcoal rounded-xs border border-[#D9D7CF]"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-deep-charcoal/60">
                      Status: Live Production
                    </span>
                    <Link
                      href="/order"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-deep-charcoal hover:text-muted-olive transition-colors pb-0.5 border-b border-deep-charcoal"
                    >
                      <span>Buat Serupa</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
