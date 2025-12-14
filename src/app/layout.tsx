import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // ← ★★★この行が絶対に必要です！！！★★★

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "推し活TRPG",
  description: "Aventurine's Fan Activity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
