import { capOption, type CapColor } from "@/lib/caps";
import { clearLabelOption, type ClearLabelColor } from "@/lib/clearLabel";
import { printedName, printedNameStyle } from "@/lib/lettering";

/**
 * Label artwork sits on the glass of the official square product shots.
 * Fractions of the photo: the ink is transparent everywhere else, so the
 * glass and dip tube stay visible.
 */
export const CLEAR_BOTTLE_LABEL = {
  left: 42.5,
  top: 51.57,
  width: 13.57,
  height: 20.36,
};

type Props = {
  capColor: CapColor | string;
  labelColor: ClearLabelColor | string;
  labelName: string;
  className?: string;
};

export function ClearBottlePreview({ capColor, labelColor, labelName, className }: Props) {
  const bottle = capOption(capColor);
  const ink = clearLabelOption(labelColor);
  const trimmed = labelName.trim();
  const printed = trimmed ? printedName(trimmed) : "AQUA.CHL";
  const frame = CLEAR_BOTTLE_LABEL;
  const name = {
    left: `${frame.left + frame.width * 0.08}%`,
    width: `${frame.width * 0.84}%`,
    top: `${frame.top + frame.height * 0.5}%`,
    height: `${frame.height * 0.16}%`,
  };

  return (
    <figure className={`@container relative mx-auto w-full ${className ?? "max-w-md"}`}>
      <img src={bottle.clear} alt="" className="w-full" />
      <img
        src={ink.src}
        alt=""
        className="pointer-events-none absolute"
        style={{ left: `${frame.left}%`, top: `${frame.top}%`, width: `${frame.width}%`, height: `${frame.height}%` }}
      />
      <div className="pointer-events-none absolute flex items-center justify-center overflow-hidden text-center" style={name}>
        <span className="whitespace-nowrap" style={{ ...printedNameStyle(printed, 2.15), color: trimmed ? ink.ink : `${ink.ink}59` }}>
          {printed}
        </span>
      </div>
      <figcaption className="sr-only">
        {ink.label}色透明標籤，{bottle.label}色瓶蓋。玻璃同吸管仍然睇到，只可以改中間個名。
      </figcaption>
    </figure>
  );
}
