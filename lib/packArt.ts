import { clampFocus, coverRatios } from "@/lib/frame";
import { clearLabelOption, type ClearLabelColor } from "@/lib/clearLabel";
import { hasCjk, printedName } from "@/lib/lettering";
import type { PhotoFrame } from "@/lib/types";

const CREAM = "#f4efe6";
const INK = "#241f1a";
const MUTED = "#6d655c";
const LINE = "#d9d0c2";

function fontStack(cjk: boolean) {
  const root = getComputedStyle(document.documentElement);
  const display = root.getPropertyValue("--font-cormorant").trim();
  const serif = root.getPropertyValue("--font-noto-serif").trim();
  if (cjk) {
    return `${serif}, "Noto Serif TC", "Noto Serif CJK TC", "Songti TC", "PMingLiU", "WenQuanYi Micro Hei", serif`;
  }
  return `${display}, "Times New Roman", serif`;
}

function fitSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  maxWidth: number,
  start: number,
) {
  let size = start;
  while (size > 28) {
    ctx.font = `500 ${size}px ${font}`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 4;
  }
  return size;
}

export function drawLabelCanvas(name: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 2000;
  canvas.height = 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 40, canvas.width - 96, canvas.height - 80);

  const display = fontStack(false);
  const cjk = hasCjk(name);
  const textFont = fontStack(cjk);
  const printed = printedName(name).trim();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;
  ctx.letterSpacing = "0.04em";
  ctx.font = `500 132px ${display}`;
  ctx.fillText("Topick", canvas.width / 2, 250);

  ctx.fillStyle = MUTED;
  ctx.letterSpacing = "0.46em";
  ctx.font = `500 30px ${display}`;
  ctx.fillText("FRAGRANCE PALACE", canvas.width / 2, 340);

  ctx.fillStyle = INK;
  ctx.letterSpacing = cjk ? "0.14em" : "0.06em";
  const size = fitSize(ctx, printed, textFont, 1500, cjk ? 120 : 150);
  ctx.font = `500 ${size}px ${textFont}`;
  ctx.fillText(printed, canvas.width / 2, 530);

  ctx.fillStyle = MUTED;
  ctx.letterSpacing = "0.22em";
  ctx.font = `500 28px ${display}`;
  ctx.fillText("EAU DE PARFUM     20ml  0.7 FL OZ", canvas.width / 2, 720);
  return canvas;
}

export function drawNamePlate(name: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const cjk = hasCjk(name);
  const printed = printedName(name).trim();
  const font = fontStack(cjk);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;
  ctx.letterSpacing = cjk ? "0.16em" : "0.08em";
  const size = fitSize(ctx, printed, font, 1400, cjk ? 120 : 150);
  ctx.font = `500 ${size}px ${font}`;
  ctx.fillText(printed, canvas.width / 2, canvas.height / 2);
  return canvas;
}

export function drawSideAccent(title: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const cjk = hasCjk(title);
  const font = fontStack(cjk);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = INK;
  ctx.letterSpacing = cjk ? "0.18em" : "0.08em";
  const size = fitSize(ctx, title.trim(), font, 680, cjk ? 92 : 72);
  ctx.font = `500 ${size}px ${font}`;
  ctx.fillText(title.trim(), canvas.width / 2, canvas.height / 2);
  return canvas;
}

export async function drawClearLabelCanvas(name: string, color: ClearLabelColor) {
  const template = await loadImage(clearLabelOption(color).src);
  const canvas = document.createElement("canvas");
  canvas.width = template.naturalWidth || 900;
  canvas.height = template.naturalHeight || 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.drawImage(template, 0, 0);
  const printed = printedName(name).trim();
  if (!printed) return canvas;
  ctx.fillStyle = clearLabelOption(color).ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const size = printed.length > 14 ? 64 : printed.length > 9 ? 78 : 96;
  ctx.font = `600 ${size}px "Times New Roman", serif`;
  ctx.fillText(printed, canvas.width / 2, canvas.height * 0.58);
  return canvas;
}

export function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image"));
    image.src = src;
  });
}

/** Draw the box photo the same way the flat slot clips it. */
export function drawPhotoCanvas(image: HTMLImageElement, frame: PhotoFrame) {
  const canvas = document.createElement("canvas");
  canvas.width = 1218;
  canvas.height = 1962;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = "#d7e3ef";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const zoom = frame.snap ? 1 : frame.zoom;
  const ratios = coverRatios(image.naturalWidth / image.naturalHeight, zoom);
  const focusX = clampFocus(frame.focusX, ratios.wRel);
  const focusY = clampFocus(frame.focusY, ratios.hRel);
  const dw = canvas.width * ratios.wRel;
  const dh = canvas.height * ratios.hRel;
  const left = canvas.width * 0.5 - focusX * dw;
  const top = canvas.height * 0.5 - focusY * dh;
  ctx.drawImage(image, left, top, dw, dh);
  return canvas;
}
