import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronRight, ArrowUpRight, MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pusat Bantuan & FAQ | Arvanta Studio",
  description:
    "Pertanyaan yang sering diajukan mengenai jasa pembuatan website, pembayaran, estimasi waktu, dan revisi di Arvanta Studio.",
};

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const defaultFaqs = [
    {
      id: "df-1",
      question: "Berapa lama proses pembuatan website di Arvanta Studio?",
      answer:
        "Waktu pengerjaan bergantung pada paket yang dipilih: Basic Website berkisar 3-5 hari kerja, Professional Website 5-10 hari kerja, dan Custom Enterprise System 14-25 hari kerja terhitung setelah materi dan pembayaran DP 50% terverifikasi.",
      category: "PENGERJAAN",
    },
    {
      id: "df-2",
      question: "Apakah harga pembuatan sudah termasuk domain dan hosting?",
      answer:
        "Biaya yang tercantum adalah jasa pengembangan sistem. Untuk nama domain (.com/.id) dan cloud hosting, kami membantu setup penuh ke akun atas nama Anda sendiri (berkisar Rp500.000 – Rp700.000/tahun) agar Anda memiliki kepemilikan aset digital 100%.",
      category: "BIAYA & PAKET",
    },
    {
      id: "df-3",
      question: "Bagaimana sistem pembayaran yang berlaku?",
      answer:
        "Kami menggunakan skema Down Payment (DP) 50% di awal sebelum pengerjaan dimulai, dan pelunasan 50% setelah website selesai diuji di server staging serta disetujui oleh Anda.",
      category: "PEMBAYARAN",
    },
    {
      id: "df-4",
      question: "Apakah website yang dibuat bisa saya edit sendiri kontennya?",
      answer:
        "Tentu. Kami menyediakan Content Management System (CMS) yang dirancang intuitif sehingga Anda dapat mengubah teks, foto produk, artikel, dan informasi kontak tanpa perlu memahami bahasa pemrograman.",
      category: "TEKNIS",
    },
    {
      id: "df-5",
      question: "Berapa kali batas revisi yang diberikan?",
      answer:
        "Paket Basic mencakup 2 kali putaran revisi minor, sedangkan paket Professional dan Premium mencakup hingga 3-5 kali putaran revisi sesuai ruang lingkup yang disepakati.",
      category: "REVISI",
    },
    {
      id: "df-6",
      question: "Apakah ada garansi setelah website diluncurkan?",
      answer:
        "Kami memberikan garansi pemeliharaan dan perbaikan bug selama 30 hari penuh sejak website resmi online tanpa biaya tambahan.",
      category: "GARANSI",
    },
  ];

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;

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
              // PUSAT BANTUAN &amp; FAQ
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-[#2D2D2D] font-bebas leading-[0.92]">
            PERTANYAAN YANG SERING DIAJUKAN
          </h1>

          <p className="text-sm sm:text-base text-[#787875] max-w-2xl leading-relaxed font-sans">
            Temukan jawaban lengkap mengenai alur pemesanan, teknis website, pembayaran, dan garansi layanan di Arvanta Studio.
          </p>
        </div>
      </section>

      <main className="flex-1 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* FAQ Accordions */}
          <div className="space-y-3">
            {displayFaqs.map((faq, idx) => (
              <details
                key={faq.id || idx}
                className="group bg-white/80 hover:bg-white border border-[#D8D8D4] hover:border-[#2D2D2D] rounded-xl p-6 [&_summary::-webkit-details-marker]:hidden cursor-pointer shadow-xs transition-colors"
              >
                <summary className="flex items-center justify-between font-semibold text-[#2D2D2D] text-sm sm:text-base select-none font-sans">
                  <span>{faq.question}</span>
                  <span className="w-8 h-8 rounded-full bg-[#EDECE8] group-open:bg-[#2D2D2D] text-[#2D2D2D] group-open:text-white flex items-center justify-center shrink-0 group-open:rotate-90 transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-[#787875] leading-relaxed pt-3 border-t border-[#D8D8D4] font-sans">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          {/* Help Banner */}
          <div className="p-8 sm:p-10 rounded-2xl bg-white/80 border border-[#D8D8D4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
            <div className="space-y-1">
              <span className="text-xs uppercase font-space font-semibold text-[#FF9857] block">
                // BUTUH BANTUAN TAMBAHAN?
              </span>
              <h3 className="text-2xl font-bebas font-bold text-[#2D2D2D]">
                TIM KAMI SIAP MENJAWAB PERTANYAAN ANDA
              </h3>
              <p className="text-xs text-[#787875] font-sans">
                Konsultasikan langsung kebutuhan spesifik Anda dengan tim teknis Arvanta Studio.
              </p>
            </div>
            <a
              href="https://wa.me/62895322465836"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#2D2D2D] hover:bg-[#FF9857] text-white hover:text-[#2D2D2D] text-xs font-semibold uppercase tracking-wider font-space rounded-full transition-all shrink-0 cursor-pointer shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
