import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://apexbrews.com'),
  title: "APEX BREWS | Precision-Engineered F1 Coffee Experience",
  description: "Experience the world's most high-performance coffee. Telemetry-driven brewing, F1 Race Academy, and paddock-inspired aesthetics.",
  keywords: ["F1 coffee", "Apex Brews", "Race Academy", "Formula 1 cafe", "specialty coffee"],
  authors: [{ name: "Apex Brews Team" }],
  openGraph: {
    title: "APEX BREWS | The Paddock Experience",
    description: "Brewed for speed. Engineered for champions.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        alt: "Apex Brews F1 Experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "APEX BREWS F1 Experience",
    description: "Precision in every drop. Join the Race Academy.",
    images: ["/og-preview.png"],
  },
};

import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";
import TracksideSoundController from "@/components/TracksideSoundController";
import EcosystemHeader from "@/components/EcosystemHeader";
import { CursorGlow } from "@/components/CursorGlow";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-carbon-black text-white font-sans overflow-x-hidden">
        <Providers>
          <LoadingScreen />
          <EcosystemHeader />
          <Navbar />
          <CursorGlow />
          <div className="flex-1">
            {children}
          </div>
          {/* Site-wide persistent audio layer controller module */}
          <TracksideSoundController />
          <Footer />
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}
