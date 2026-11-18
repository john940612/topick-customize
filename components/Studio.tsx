"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { BoxStep } from "@/components/BoxStep";
import { DielinePreview } from "@/components/DielinePreview";
import { LabelStep } from "@/components/LabelStep";
import { ScentStep } from "@/components/ScentStep";
import { ResultStep } from "@/components/ResultStep";
import { boxCopyFromProduct } from "@/lib/boxCopy";
import { findGraphic, findProduct } from "@/lib/catalog";
import { printedName } from "@/lib/lettering";
import { clampZoom, frameFromGraphic } from "@/lib/frame";
import type { OrderContact } from "@/lib/resumeClient";
import type { Catalog, DesignState, PhotoFrame, PreviewView } from "@/lib/types";

const STEPS = [
  { id: 0, label: "揀香" },
  { id: 1, label: "標籤" },
  { id: 2, label: "禮盒" },
  { id: 3, label: "結果" },
] as const;

type StepId = (typeof STEPS)[number]["id"];
type GuideSlot = "label" | "boxName" | "side" | "photo" | null;

export function Studio({
  catalog,
  initialEdit,
}: {
  catalog: Catalog;
  initialEdit?: { design: DesignState; contact: OrderContact };
}) {
  const initial = findProduct(catalog.products, "aqua-chl");
  const [step, setStep] = useState<StepId>(0);
  const [view, setView] = useState<PreviewView>("full");
  const [guide, setGuide] = useState<GuideSlot>(null);
  const [chosenId, setChosenId] = useState<string | null>(initialEdit?.design.productId ?? null);
  const [design, setDesign] = useState<DesignState>(
    () =>
      initialEdit?.design ?? {
        productId: initial.id,
        concentration: 68,
        labelName: initial.labelName,
        boxName: initial.labelName,
        linkNames: true,
        sideTitle: initial.sideTitle,
        ...boxCopyFromProduct(initial),
        capColor: "white",
        labelStyle: "classic",
        labelColor: "terracotta",
        photo: frameFromGraphic(findGraphic(catalog.graphics, initial.graphicId)),
      },
  );

  const product = useMemo(
    () => findProduct(catalog.products, design.productId),
    [catalog.products, design.productId],
  );
  const stepsRef = useRef<HTMLOListElement>(null);
  const skipInitialScroll = useRef(true);
  useEffect(() => {
    if (skipInitialScroll.current) {
      skipInitialScroll.current = false;
      return;
    }
    stepsRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }, [step]);

  function go(next: StepId) {
    setStep(next);
    setGuide(null);
    setView(next === 1 ? "label" : next === 2 ? "front" : "full");
  }

  function selectProduct(id: string) {
    const next = findProduct(catalog.products, id);
    setChosenId(id);
    setDesign((current) => ({
      ...current,
      productId: id,
      labelName: next.labelName,
      boxName: next.labelName,
      linkNames: true,
      sideTitle: next.sideTitle,
      ...boxCopyFromProduct(next),
      photo: frameFromGraphic(findGraphic(catalog.graphics, next.graphicId)),
    }));
  }

  function setPhoto(photo: PhotoFrame) {
    setDesign((current) => ({ ...current, photo }));
    setView("front");
  }

  const showPreview = step === 2;

  return (
    <div className="min-h-full bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-2.5">
            <img src="/logo/perfumer-mark.png" alt="" width={637} height={741} className="h-10 w-auto object-contain" />
            <span className="font-display text-2xl tracking-[0.28em]">TOPICK</span>
          </button>
          {initialEdit ? (
            <Link href="/" className="text-sm text-muted underline decoration-line underline-offset-4">
              訂製新訂單
            </Link>
          ) : (
            <Link href="/edit" className="text-sm text-muted underline decoration-line underline-offset-4">
              改已有訂單
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto grid max-w-3xl gap-10 px-4 py-8 md:px-8 md:py-10">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">Fragrance Palace · 澳門</p>
          <h1 className="mt-2 max-w-xl font-serif text-4xl leading-tight md:text-5xl">訂製你的專屬香氣</h1>

          <ol ref={stepsRef} className="mt-6 flex scroll-mt-4 border border-line">
            {STEPS.map((item, index) => {
              const current = step === item.id;
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
            {step === 0 ? (
              <ScentStep
                catalog={catalog}
                product={product}
                chosenId={chosenId}
                concentration={design.concentration}
                onProduct={selectProduct}
                onConcentration={(concentration) => setDesign((current) => ({ ...current, concentration }))}
              />
            ) : null}
            {step === 1 ? (
              <LabelStep
                labelName={design.labelName}
                capColor={design.capColor}
                labelStyle={design.labelStyle}
                labelColor={design.labelColor}
                onLabelName={(labelName) =>
                  setDesign((current) => {
                    const printed = printedName(labelName);
                    return {
                      ...current,
                      labelName: printed,
                      boxName: current.linkNames ? printed : current.boxName,
                    };
                  })
                }
                onCapColor={(capColor) => setDesign((current) => ({ ...current, capColor }))}
                onLabelStyle={(labelStyle) => setDesign((current) => ({ ...current, labelStyle }))}
                onLabelColor={(labelColor) => setDesign((current) => ({ ...current, labelColor }))}
                onFocus={(active) => setGuide(active ? "label" : null)}
              />
            ) : null}
            {step === 2 ? (
              <BoxStep
                graphics={catalog.graphics}
                boxName={design.boxName}
                linkNames={design.linkNames}
                sideTitle={design.sideTitle}
                sideOfficial={product.sideTitleOfficial}
                photo={design.photo}
                boxStory={design.boxStory}
                onBoxName={(boxName) => setDesign((current) => ({ ...current, boxName: printedName(boxName) }))}
                onLinkNames={(linkNames) =>
                  setDesign((current) => ({
                    ...current,
                    linkNames,
                    boxName: linkNames ? printedName(current.labelName) : current.boxName,
                  }))
                }
                onBoxStory={(boxStory) => setDesign((current) => ({ ...current, boxStory }))}
                onSideTitle={(sideTitle) => setDesign((current) => ({ ...current, sideTitle }))}
                onPhoto={setPhoto}
                onZoom={(zoom) =>
                  setDesign((current) => ({
                    ...current,
                    photo: { ...current.photo, zoom: clampZoom(zoom) },
                  }))
                }
                onFocus={(slot) => {
                  if (slot === "copy") {
                    setGuide(null);
                    setView("front");
                    return;
                  }
                  setGuide(slot);
                  if (slot === "side") setView("side");
                  if (slot === "boxName" || slot === "photo") setView("front");
                }}
              />
            ) : null}
            <div hidden={step !== 3}>
              <ResultStep product={product} design={design} initialContact={initialEdit?.contact ?? null} />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
              <button
                type="button"
                onClick={() => go((step - 1) as StepId)}
                disabled={step === 0}
                className="h-11 px-4 text-sm text-muted disabled:invisible"
              >
                上一步
              </button>
              {step < 3 ? (
                <button type="button" onClick={() => go((step + 1) as StepId)} className="h-11 bg-ink px-5 text-sm text-ivory">
                  下一步
                </button>
              ) : (
                <p className="text-sm text-muted">填好聯絡方式後提交</p>
              )}
            </div>
        </div>

        {showPreview ? (
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
        ) : null}
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs leading-relaxed text-muted md:px-8">
          <p>© 2026 源品選物有限公司</p>
        </div>
      </footer>
    </div>
  );
}
