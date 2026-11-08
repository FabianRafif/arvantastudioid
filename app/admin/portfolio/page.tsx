import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FolderGit2, Plus, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const portfolios = await prisma.portfolio.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9D7CF] pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-deep-charcoal">
            Portofolio & Project Showcase
          </h1>
          <p className="text-xs text-deep-charcoal/60 font-mono">
            Koleksi karya unggulan yang ditampilkan pada halaman publik website Arvanta Studio.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {portfolios.map((p) => (
          <div
            key={p.id}
            className="p-6 bg-white border border-[#D9D7CF] rounded-xs space-y-3 shadow-xs"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-olive font-bold">
                {p.category}
              </span>
              <span className="text-xs font-mono text-deep-charcoal/60">
                Klien: {p.clientName || "-"}
              </span>
            </div>

            <h3 className="text-xl font-display font-bold text-deep-charcoal">
              {p.title}
            </h3>

            <p className="text-xs text-deep-charcoal/70 leading-relaxed line-clamp-2">
              {p.description}
            </p>

            {p.techStack && (
              <div className="pt-2 flex flex-wrap gap-1.5 font-mono text-[10px]">
                {p.techStack.split(",").map((tech, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-warm-ivory text-deep-charcoal border border-[#D9D7CF] rounded-xs"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
