import { ToneChoiceIcon, type ToneIconKind } from "./ToneChoiceIcon";

interface Props {
  tag: string;
  icon: ToneIconKind;
  /** Screen reader hint (replaces visible description). */
  hint: string;
  selected: boolean;
  onSelect: () => void;
}

export function OptionCard({
  tag,
  icon,
  hint,
  selected,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      onClick={(e) => {
        onSelect();
        e.currentTarget.blur();
      }}
      aria-label={`${tag}. ${hint}`}
      className={[
        "choice-btn",
        `choice-btn--${icon}`,
        selected ? "is-selected" : "",
      ].join(" ")}
    >
      <span className="choice-line">
        <span className="choice-tag">{tag}</span>
        <span className="choice-icon" aria-hidden>
          <ToneChoiceIcon kind={icon} />
        </span>
      </span>
    </button>
  );
}
