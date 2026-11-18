"use client";

import { concentrationBand } from "@/lib/concentration";
import type { CatalogProduct, DesignState } from "@/lib/types";

type Props = {
  product: CatalogProduct;
  design: DesignState;
  onBack: () => void;
};

export function SummaryPanel({ product, design, onBack }: Props) {
  const band = concentrationBand(design.concentration);
  const rows = [
    ["香氣", `${product.nameZh} · ${product.nameEn}`],
    ["價錢", `MOP ${product.priceMop} · ${product.volumeMl}ml`],
    ["濃度", `${band.zh} · ${band.en} · ${Math.round(design.concentration)}`],
    ["標籤名稱", design.labelName.trim() || "（未填）"],
    ["盒上名稱", design.boxName.trim() || "（未填）"],
    ["側板短句", design.sideTitle.trim() || "（未填）"],
    ["盒面", design.photo.source === "shop" ? design.photo.alt : `自行上傳 · ${design.photo.alt}`],
  ];

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">完成</p>
        <h2 className="mt-2 font-serif text-3xl">您的配方</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          三步都已看過。此為前端示範，不會落單，也不會連接付款。
        </p>
      </header>
      <dl className="divide-y divide-line border border-line">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[7rem_1fr] gap-3 px-4 py-3 text-sm">
            <dt className="text-muted">{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <button type="button" onClick={onBack} className="h-11 border border-ink px-5 text-sm">
        返回修改
      </button>
    </div>
  );
}
