import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import AnnouncementBar from "@/components/AnnouncementBar";
import MaintenanceGuard from "@/components/MaintenanceGuard";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
  preload: true,
});

const spaceGrotesk = Space_Grotesk({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  preload: true,
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arvantastudioid.vercel.app"),
  title: {
    template: "%s | Arvanta Studio",
    default: "Arvanta Studio — Branding & Digital System Agency",
  },
  description:
    "Arvanta Studio adalah digital agency penyedia jasa pembuatan website profesional, sistem digital, dan identitas branding untuk UMKM, korporat, startup, dan personal brand.",
  keywords: [
    "jasa pembuatan website",
    "web development indonesia",
    "graphic design studio",
    "branding identity",
    "website maintenance",
    "arvanta studio",
  ],
  authors: [{ name: "Arvanta Studio" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Arvanta Studio — Branding & Digital System Agency",
    description:
      "Digital agency penyedia jasa pembuatan website profesional, sistem digital terintegrasi, dan graphic design berkarakter.",
    url: "https://arvantastudioid.vercel.app",
    siteName: "Arvanta Studio",
    locale: "id_ID",
    type: "website",
  },
  verification: {
    google: "80T_mzwf3B65Qdwh5-rloJo3tx0c6aXulHw7CFA3fdE",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#FF9857",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let isMaintenance = false;
  let title = "Pemeliharaan Sistem Terjadwal";
  let message =
    "Kami sedang melakukan peningkatan infrastruktur server dan basis data untuk memberikan performa yang lebih optimal dan aman bagi seluruh klien Arvanta Studio.";
  let eta = "Segera kembali dalam waktu dekat";
  let isAdmin = false;

  try {
    const session = await getSessionUser();
    isAdmin = session?.role === "SUPER_ADMIN" || session?.role === "ADMIN";

    const settings = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: [
            "maintenance_mode",
            "maintenance_title",
            "maintenance_message",
            "maintenance_eta",
          ],
        },
      },
    });

    const map = new Map(settings.map((s) => [s.key, s.value]));
    isMaintenance = map.get("maintenance_mode") === "true";
    if (map.get("maintenance_title")) title = map.get("maintenance_title")!;
    if (map.get("maintenance_message")) message = map.get("maintenance_message")!;
    if (map.get("maintenance_eta")) eta = map.get("maintenance_eta")!;
  } catch {
    // Fail safe to allow website to render
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Arvanta Studio",
    alternateName: ["Arvanta", "Arvanta Studio ID"],
    url: "https://arvantastudioid.vercel.app",
    description:
      "Digital agency penyedia jasa pembuatan website profesional, sistem digital, dan identitas branding untuk UMKM dan korporat.",
    publisher: {
      "@type": "Organization",
      name: "Arvanta Studio",
      url: "https://arvantastudioid.vercel.app",
      logo: {
        "@type": "ImageObject",
        url: "https://arvantastudioid.vercel.app/images/arvanta-symbol-dark.png",
      },
    },
  };

  return (
    <html
      lang="id"
      className={`scroll-smooth ${bebasNeue.variable} ${spaceGrotesk.variable} ${inter.variable}`}
    >
      <head>
        <meta
          name="google-site-verification"
          content="80T_mzwf3B65Qdwh5-rloJo3tx0c6aXulHw7CFA3fdE"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#EDECE8] text-[#2D2D2D] font-sans antialiased selection:bg-[#FF9857] selection:text-[#2D2D2D]">
        <MaintenanceGuard
          initialIsMaintenance={isMaintenance}
          initialTitle={title}
          initialMessage={message}
          initialEta={eta}
          isAdmin={isAdmin}
        >
          <AnnouncementBar />
          {children}
        </MaintenanceGuard>
      </body>
    </html>
  );
}
