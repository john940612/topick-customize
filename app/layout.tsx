import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

const serif = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-noto-serif",
  display: "swap",
});

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "訂製您的 Topick",
  description: "揀一支 Topick 香氣，調整濃度，並在標籤與禮盒的固定位置上訂製。前端示範，無需結帳。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${sans.variable} ${serif.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
