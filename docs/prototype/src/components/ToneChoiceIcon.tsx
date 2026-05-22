export type ToneIconKind = "casual" | "formal";

interface Props {
  kind: ToneIconKind;
  className?: string;
}

const S = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "square" as const,
  strokeLinejoin: "miter" as const,
  strokeMiterlimit: 4,
};

/** Corbata y vaso con popote — trazos angulares. */
export function ToneChoiceIcon({ kind, className = "" }: Props) {
  const shared = {
    className: ["choice-icon-svg", className].filter(Boolean).join(" "),
    viewBox: "0 0 32 32",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
  };

  if (kind === "casual") {
    return (
      <svg {...shared}>
        <path d="M11 8H21L18.5 25H13.5L11 8Z" {...S} />
        <path d="M13 17 16 16.25 19 17" {...S} />
        <path d="M15.5 21 17.25 5 22 2" {...S} />
      </svg>
    );
  }

  return (
    <svg {...shared}>
      {/* Corbata: nudo ▽ + rombo puntiagudo */}
      <path d="M12.5 7h7" {...S} />
      <path d="M12.5 7 16 11.5 19.5 7Z" {...S} />
      <path d="M16 11.5 11.5 26.5 16 29 20.5 26.5 16 11.5Z" {...S} />
    </svg>
  );
}
