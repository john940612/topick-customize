export const PREVIEW_DISCLAIMER = "本圖僅為示意，一切以實物為準";

/**
 * Fixed line shown under every customer-facing customisation preview.
 * Keep the wording identical everywhere — John asked for this sentence verbatim.
 */
export function PreviewDisclaimer({ className }: { className?: string }) {
  return (
    <p className={className ?? "border-t border-line px-4 py-3 text-xs leading-relaxed text-muted"}>
      {PREVIEW_DISCLAIMER}
    </p>
  );
}
