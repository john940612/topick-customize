"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Studio } from "@/components/Studio";
import { orderIdFromSearch } from "@/lib/orderLink";
import { loadSavedOrder, ORDER_SESSION_KEY, type LoadedOrder } from "@/lib/resumeClient";
import { normalizePhone } from "@/lib/orderRecord";
import type { Catalog } from "@/lib/types";

export function EditOrder({ catalog }: { catalog: Catalog }) {
  const params = useSearchParams();
  const preset = orderIdFromSearch(`?${params.toString()}`);
  const [idDraft, setIdDraft] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [loaded, setLoaded] = useState<LoadedOrder | null>(null);
  const orderId = idDraft ?? preset ?? "";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!normalizePhone(phone)) {
      setError("請填寫 8 位電話號碼。");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const order = await loadSavedOrder(
        orderId,
        phone,
        catalog.products.map((item) => item.id),
      );
      sessionStorage.setItem(
        ORDER_SESSION_KEY,
        JSON.stringify({ id: order.id, token: order.token, authPhone: order.authPhone }),
      );
      setLoaded(order);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "找不到訂單或電話不正確。");
    } finally {
      setStatus("idle");
    }
  }

  if (loaded) {
    return <Studio catalog={catalog} initialEdit={{ design: loaded.design, contact: loaded.contact }} />;
  }

  return (
    <div className="min-h-full bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 md:px-8 md:py-2.5">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <img src="/logo/perfumer-mark.png" alt="" width={592} height={1000} className="h-16 w-auto shrink-0 object-contain md:h-20" />
            <span className="font-display text-2xl tracking-[0.28em]">TOPICK</span>
          </Link>
          <Link href="/" className="text-sm text-muted underline decoration-line underline-offset-4">
            訂製新訂單
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 py-8 md:px-8 md:py-10">
        <p className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">改訂單</p>
        <h1 className="mt-2 font-serif text-4xl">改已有訂單</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">輸入訂單編號同落單時嘅 8 位電話，就可以改返之前嘅訂製。</p>
        <form onSubmit={(event) => void submit(event)} className="mt-8 space-y-4" noValidate>
          <label className="block text-sm">
            訂單編號
            <input
              name="orderId"
              value={orderId}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              onChange={(event) => {
                setIdDraft(event.target.value);
                setError("");
              }}
              className="mt-2 w-full border border-line bg-ivory px-3 py-3 outline-none focus:border-ink"
            />
          </label>
          <label className="block text-sm">
            <span>
              電話
              <span aria-hidden="true" className="ml-1 text-red-800">
                *
              </span>
              <span className="ml-1 text-xs text-muted">必填</span>
            </span>
            <input
              name="phone"
              value={phone}
              inputMode="numeric"
              autoComplete="tel"
              autoFocus={Boolean(preset)}
              aria-invalid={Boolean(error)}
              onChange={(event) => {
                setPhone(event.target.value);
                setError("");
              }}
              className="mt-2 w-full border border-line bg-ivory px-3 py-3 outline-none focus:border-ink"
            />
          </label>
          {error ? (
            <p role="alert" className="text-sm text-red-800">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={status === "loading"} className="h-11 bg-ink px-5 text-sm text-ivory disabled:opacity-60">
            {status === "loading" ? "讀取中…" : "讀取訂單"}
          </button>
        </form>
      </main>
    </div>
  );
}
