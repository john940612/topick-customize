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

const title = "TOPICK | 訂製你的專屬香氣";
const description = "揀一支 Topick 香氣，調整濃度，並訂製瓶身標籤同禮盒。";
const shareImage = {
  url: "https://topick-customize.vercel.app/og-wechat-share.jpg?v=mascot",
  width: 1083,
  height: 1444,
  type: "image/jpeg",
  alt: title,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://topick-customize.vercel.app"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://topick-customize.vercel.app",
    siteName: "Topick",
    type: "website",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-Hant" className={`${sans.variable} ${serif.variable} ${display.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
