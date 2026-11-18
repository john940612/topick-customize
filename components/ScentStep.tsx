"use client";

import { useEffect, useRef } from "react";
import { noteEmphasis } from "@/lib/concentration";
import type { Catalog, CatalogProduct } from "@/lib/types";

const SCENT_PACKSHOT: Record<string, { src: string; alt: string }> = {
  "chill-kid": { src: "/products/chill-kid.jpg", alt: "擺爛仔禮盒" },
  "fruity-buddy": { src: "/products/fruity-buddy.jpg", alt: "水果巴打禮盒" },
  "tea-thinker": { src: "/products/tea-thinker.jpg", alt: "茶多酚禮盒" },
  "wood-roll": { src: "/products/wood-roll.jpg", alt: "棬木一族禮盒" },
  "aqua-chl": { src: "/products/aqua-chl.jpg", alt: "AQUA.CHL禮盒" },
};

type Props = {
  catalog: Catalog;
  product: CatalogProduct;
  /** Set only after the customer taps a scent. Notes stay hidden until then. */
  chosenId: string | null;
  concentration: number;
  onProduct: (id: string) => void;
  onConcentration: (value: number) => void;
};

export function ScentStep({
  catalog,
  product,
  chosenId,
  concentration,
  onProduct,
  onConcentration,
}: Props) {
  const emphasis = noteEmphasis(concentration);
  const percent = `${Math.round(concentration)}%`;
  const chosenRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const node = chosenRef.current;
    if (!chosenId || !node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  }, [chosenId]);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">第一步</p>
        <h2 className="mt-2 font-serif text-3xl text-ink">選擇香氣系列</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          點選一支香，前調、中調與後調會出現在名稱下面。濃度會帶到下一步的預覽。
        </p>
      </header>

      <div className="space-y-8">
        {catalog.series
          .filter((series) => series.id !== "wuxing")
          .map((series) => {
            const scents = catalog.products.filter((item) => item.seriesId === series.id);
            if (scents.length === 0) return null;
            return (
              <section key={series.id} aria-labelledby={`series-${series.id}`} className="space-y-3">
                <h3 id={`series-${series.id}`} className="font-serif text-2xl">
                  {series.nameZh}
                </h3>
                <ul className="border border-line bg-ivory">
                  {scents.map((item) => {
                    const selected = item.id === chosenId;
                    const label = scentLabel(item);
                    const secondary = item.seriesId === "wedding" || item.nameEn === label ? null : item.nameEn;
                    return (
                      <li
                        key={item.id}
                        ref={selected ? chosenRef : undefined}
                        className="scroll-my-4 border-b border-line last:border-b-0"
                      >
                        <button
                          type="button"
                          aria-pressed={selected}
                          aria-expanded={selected}
                          onClick={() => onProduct(item.id)}
                          className={`flex w-full items-baseline gap-3 px-4 py-3 text-left transition ${selected ? "bg-ink text-ivory" : "hover:bg-paper"}`}
                        >
                          <span className="font-serif text-xl">{label}</span>
                          {secondary ? (
                            <span className={`text-sm tracking-[0.08em] ${selected ? "text-ivory/70" : "text-muted"}`}>
                              {secondary}
                            </span>
                          ) : null}
                        </button>
                        {selected ? (
                          <section className="border-t border-line bg-paper px-4 py-4" aria-live="polite">
                            <p className="text-sm leading-relaxed">{product.tagline}</p>
                            {SCENT_PACKSHOT[item.id] ? (
                              <div className="mt-3 flex h-52 items-center justify-center bg-ivory">
                                <img
                                  src={SCENT_PACKSHOT[item.id].src}
                                  alt={SCENT_PACKSHOT[item.id].alt}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                            ) : null}
                            {product.notesSource === "placeholder" ? (
                              <p className="mt-3 border border-gold bg-ivory px-3 py-2 text-sm">
                                官網這頁未列出香調。下面是示意香調，不是官方配方。
                              </p>
                            ) : null}
                            <dl className="mt-3 space-y-3">
                              <NoteRow label="前調" notes={product.notes.top} english={product.notes.topEn} weight={emphasis.top} />
                              <NoteRow label="中調" notes={product.notes.middle} english={product.notes.middleEn} weight={emphasis.middle} />
                              <NoteRow label="後調" notes={product.notes.base} english={product.notes.baseEn} weight={emphasis.base} />
                            </dl>
                          </section>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
      </div>

      {!chosenId ? <p className="text-sm text-muted">尚未選擇。點一下名稱即可看香調。</p> : null}

      <section>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-serif text-2xl">濃度</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
              100% 代表原本產品的香味。如果想超過原本的香味，可另外再找我們調香師製作。
            </p>
          </div>
          <p className="shrink-0 font-display text-3xl leading-none tabular-nums">{percent}</p>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className="relative h-20 w-9 shrink-0 rounded-b-full rounded-t-lg border border-ink/30" aria-hidden="true">
            <div
              className="absolute inset-x-0 bottom-0 rounded-b-full bg-gold"
              style={{ height: `${10 + concentration * 0.86}%` }}
            />
          </div>
          <label className="block flex-1">
            <span className="mb-2 flex justify-between text-xs tracking-[0.16em] text-muted uppercase">
              <span>清淡</span>
              <span>濃郁</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={concentration}
              aria-valuetext={percent}
              onChange={(event) => onConcentration(Number(event.target.value))}
              className="w-full accent-gold"
            />
          </label>
        </div>
      </section>
    </div>
  );
}

function scentLabel(product: CatalogProduct) {
  if (product.seriesId === "wedding") return product.nameEn;
  return product.nameZh;
}

function NoteRow({
  label,
  notes,
  english,
  weight,
}: {
  label: string;
  notes: string[];
  english?: string[];
  weight: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <dt className="text-sm">{label}</dt>
        <dd className="text-right text-sm" style={{ opacity: 0.45 + weight * 0.55 }}>
          {notes.join(" · ")}
        </dd>
      </div>
      <div className="h-px bg-line">
        <div className="h-px bg-gold" style={{ width: `${Math.round(weight * 100)}%` }} />
      </div>
      {english ? <p className="mt-1 text-xs text-muted">{english.join(", ")}</p> : null}
    </div>
  );
}
