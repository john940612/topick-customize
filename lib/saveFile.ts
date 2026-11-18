import { artworkDownloadName, studioMediaUrl, type ArtworkSlot } from "@/lib/orderRecord";

const cached = new Map<string, Blob>();

export function prefersShareSheet() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return ios || /Android/i.test(ua);
}

export function prefetchStudioMedia(id: string, slot: ArtworkSlot) {
  const url = studioMediaUrl(id, slot);
  if (cached.has(url)) return;
  void fetch(url, { credentials: "same-origin" }).then(async (response) => {
    if (response.ok) cached.set(url, await response.blob());
  });
}

export async function saveStudioArtwork(id: string, slot: ArtworkSlot) {
  const url = studioMediaUrl(id, slot);
  let blob = cached.get(url);
  if (!blob) {
    const response = await fetch(url, { credentials: "same-origin" });
    if (!response.ok) throw new Error("暫時未能下載。");
    blob = await response.blob();
    cached.set(url, blob);
  }
  await shareOrDownload(blob, artworkDownloadName(id, slot));
}

export async function shareOrDownload(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: blob.type || "application/octet-stream" });
  if (prefersShareSheet() && (await shareFile(file))) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

async function shareFile(file: File) {
  const payload = { files: [file] };
  if (typeof navigator.share !== "function" || (navigator.canShare && !navigator.canShare(payload))) return false;
  try {
    await navigator.share(payload);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return true;
    return false;
  }
}
