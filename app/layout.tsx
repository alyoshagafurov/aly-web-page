import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import SmoothScroll from "@/components/providers/SmoothScroll";
import { LanguageProvider } from "@/lib/i18n";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "aly — your money, ideas & goals, in focus",
  description:
    "aly is the calm, beautiful home for everything that moves your life forward. Track money, capture ideas, hit goals.",
  metadataBase: new URL("https://aly.app"),
  openGraph: {
    title: "aly",
    description: "Your money, ideas & goals — in focus.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="grain antialiased">
        <LanguageProvider>
          <SmoothScroll>
            <Nav />
            <main>{children}</main>
            <Footer />
          </SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
