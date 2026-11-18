"use client";

import { concentrationBand, noteEmphasis } from "@/lib/concentration";
import type { Catalog, CatalogProduct } from "@/lib/types";

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
  const band = concentrationBand(concentration);
  const emphasis = noteEmphasis(concentration);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">第一步</p>
        <h2 className="mt-2 font-serif text-3xl text-ink">選擇香氣基底</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          香氣、價錢與香調來自{" "}
          <a className="underline decoration-line underline-offset-4" href="https://topickperfume.mo/" target="_blank" rel="noreferrer">
            topickperfume.mo
          </a>
          。點選一支香之後，才顯示前調、中調與後調。濃度一拖，預覽即時跟上。
        </p>
      </header>

      {catalog.series.map((series) => {
        const items = catalog.products.filter((item) => item.seriesId === series.id);
        return (
          <section key={series.id} aria-labelledby={`series-${series.id}`}>
            <div className="mb-4 flex items-end justify-between gap-4">
              <h3 id={`series-${series.id}`} className="font-serif text-2xl">
                {series.nameZh}
                <span className="ml-3 font-sans text-xs tracking-[0.18em] text-muted uppercase">
                  {series.nameEn}
                </span>
              </h3>
            </div>
            <p className="mb-4 text-sm text-muted">{series.blurb}</p>
            <ul className="border border-line bg-ivory">
              {items.map((item) => {
                const selected = item.id === chosenId;
                return (
                  <li key={item.id} className="border-b border-line last:border-b-0">
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onProduct(item.id)}
                      className={`flex w-full items-baseline justify-between gap-3 px-4 py-3 text-left transition ${selected ? "bg-ink text-ivory" : "hover:bg-paper"}`}
                    >
                      <span>
                        <span className="block font-serif text-xl">{item.nameZh}</span>
                        <span className={`mt-1 block text-xs tracking-[0.14em] uppercase ${selected ? "text-ivory/70" : "text-muted"}`}>
                          {item.nameEn} · {item.volumeMl}ml
                        </span>
                      </span>
                      <span className="shrink-0 text-right text-sm">
                        {item.compareAtMop ? (
                          <span className={`mr-2 text-xs line-through ${selected ? "text-ivory/60" : "text-muted"}`}>
                            MOP {item.compareAtMop}
                          </span>
                        ) : null}
                        MOP {item.priceMop}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {chosenId ? (
        <section className="border border-line bg-ivory p-5" aria-live="polite">
          <p className="text-[11px] tracking-[0.22em] text-muted uppercase">{product.nameEn}</p>
          <h3 className="mt-1 font-serif text-3xl">{product.nameZh}</h3>
          <p className="mt-3 text-sm leading-relaxed">{product.tagline}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{product.story}</p>
          {product.notesSource === "placeholder" ? (
            <p className="mt-4 border border-gold bg-paper px-3 py-2 text-sm">
              官網這頁未列出香調。下面是示意香調，不是官方配方。
            </p>
          ) : (
            <p className="mt-4 text-xs tracking-[0.16em] text-muted uppercase">官網香調</p>
          )}
          <dl className="mt-3 space-y-3">
            <NoteRow label="前調" notes={product.notes.top} english={product.notes.topEn} weight={emphasis.top} />
            <NoteRow label="中調" notes={product.notes.middle} english={product.notes.middleEn} weight={emphasis.middle} />
            <NoteRow label="後調" notes={product.notes.base} english={product.notes.baseEn} weight={emphasis.base} />
          </dl>
          <p className="mt-4 text-sm">
            <a className="underline decoration-line underline-offset-4" href={product.sourceUrl} target="_blank" rel="noreferrer">
              查看官網產品頁
            </a>
          </p>
        </section>
      ) : (
        <p className="border border-line bg-ivory px-4 py-3 text-sm text-muted">點選一支香，即可查看前調、中調與後調。</p>
      )}

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl">濃度</h3>
            <p className="mt-1 text-sm text-muted">由清淡拖到濃郁。瓶身印住的 EAU DE PARFUM 屬刀模固定字。</p>
          </div>
          <p className="text-right">
            <span className="block font-display text-3xl leading-none">{band.zh}</span>
            <span className="text-xs tracking-[0.14em] text-muted uppercase">{band.en}</span>
          </p>
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
              aria-valuetext={`${band.zh} ${Math.round(concentration)}`}
              onChange={(event) => onConcentration(Number(event.target.value))}
              className="w-full accent-gold"
            />
          </label>
        </div>
        <p className="mt-3 text-sm text-muted">{band.hint}</p>
      </section>
    </div>
  );
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
