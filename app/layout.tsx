import type { Metadata } from "next";
import { Geist } from "next/font/google";

import SessionProvider from "@/components/providers/SessionProvider";

import { Toaster } from "sonner";

import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "BuyBio - 바이오 투자 플랫폼",
  description: "AI 기반 바이오 투자 추천 플랫폼",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.className} antialiased`}>
        <SessionProvider>
          {children}
          <Toaster position="top-center" richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
