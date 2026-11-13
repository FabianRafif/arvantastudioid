import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import { prisma } from "@/lib/prisma";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Tag,
  Shield,
  Eye,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  PROMO: "Promo & Diskon",
  LAYANAN: "Layanan Baru",
  HARGA: "Pembaruan Tarif",
  OPERASIONAL: "Libur & Jadwal",
  MAINTENANCE: "Pemeliharaan Sistem",
  INFO_PENTING: "Informasi Penting",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await prisma.announcement.findUnique({
    where: { slug },
  });

  if (!item) {
    return { title: "Pengumuman Tidak Ditemukan | Arvanta Studio" };
  }

  return {
    title: `${item.title} | Pengumuman Arvanta Studio`,
    description: item.summary || item.title,
  };
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const now = new Date();

  const item = await prisma.announcement.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      isActive: true,
      publishDate: { lte: now },
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ],
    },
  });

  if (!item) {
    notFound();
  }

  // Increment views
  try {
    await prisma.announcement.update({
      where: { id: item.id },
      data: { views: { increment: 1 } },
    });
  } catch {}

  const dateStr = new Date(item.publishDate).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const endDateStr = item.endDate
    ? new Date(item.endDate).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const isUrgent = item.priority === "URGENT";
  const isPenting = item.priority === "PENTING";
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

  return (
    <div className="min-h-screen bg-[#EDECE8] text-[#2D2D2D] selection:bg-[#FF9857] selection:text-[#2D2D2D]">
      <AnnouncementBar />
      <Navbar />

      <main className="pt-28 sm:pt-36 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Back link */}
          <Link
            href="/pengumuman"
            className="inline-flex items-center gap-2 text-xs font-space font-semibold uppercase tracking-wider text-[#787875] hover:text-[#2D2D2D] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Semua Pengumuman</span>
          </Link>

          {/* Main Card */}
          <article className="bg-white border border-[#D8D8D4] rounded-3xl p-6 sm:p-10 lg:p-12 shadow-sm space-y-8">
            {/* Header meta */}
            <div className="space-y-4 border-b border-[#D8D8D4] pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-space font-bold uppercase tracking-wider bg-[#EDECE8] text-[#2D2D2D] border border-[#D8D8D4]">
                  {categoryLabel}
                </span>

                {(isUrgent || isPenting) && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-space font-bold uppercase tracking-wider ${
                      isUrgent
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    Prioritas: {item.priority}
                  </span>
                )}

                <span className="text-xs text-[#787875] font-space ml-auto flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{item.views + 1} Pembaca</span>
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-bebas text-[#2D2D2D] tracking-wide leading-tight">
                {item.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-space text-[#787875] pt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FF9857]" />
                  <span>Diterbitkan: {dateStr}</span>
                </span>

                {endDateStr && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Berlaku hingga: {endDateStr}</span>
                  </span>
                )}

                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-muted-olive" />
                  <span>Oleh: {item.authorName || "Tim Arvanta Studio"}</span>
                </span>
              </div>
            </div>

            {/* Thumbnail Image if available */}
            {item.imageUrl && (
              <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-[#2D2D2D] border border-[#D8D8D4] shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            {/* Excerpt / Summary Box */}
            {item.summary && (
              <div className="p-5 bg-[#EDECE8]/60 border-l-4 border-l-[#FF9857] border border-[#D8D8D4] rounded-xl text-xs sm:text-sm font-sans text-[#2D2D2D] leading-relaxed">
                <strong className="block font-space uppercase tracking-wider text-[11px] text-[#787875] mb-1">
                  Ringkasan Informasi:
                </strong>
                {item.summary}
              </div>
            )}

            {/* Rich Content Area */}
            <div className="prose prose-neutral max-w-none text-sm sm:text-base leading-relaxed text-[#2D2D2D] space-y-4 pt-2 whitespace-pre-wrap font-sans">
              {item.content}
            </div>

            {/* Call to action & footer */}
            <div className="pt-8 border-t border-[#D8D8D4] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[#787875] font-space text-center sm:text-left">
                Ada pertanyaan mengenai pengumuman ini?
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="https://wa.me/62895322465836"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-xs font-space font-bold uppercase tracking-wider transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat Admin Studio</span>
                </a>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
