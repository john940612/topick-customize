import type { CatalogProduct } from "@/lib/types";

export type BoxCopy = {
  boxStory: string;
  boxTop: string;
  boxMiddle: string;
  boxBase: string;
};

const AQUA_STORY =
  "On a night by the sea, a gentle breeze stirs the air, bringing a sense of relaxed and natural charm. Conversations flow easily, with laughter filling the space.";

export function boxCopyFromProduct(product: CatalogProduct): BoxCopy {
  const top = product.notes.topEn ?? product.notes.top;
  const middle = product.notes.middleEn ?? product.notes.middle;
  const base = product.notes.baseEn ?? product.notes.base;
  return {
    boxStory: product.id === "aqua-chl" ? AQUA_STORY : product.story,
    boxTop: `Top: ${top.join(", ")}`,
    boxMiddle: `Middle: ${middle.join(", ")}`,
    boxBase: `Base: ${base.join(", ")}`,
  };
}
