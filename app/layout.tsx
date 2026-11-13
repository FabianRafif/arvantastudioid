import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
  openGraph: {
    title: "Arvanta Studio — Branding & Digital System Agency",
    description:
      "Digital agency penyedia jasa pembuatan website profesional, sistem digital terintegrasi, dan graphic design berkarakter.",
    url: "https://arvanta.studio",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <meta
          name="google-site-verification"
          content="80T_mzwf3B65Qdwh5-rloJo3tx0c6aXulHw7CFA3fdE"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#EDECE8] text-[#2D2D2D] font-sans antialiased selection:bg-[#FF9857] selection:text-[#2D2D2D]">
        {children}
      </body>
    </html>
  );
}
