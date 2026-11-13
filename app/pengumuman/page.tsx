import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import AnnouncementsClientExplorer from "./AnnouncementsClientExplorer";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pusat Pengumuman & Berita Resmi | Arvanta Studio",
  description:
    "Informasi promo terbaru, penawaran khusus, layanan baru, perubahan tarif, serta jadwal operasional resmi Arvanta Studio.",
};

export default async function PengumumanPage() {
  const now = new Date();

  const announcements = await prisma.announcement.findMany({
    where: {
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
    orderBy: [
      { priority: "desc" },
      { publishDate: "desc" },
    ],
  });

  return (
    <div className="min-h-screen bg-[#EDECE8] text-[#2D2D2D] selection:bg-[#FF9857] selection:text-[#2D2D2D]">
      <AnnouncementBar />
      <Navbar />

      <main className="pt-28 sm:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header */}
          <div className="border-b border-[#D8D8D4] pb-8">
            <span className="text-xs uppercase tracking-widest font-space text-[#787875] font-semibold block mb-2">
              // ARVANTA OFFICIAL NOTICE
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-[#2D2D2D] font-bebas">
              PUSAT INFORMASI &amp; PENGUMUMAN RESMI
            </h1>
            <p className="text-xs sm:text-sm text-[#787875] max-w-2xl font-sans mt-2">
              Kanal rilis resmi studio seputar penawaran promo terbatas, rilis layanan digital &amp; desain grafis baru, kalender libur operasional, dan pembaruan sistem.
            </p>
          </div>

          <AnnouncementsClientExplorer initialItems={announcements as any} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
