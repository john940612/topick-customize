import { ART, PHOTO_SLOT, SLOTS, VIEWS } from "@/lib/geometry";
import { printedName } from "@/lib/lettering";
import { loadImage } from "@/lib/packArt";
import { shareOrDownload } from "@/lib/saveFile";
import type { DesignState } from "@/lib/types";

const SCALE = 6;

export async function downloadBoxFront(design: DesignState, filename: string) {
  const view = VIEWS.front;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(view.w * SCALE);
  canvas.height = Math.round(view.h * SCALE);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const base = await loadImage("/dieline/base.jpg");
  ctx.drawImage(base, view.x, view.y, view.w, view.h, 0, 0, canvas.width, canvas.height);
  try {
    const photo = await loadImage(design.photo.src);
    paint(ctx, PHOTO_SLOT, view, () => {
      ctx.drawImage(photo, 0, 0, PHOTO_SLOT.w * SCALE, PHOTO_SLOT.h * SCALE);
    });
  } catch {
    // The base artwork remains if the photo cannot be loaded.
  }
  ctx.fillStyle = "#2a2a2a";
  ctx.textBaseline = "top";
  const fontPx = 0.0028 * ART.w * SCALE;
  ctx.font = `${fontPx}px "Times New Roman", serif`;
  const story = place(SLOTS.story, view);
  ctx.save();
  ctx.beginPath();
  ctx.rect(story.x, story.y, story.w, story.h);
  ctx.clip();
  let y = story.y;
  y = drawWrapped(ctx, design.boxStory, story.x, y, story.w, fontPx * 1.25);
  y += fontPx * 0.4;
  ctx.fillRect(story.x, y, story.w, Math.max(1, SCALE * 0.35));
  y += fontPx * 0.45;
  for (const line of [design.boxTop, design.boxMiddle, design.boxBase]) {
    y = drawWrapped(ctx, line, story.x, y, story.w, fontPx * 1.25);
  }
  ctx.restore();
  const name = printedName(design.boxName).trim();
  if (name) {
    const slot = place(SLOTS.boxName, view);
    ctx.fillStyle = "#1c1916";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = `${slot.h * 0.62}px "Times New Roman", serif`;
    ctx.fillText(name, slot.x, slot.y + slot.h / 2, slot.w);
    ctx.textAlign = "start";
    ctx.textBaseline = "top";
  }
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;
  await shareOrDownload(blob, filename);
}

function place(slot: { x: number; y: number; w: number; h: number }, view: { x: number; y: number }) {
  return {
    x: (slot.x - view.x) * SCALE,
    y: (slot.y - view.y) * SCALE,
    w: slot.w * SCALE,
    h: slot.h * SCALE,
  };
}

function paint(
  ctx: CanvasRenderingContext2D,
  slot: { x: number; y: number; w: number; h: number },
  view: { x: number; y: number },
  draw: () => void,
) {
  const origin = place(slot, view);
  ctx.save();
  ctx.translate(origin.x, origin.y);
  draw();
  ctx.restore();
}

function drawWrapped(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, lineHeight: number) {
  const lines = wrap(ctx, text, width);
  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  let line = "";
  for (const char of text) {
    if (char === "\n") {
      lines.push(line);
      line = "";
      continue;
    }
    const next = line + char;
    if (line && ctx.measureText(next).width > width) {
      lines.push(line);
      line = char.trim() ? char : "";
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}
