"use client";

import { useEffect, useState, type ReactNode } from "react";

type Gate = "loading" | "in" | "out" | "unconfigured";

export function StudioGate({ children }: { children: ReactNode }) {
  const [gate, setGate] = useState<Gate>("loading");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const onLogout = () => setGate("out");
    window.addEventListener("topick-studio-logout", onLogout);
    const controller = new AbortController();
    void fetch("/api/studio/session", { signal: controller.signal })
      .then((response) => {
        if (response.status === 503) setGate("unconfigured");
        else setGate(response.ok ? "in" : "out");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setGate("out");
      });
    return () => {
      controller.abort();
      window.removeEventListener("topick-studio-logout", onLogout);
    };
  }, []);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/studio/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setPending(false);
    setPassword("");
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || "密碼不正確。");
      return;
    }
    setGate("in");
  }

  if (gate === "loading") return <p className="text-sm text-muted">正在確認登入…</p>;
  if (gate === "unconfigured") return <p className="text-sm text-muted">工坊密碼尚未設定。</p>;
  if (gate === "out") {
    return (
      <form onSubmit={(event) => void login(event)} className="mx-auto max-w-sm space-y-4 border border-line bg-ivory p-6">
        <h1 className="font-serif text-3xl">工坊檢視</h1>
        <p className="text-sm text-muted">請輸入工坊密碼。密碼不會顯示在頁面上。</p>
        <label className="block text-sm">
          密碼
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full border border-line bg-paper px-3 py-3 outline-none focus:border-ink"
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-red-800">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={pending || !password} className="h-11 bg-ink px-5 text-sm text-ivory disabled:opacity-60">
          {pending ? "核對中…" : "進入"}
        </button>
      </form>
    );
  }
  return <>{children}</>;
}

export async function logoutStudio() {
  await fetch("/api/studio/logout", { method: "POST" });
  window.dispatchEvent(new Event("topick-studio-logout"));
}
