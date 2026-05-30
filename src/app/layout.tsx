import type { Metadata } from "next";
import { DM_Sans, Playfair_Display, JetBrains_Mono } from "next/font/google";
import { ToastContainer } from "@/components/ui/Toast";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KopiShop — Sistem Kasir Coffee Shop",
  description:
    "Sistem kasir modern untuk coffee shop. Input pesanan cepat, manajemen menu, laporan penjualan, dan loyalty pelanggan.",
  keywords: ["kasir", "coffee shop", "POS", "point of sale"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${dmSans.variable} ${playfair.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full font-sans antialiased bg-espresso-50 text-espresso-950">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
