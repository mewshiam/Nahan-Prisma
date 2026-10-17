import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nahan-Prisma — the concealed gateway, on Prisma Compute",
  description:
    "Nahan ported from Cloudflare Workers to Prisma Compute's Bun runtime. VLESS + Trojan tunnels, D1 → SQLite, cloudflare:sockets → Bun.connect, one-command deploy.",
  keywords: [
    "Nahan",
    "Prisma Compute",
    "Bun",
    "VLESS",
    "Trojan",
    "gateway",
    "port",
    "Cloudflare Workers",
  ],
  authors: [{ name: "mewshiam" }],
  openGraph: {
    title: "Nahan-Prisma",
    description:
      "The Nahan gateway, ported from Cloudflare Workers to Prisma Compute.",
    siteName: "Nahan-Prisma",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
