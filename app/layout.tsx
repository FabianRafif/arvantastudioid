import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Arvanta Studio",
    default: "Arvanta Studio — Digital Experiences, Crafted with Purpose",
  },
  description:
    "Arvanta Studio adalah digital agency premium penyedia jasa pembuatan website profesional, website maintenance, dan graphic design untuk UMKM, korporat, startup, dan personal brand.",
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
    title: "Arvanta Studio — Digital Experiences, Crafted with Purpose",
    description:
      "Digital agency premium penyedia jasa pembuatan website profesional, website maintenance, dan graphic design.",
    url: "https://arvanta.studio",
    siteName: "Arvanta Studio",
    locale: "id_ID",
    type: "website",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#20211F",
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
    <html
      lang="id"
      className={`${jakartaSans.variable} ${spaceGrotesk.variable} scroll-smooth`}
    >
      <body className="min-h-screen flex flex-col bg-warm-ivory text-deep-charcoal font-sans selection:bg-deep-charcoal selection:text-warm-ivory">
        {children}
      </body>
    </html>
  );
}
