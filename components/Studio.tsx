"use client";

import { useMemo, useState } from "react";
import { BoxStep } from "@/components/BoxStep";
import { DielinePreview } from "@/components/DielinePreview";
import { LabelStep } from "@/components/LabelStep";
import { ScentStep } from "@/components/ScentStep";
import { SummaryPanel } from "@/components/SummaryPanel";
import { findGraphic, findProduct } from "@/lib/catalog";
import { clampZoom, frameFromGraphic } from "@/lib/frame";
import type { Catalog, DesignState, PhotoFrame, PreviewView } from "@/lib/types";

const STEPS = [
  { id: 0, label: "揀香" },
  { id: 1, label: "標籤" },
  { id: 2, label: "禮盒" },
] as const;

type StepId = (typeof STEPS)[number]["id"];
type GuideSlot = "label" | "boxName" | "side" | "photo" | null;

export function Studio({ catalog }: { catalog: Catalog }) {
  const initial = findProduct(catalog.products, "aqua-chl");
  const [step, setStep] = useState<StepId>(0);
  const [done, setDone] = useState(false);
  const [view, setView] = useState<PreviewView>("full");
  const [guide, setGuide] = useState<GuideSlot>(null);
  const [design, setDesign] = useState<DesignState>(() => ({
    productId: initial.id,
    concentration: 68,
    labelName: initial.labelName,
    boxName: initial.labelName,
    linkNames: true,
    sideTitle: initial.sideTitle,
    photo: frameFromGraphic(findGraphic(catalog.graphics, initial.graphicId)),
  }));

  const product = useMemo(
    () => findProduct(catalog.products, design.productId),
    [catalog.products, design.productId],
  );

  function go(next: StepId) {
    setStep(next);
    setDone(false);
    setGuide(null);
    setView(next === 0 ? "full" : next === 1 ? "label" : "front");
  }

  function selectProduct(id: string) {
    const next = findProduct(catalog.products, id);
    setDesign((current) => ({
      ...current,
      productId: id,
      labelName: next.labelName,
      boxName: next.labelName,
      linkNames: true,
      sideTitle: next.sideTitle,
      photo: frameFromGraphic(findGraphic(catalog.graphics, next.graphicId)),
    }));
  }

  function setPhoto(photo: PhotoFrame) {
    setDesign((current) => ({ ...current, photo }));
    setView("front");
  }

  return (
    <div className="min-h-full bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <a href="https://topickperfume.mo/" className="font-display text-2xl tracking-[0.28em]" target="_blank" rel="noreferrer">
            TOPICK
          </a>
          <p className="text-[11px] tracking-[0.18em] text-muted uppercase">訂製示範 · 無需結帳</p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,460px)] lg:items-start lg:py-10">
        <div className="order-2 lg:order-1">
          <p className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">Fragrance Palace · 澳門</p>
          <h1 className="mt-2 max-w-xl font-serif text-4xl leading-tight md:text-5xl">訂製您的 Topick</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            先揀一支香，再改 100mm × 45mm 標籤同禮盒上可以換的位置。每一下選擇都會即時出現在預覽。
          </p>

          <ol className="mt-6 flex border border-line">
            {STEPS.map((item, index) => {
              const current = !done && step === item.id;
              return (
                <li key={item.id} className="flex-1">
                  <button
                    type="button"
                    onClick={() => go(item.id)}
                    className={`flex h-12 w-full items-center justify-center gap-2 text-sm ${current ? "bg-ink text-ivory" : "bg-ivory text-ink hover:bg-white"} ${index > 0 ? "border-l border-line" : ""}`}
                    aria-current={current ? "step" : undefined}
                  >
                    <span className="text-xs opacity-70">0{index + 1}</span>
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="mt-8">
            {done ? (
              <SummaryPanel product={product} design={design} onBack={() => setDone(false)} />
            ) : null}
            {!done && step === 0 ? (
              <ScentStep
                catalog={catalog}
                product={product}
                concentration={design.concentration}
                onProduct={selectProduct}
                onConcentration={(concentration) => setDesign((current) => ({ ...current, concentration }))}
              />
            ) : null}
            {!done && step === 1 ? (
              <LabelStep
                labelName={design.labelName}
                onLabelName={(labelName) =>
                  setDesign((current) => ({
                    ...current,
                    labelName,
                    boxName: current.linkNames ? labelName : current.boxName,
                  }))
                }
                onFocus={(active) => setGuide(active ? "label" : null)}
              />
            ) : null}
            {!done && step === 2 ? (
              <BoxStep
                graphics={catalog.graphics}
                boxName={design.boxName}
                linkNames={design.linkNames}
                sideTitle={design.sideTitle}
                sideOfficial={product.sideTitleOfficial}
                photo={design.photo}
                onBoxName={(boxName) => setDesign((current) => ({ ...current, boxName }))}
                onLinkNames={(linkNames) =>
                  setDesign((current) => ({
                    ...current,
                    linkNames,
                    boxName: linkNames ? current.labelName : current.boxName,
                  }))
                }
                onSideTitle={(sideTitle) => setDesign((current) => ({ ...current, sideTitle }))}
                onPhoto={setPhoto}
                onZoom={(zoom) =>
                  setDesign((current) => ({
                    ...current,
                    photo: { ...current.photo, zoom: clampZoom(zoom) },
                  }))
                }
                onFocus={(slot) => {
                  setGuide(slot);
                  if (slot === "side") setView("side");
                  if (slot === "boxName" || slot === "photo") setView("front");
                }}
              />
            ) : null}
          </div>

          {!done ? (
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
              <button
                type="button"
                onClick={() => go((step - 1) as StepId)}
                disabled={step === 0}
                className="h-11 px-4 text-sm text-muted disabled:invisible"
              >
                上一步
              </button>
              {step < 2 ? (
                <button type="button" onClick={() => go((step + 1) as StepId)} className="h-11 bg-ink px-5 text-sm text-ivory">
                  下一步
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setDone(true);
                    setView("full");
                    setGuide(null);
                  }}
                  className="h-11 bg-ink px-5 text-sm text-ivory"
                >
                  完成預覽
                </button>
              )}
            </div>
          ) : null}
        </div>

        <div className="order-1 lg:sticky lg:top-6 lg:order-2">
          <DielinePreview
            design={design}
            view={view}
            onView={setView}
            onPhoto={setPhoto}
            guides={{
              label: guide === "label",
              photo: guide === "photo",
              boxName: guide === "boxName",
              side: guide === "side",
            }}
          />
        </div>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs leading-relaxed text-muted md:flex-row md:items-center md:justify-between md:px-8">
          <p>刀模上的品牌、二維碼、成分與公司資料保持原樣。香氣資料整理自官網，方便日後接上。</p>
          <a className="underline decoration-line underline-offset-4" href="https://topickperfume.mo/">
            返回 topickperfume.mo
          </a>
        </div>
      </footer>
    </div>
  );
}
