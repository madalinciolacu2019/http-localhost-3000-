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
  title: "APEX BREWS | Precision-Engineered Motorsport Coffee",
  description: "Experience the world's most advanced coffee roastery. Telemetry-driven, precision-roasted beans for maximum performance.",
  keywords: ["motorsport coffee", "Apex Brews", "specialty coffee", "racing coffee", "telemetry roasting"],
  authors: [{ name: "Apex Brews Team" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ApexBrews",
  },
  formatDetection: {
    telephone: false,
  },
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
        alt: "Apex Brews Racing Experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "APEX BREWS Racing Experience",
    description: "Precision in every drop. Join the Racing Experience.",
    images: ["/og-preview.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import CookieBanner from "@/components/CookieBanner";
import DemoWarningBanner from "@/components/DemoWarningBanner";
import Footer from "@/components/Footer";
import F1Loader from "@/components/F1Loader";

import EcosystemHeader from "@/components/EcosystemHeader";
import { CursorGlow } from "@/components/CursorGlow";
import LiveTimingTower from "@/components/LiveTimingTower";
import { GoogleAnalytics } from '@next/third-parties/google';

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
        <F1Loader />
        <Providers>
          <LoadingScreen />
          <EcosystemHeader />
          <Navbar />
          <CursorGlow />
          <LiveTimingTower />
          <div className="flex-1">
            {children}
          </div>
          {/* Site-wide persistent audio layer controller module */}

          <Footer />
          <CookieBanner />
          <DemoWarningBanner />
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
        </Providers>
      </body>
    </html>
  );
}
