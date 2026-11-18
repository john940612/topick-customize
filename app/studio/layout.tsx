import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "工坊檢視 | TOPICK",
  robots: { index: false, follow: false },
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto min-h-full max-w-5xl px-4 py-8 md:px-8">{children}</div>;
}
