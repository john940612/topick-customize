"use client";

import dynamic from "next/dynamic";
import { concentrationBand } from "@/lib/concentration";
import type { CatalogProduct, DesignState } from "@/lib/types";

const PackViewer = dynamic(() => import("@/components/PackViewer").then((mod) => mod.PackViewer), {
  ssr: false,
  loading: () => <div className="h-[68vh] min-h-[420px] w-full animate-pulse bg-[#ece7df]" />,
});

type Props = {
  product: CatalogProduct;
  design: DesignState;
};

export function ResultStep({ product, design }: Props) {
  const band = concentrationBand(design.concentration);
  const scent = product.seriesId === "wedding" ? product.nameEn : product.nameZh;

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">最後結果</p>
        <h2 className="mt-2 font-serif text-3xl">您的瓶子與禮盒</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          拖動可以旋轉。標籤、盒面圖片、盒上名稱同側板短句會貼上您剛訂的內容。此為示範，不會落單。
        </p>
      </header>
      <PackViewer design={design} />
      <section className="border border-line bg-ivory px-4 py-4 text-sm" aria-label="所選香氣">
        <p className="font-serif text-2xl">{scent}</p>
        <p className="mt-1 text-muted">
          {product.nameEn !== scent ? `${product.nameEn} · ` : ""}
          {band.zh} · {band.en}
        </p>
        <dl className="mt-3 space-y-1">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">前調</dt>
            <dd className="text-right">{product.notes.top.join(" · ")}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">中調</dt>
            <dd className="text-right">{product.notes.middle.join(" · ")}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">後調</dt>
            <dd className="text-right">{product.notes.base.join(" · ")}</dd>
          </div>
        </dl>
        {product.notesSource === "placeholder" ? (
          <p className="mt-3 text-muted">以上香調是示意，不是官網配方。</p>
        ) : null}
      </section>
    </div>
  );
}
