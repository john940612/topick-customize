type Props = {
  story: string;
  top: string;
  middle: string;
  base: string;
  /** Tiny type used on the dieline artwork. */
  artwork?: boolean;
};

export function BoxStoryBlock({ story, top, middle, base, artwork = false }: Props) {
  const copy = artwork ? "leading-[1.15]" : "text-sm leading-relaxed";
  const size = artwork ? { fontSize: "0.52cqw" } : undefined;
  return (
    <div className={artwork ? "flex h-full flex-col overflow-hidden text-[#2a2a2a]" : "text-ink"}>
      <p className={copy} style={size}>
        {story || (artwork ? "" : "（未填）")}
      </p>
      <div aria-hidden="true" className={artwork ? "my-[0.12cqw] h-px w-full shrink-0 bg-[#2a2a2a]" : "my-3 h-px w-full bg-[#2a2a2a]"} />
      <p className={copy} style={size}>
        <span className="block">{top || (artwork ? "" : "（未填）")}</span>
        <span className="block">{middle}</span>
        <span className="block">{base}</span>
      </p>
    </div>
  );
}
