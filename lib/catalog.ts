import type { Catalog, CatalogProduct, ShopGraphic } from "@/lib/types";

/**
 * Static mirror of the public Topick catalogue.
 *
 * `getCatalog()` is the seam for a later live connection: replace the body
 * with a fetch to topickperfume.mo (or a shop API) and keep this shape.
 * Prices, volumes, names, and note lists were taken from the product pages.
 * AQUA.CHL's English notes also match the supplied dieline.
 *
 * Chinese names follow the live site (茶多酚、棬木一族), not near-spellings.
 * If a future product page has no note list, set `notesSource` to
 * "placeholder" and keep the placeholder copy visibly marked.
 */

const SLOT_GRAPHIC = { width: 609, height: 981 };

function shopGraphic(id: string, name: string, series: string): ShopGraphic {
  return {
    id,
    name,
    series,
    src: `/graphics/${id}.jpg`,
    width: SLOT_GRAPHIC.width,
    height: SLOT_GRAPHIC.height,
  };
}

const graphics: ShopGraphic[] = [
  shopGraphic("aqua-night", "海邊夜晚", "婚禮系列"),
  shopGraphic("chill-kid", "擺爛仔", "性格系列"),
  shopGraphic("fruity-buddy", "水果巴打", "性格系列"),
  shopGraphic("tea-thinker", "茶多酚", "性格系列"),
  shopGraphic("wood-roll", "棬木一族", "性格系列"),
  shopGraphic("madeira", "木", "五行系列"),
  shopGraphic("fogo", "火", "五行系列"),
  shopGraphic("terra", "土", "五行系列"),
  shopGraphic("metal", "金", "五行系列"),
  shopGraphic("agua", "水", "五行系列"),
];

const products: CatalogProduct[] = [
  {
    id: "chill-kid",
    slug: "chill-kid",
    sourceUrl: "https://topickperfume.mo/products/chill-kid",
    seriesId: "personality",
    nameEn: "Chill Kid",
    nameZh: "擺爛仔",
    labelName: "CHILL KID",
    sideTitle: "暖花香調",
    sideTitleOfficial: false,
    priceMop: 133,
    volumeMl: 20,
    tagline: "躺平的午後，被子裡的橙花與威士忌。",
    story:
      "擺爛不是放棄，是把節奏放到最低。這支香像一張還有體溫的床：花香柔軟，酒意只在邊緣，麝香貼著皮膚過夜。",
    notes: {
      top: ["橙花", "海鹽", "青茉莉", "威士忌"],
      middle: ["大朵晚香玉", "粉紅胡椒"],
      base: ["安息香脂", "香草", "白麝香"],
    },
    notesSource: "official",
    cardImage: "/catalog/chill-kid.jpg",
    graphicId: "chill-kid",
  },
  {
    id: "fruity-buddy",
    slug: "fruity-buddy",
    sourceUrl: "https://topickperfume.mo/products/fruity-buddy",
    seriesId: "personality",
    nameEn: "Fruity Buddy",
    nameZh: "水果巴打",
    labelName: "FRUITY BUDDY",
    sideTitle: "果香香調",
    sideTitleOfficial: false,
    priceMop: 133,
    volumeMl: 20,
    tagline: "青杏、蜜橘與黑醋栗炸開的白晝。",
    story:
      "巴打來得很快、走得很亮。這支香不講含蓄：切開的果皮、蜂蜜與一點陳皮的回甘，像把夏天直接穿上鎖骨。",
    notes: {
      top: ["青杏", "蜜橘", "黑醋栗"],
      middle: ["新鮮桃花", "洋槐蜜", "白茉莉"],
      base: ["陳皮", "輕軟木質"],
    },
    notesSource: "official",
    cardImage: "/catalog/fruity-buddy.jpg",
    graphicId: "fruity-buddy",
  },
  {
    id: "tea-thinker",
    slug: "tea-thinker",
    sourceUrl: "https://topickperfume.mo/products/tea-thinker",
    seriesId: "personality",
    nameEn: "Tea Thinker",
    nameZh: "茶多酚",
    labelName: "TEA THINKER",
    sideTitle: "清茶香調",
    sideTitleOfficial: false,
    priceMop: 133,
    volumeMl: 20,
    tagline: "薄荷、青檸與還在想的那一口茶。",
    story:
      "茶多酚不是一套結論，是一場還在進行的思考。前段清醒，中段潔白，後段幾乎透明。",
    notes: {
      top: ["清涼薄荷", "青檸", "嫩綠草葉", "意式紅酒"],
      middle: ["白茉莉", "橙花", "鈴蘭"],
      base: ["白麝香", "淺木質", "微量香草"],
    },
    notesSource: "official",
    cardImage: "/catalog/tea-thinker.jpg",
    graphicId: "tea-thinker",
  },
  {
    id: "wood-roll",
    slug: "wood-roll",
    sourceUrl: "https://topickperfume.mo/products/wood-roll",
    seriesId: "personality",
    nameEn: "Wood Roll",
    nameZh: "棬木一族",
    labelName: "WOOD ROLL",
    sideTitle: "木質香調",
    sideTitleOfficial: false,
    priceMop: 133,
    volumeMl: 20,
    tagline: "工作位置上的檀木、乾燥玫瑰與乳香。",
    story:
      "棬木一族把木頭當成工作節奏：乾燥、穩定、帶一點辣椒的清醒。玫瑰不是花束，是壓在文件旁邊的乾花。",
    notes: {
      top: ["粉紅胡椒", "佛手柑", "辛辣椒"],
      middle: ["老檀木", "乾燥玫瑰"],
      base: ["乳香", "香草", "柏木"],
    },
    notesSource: "official",
    cardImage: "/catalog/wood-roll.jpg",
    graphicId: "wood-roll",
  },
  {
    id: "madeira",
    slug: "wood",
    sourceUrl: "https://topickperfume.mo/products/wood",
    seriesId: "wuxing",
    nameEn: "Madeira",
    nameZh: "木",
    labelName: "MADEIRA",
    sideTitle: "木生香調",
    sideTitleOfficial: false,
    priceMop: 288,
    compareAtMop: 398,
    volumeMl: 30,
    tagline: "生長。把氣往上推的那一支。",
    story: "木生火。這支香不是森林的風景，是你決定把節奏往上推的那一下：綠、直、帶一點還未展開的力量。",
    notes: {
      top: ["青葉", "苦橙葉"],
      middle: ["雪松", "岩蘭草", "廣藿香"],
      base: ["檀木", "麝香"],
    },
    notesSource: "official",
    cardImage: "/catalog/madeira.jpg",
    graphicId: "madeira",
  },
  {
    id: "fogo",
    slug: "fire",
    sourceUrl: "https://topickperfume.mo/products/fire",
    seriesId: "wuxing",
    nameEn: "Fogo",
    nameZh: "火",
    labelName: "FOGO",
    sideTitle: "辛暖香調",
    sideTitleOfficial: false,
    priceMop: 288,
    compareAtMop: 398,
    volumeMl: 30,
    tagline: "燃燒。把節奏點亮的那一支。",
    story: "火生土。這支香來得快、燒得清楚：不是喧嘩，是把溫度推到剛好能被看見的那一層。",
    notes: {
      top: ["粉紅胡椒", "血橙"],
      middle: ["肉桂", "丁香", "玫瑰"],
      base: ["乳香", "煙燻木質"],
    },
    notesSource: "official",
    cardImage: "/catalog/fogo.jpg",
    graphicId: "fogo",
  },
  {
    id: "terra",
    slug: "soil",
    sourceUrl: "https://topickperfume.mo/products/soil",
    seriesId: "wuxing",
    nameEn: "Terra",
    nameZh: "土",
    labelName: "TERRA",
    sideTitle: "土質香調",
    sideTitleOfficial: false,
    priceMop: 288,
    compareAtMop: 398,
    volumeMl: 30,
    tagline: "承載。把腳踩實的那一支。",
    story: "土生金。這支香不往上竄，它把重量放回身體：乾燥、穩、帶一點被太陽曬過的暖。",
    notes: {
      top: ["香根草", "沒藥"],
      middle: ["廣藿香", "鳶尾"],
      base: ["琥珀", "雪松"],
    },
    notesSource: "official",
    cardImage: "/catalog/terra.jpg",
    graphicId: "terra",
  },
  {
    id: "metal",
    slug: "gold",
    sourceUrl: "https://topickperfume.mo/products/gold",
    seriesId: "wuxing",
    nameEn: "Metal",
    nameZh: "金",
    labelName: "METAL",
    sideTitle: "冷冽香調",
    sideTitleOfficial: false,
    priceMop: 288,
    compareAtMop: 398,
    volumeMl: 30,
    tagline: "淬煉。把輪廓修亮的那一支。",
    story: "金生水。這支香講的是精度：冷、亮、收得乾淨。像把一天裡多餘的線條全部剪掉。",
    notes: {
      top: ["醛香", "佛手柑"],
      middle: ["鳶尾", "金屬感麝香"],
      base: ["雪松", "琥珀"],
    },
    notesSource: "official",
    cardImage: "/catalog/metal.jpg",
    graphicId: "metal",
  },
  {
    id: "agua",
    slug: "water",
    sourceUrl: "https://topickperfume.mo/products/water",
    seriesId: "wuxing",
    nameEn: "Água",
    nameZh: "水",
    labelName: "ÁGUA",
    sideTitle: "水生香調",
    sideTitleOfficial: false,
    priceMop: 288,
    compareAtMop: 398,
    volumeMl: 30,
    tagline: "流動。把邊界打開的那一支。",
    story: "水生木。這支香不停留在一個點上：它進來、散開、再把你送去下一個地方。",
    notes: {
      top: ["海鹽", "葡萄柚"],
      middle: ["水生花香", "海藻"],
      base: ["雪松", "白麝香"],
    },
    notesSource: "official",
    cardImage: "/catalog/agua.jpg",
    graphicId: "agua",
  },
  {
    id: "aqua-chl",
    slug: "aqua-chl",
    sourceUrl: "https://topickperfume.mo/products/aqua-chl",
    seriesId: "wedding",
    nameEn: "AQUA.CHL",
    nameZh: "婚禮系列",
    labelName: "AQUA.CHL",
    sideTitle: "水生香調",
    sideTitleOfficial: true,
    priceMop: 123,
    volumeMl: 20,
    tagline: "海邊的夜晚，微風把橙花與海水送進來。",
    story: "On a night by the sea, a gentle breeze stirs the air. 這是一場不必喧嘩的典禮。",
    notes: {
      top: ["橙花油", "葡萄柚", "蜜柑", "苦橙葉"],
      middle: ["海藻", "迷迭香", "水"],
      base: ["雪松", "琥珀"],
      topEn: ["Neroli Oil", "Grapefruit", "Mandarin", "Bitter Orange Leaf"],
      middleEn: ["Seaweed", "Rosemary", "Water"],
      baseEn: ["Cedarwood", "Amber"],
    },
    notesSource: "official",
    cardImage: "/catalog/aqua-chl.jpg",
    graphicId: "aqua-night",
  },
];

export const catalog: Catalog = {
  series: [
    {
      id: "personality",
      nameZh: "性格系列",
      nameEn: "Personality",
      blurb: "四種日常性格，四支 20ml 香水。每支 MOP 133。",
    },
    {
      id: "wuxing",
      nameZh: "五行系列",
      nameEn: "Five Elements",
      blurb: "原價 MOP 398，現售 MOP 288。每支 30ml。",
    },
    {
      id: "wedding",
      nameZh: "婚禮系列",
      nameEn: "Wedding",
      blurb: "AQUA.CHL，MOP 123，20ml。",
    },
  ],
  products,
  graphics,
};

export function getCatalog(): Catalog {
  return catalog;
}

export function findProduct(list: CatalogProduct[], id: string) {
  const product = list.find((item) => item.id === id);
  if (!product) throw new Error(`Unknown product: ${id}`);
  return product;
}

export function findGraphic(list: ShopGraphic[], id: string) {
  const graphic = list.find((item) => item.id === id);
  if (!graphic) throw new Error(`Unknown graphic: ${id}`);
  return graphic;
}
