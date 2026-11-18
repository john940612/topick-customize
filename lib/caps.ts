export const CAP_COLORS = ["pink", "purple", "green", "white"] as const;
export type CapColor = (typeof CAP_COLORS)[number];

export const CAP_OPTIONS: {
  id: CapColor;
  label: string;
  bottle: string;
  thumb: string;
}[] = [
  { id: "pink", label: "粉", bottle: "/bottles/bottle-pink-blank.jpg", thumb: "/caps/cap-pink.jpg" },
  { id: "purple", label: "紫", bottle: "/bottles/bottle-purple-blank.jpg", thumb: "/caps/cap-purple.jpg" },
  { id: "green", label: "綠", bottle: "/bottles/bottle-green-blank.jpg", thumb: "/caps/cap-green.jpg" },
  { id: "white", label: "白", bottle: "/bottles/bottle-white-blank.jpg", thumb: "/caps/cap-white.jpg" },
];

export function isCapColor(value: unknown): value is CapColor {
  return typeof value === "string" && CAP_COLORS.includes(value as CapColor);
}

export function capOption(id: string | undefined) {
  return CAP_OPTIONS.find((item) => item.id === id) ?? CAP_OPTIONS[3];
}
