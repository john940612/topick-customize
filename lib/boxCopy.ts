import type { CatalogProduct, NotePyramid } from "@/lib/types";

export type BoxCopy = {
  boxStory: string;
  boxTop: string;
  boxMiddle: string;
  boxBase: string;
};

const AQUA_STORY =
  "On a night by the sea, a gentle breeze stirs the air, bringing a sense of relaxed and natural charm. Conversations flow easily, with laughter filling the space.";

export function boxNoteLines(notes: NotePyramid) {
  const top = notes.topEn ?? notes.top;
  const middle = notes.middleEn ?? notes.middle;
  const base = notes.baseEn ?? notes.base;
  return {
    boxTop: `Top: ${top.join(", ")}`,
    boxMiddle: `Middle: ${middle.join(", ")}`,
    boxBase: `Base: ${base.join(", ")}`,
  };
}

export function boxCopyFromProduct(product: CatalogProduct): BoxCopy {
  return {
    boxStory: product.id === "aqua-chl" ? AQUA_STORY : product.story,
    ...boxNoteLines(product.notes),
  };
}
