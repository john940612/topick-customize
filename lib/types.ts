import type { CapColor } from "@/lib/caps";
import type { ClearLabelColor, LabelStyle } from "@/lib/clearLabel";

export type NotesSource = "official" | "placeholder";

export type NotePyramid = {
  top: string[];
  middle: string[];
  base: string[];
  /** English lines from the dieline, when the proof prints them. */
  topEn?: string[];
  middleEn?: string[];
  baseEn?: string[];
};

export type SeriesId = "personality" | "wuxing" | "wedding";

export type CatalogProduct = {
  id: string;
  /** Stable slug used by https://topickperfume.mo/products/[slug] */
  slug: string;
  sourceUrl: string;
  seriesId: SeriesId;
  nameEn: string;
  nameZh: string;
  /** Default Latin (or brand) line printed in the name slots. */
  labelName: string;
  /**
   * Suggested line for the small side-panel slot.
   * Official only for AQUA.CHL, which is the line on the supplied dieline.
   */
  sideTitle: string;
  sideTitleOfficial: boolean;
  priceMop: number;
  compareAtMop?: number;
  volumeMl: number;
  tagline: string;
  story: string;
  notes: NotePyramid;
  notesSource: NotesSource;
  cardImage: string;
  graphicId: string;
};

export type ShopGraphic = {
  id: string;
  name: string;
  series: string;
  src: string;
  width: number;
  height: number;
};

export type Series = {
  id: SeriesId;
  nameZh: string;
  nameEn: string;
  blurb: string;
};

export type Catalog = {
  series: Series[];
  products: CatalogProduct[];
  graphics: ShopGraphic[];
};

export type PhotoFrame = {
  src: string;
  alt: string;
  source: "shop" | "upload";
  graphicId?: string;
  /** True when the image aspect already matches the box-front window. */
  snap: boolean;
  zoom: number;
  /** 0–1 point of the image kept at the centre of the slot. */
  focusX: number;
  focusY: number;
  width: number;
  height: number;
};

export type DesignState = {
  productId: string;
  /** 0 is lightest, 100 is strongest. */
  concentration: number;
  labelName: string;
  boxName: string;
  linkNames: boolean;
  sideTitle: string;
  /** Paragraph under the box-front photo. */
  boxStory: string;
  /** Note lines under the box-front photo, after the divider. */
  boxTop: string;
  boxMiddle: string;
  boxBase: string;
  /** Spherical cap. Only the four studio colours are valid. */
  capColor: CapColor;
  /** Opaque printed label, or the clear-glass sticker. */
  labelStyle: LabelStyle;
  /** Ink colour of the clear sticker. Ignored for the classic label. */
  labelColor: ClearLabelColor;
  photo: PhotoFrame;
};

export type PreviewView = "full" | "label" | "front" | "side";
