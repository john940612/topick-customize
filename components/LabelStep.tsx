"use client";

type Props = {
  labelName: string;
  onLabelName: (value: string) => void;
  onFocus: (active: boolean) => void;
};

export function LabelStep({ labelName, onLabelName, onFocus }: Props) {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.22em] text-gold-dark uppercase">第二步</p>
        <h2 className="mt-2 font-serif text-3xl">瓶身標籤</h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
          標籤尺寸 100mm × 45mm。Topick 標誌、EAU DE PARFUM 與 20ml 依刀模固定，只可改中間的產品名稱。
        </p>
      </header>
      <label className="block">
        <span className="text-sm">產品名稱</span>
        <input
          value={labelName}
          maxLength={22}
          onChange={(event) => onLabelName(event.target.value)}
          onFocus={() => onFocus(true)}
          onBlur={() => onFocus(false)}
          className="mt-2 w-full border border-line bg-ivory px-3 py-3 font-display text-2xl tracking-[0.12em] uppercase outline-none focus:border-ink"
          placeholder="AQUA.CHL"
        />
      </label>
      <p className="text-sm text-muted">中英文都可以。名稱只會出現在標籤的名稱位，不會蓋過標誌。</p>
    </div>
  );
}
