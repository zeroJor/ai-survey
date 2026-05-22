import { useCallback, useState } from "react";
import { AnimatedReplyText } from "./AnimatedReplyText";

interface Props {
  onClick: () => void;
  disabled?: boolean;
  /** Desktop edge chevron (and aria). */
  label?: string;
  /** Mobile bottom bar copy; defaults to `label`. */
  barLabel?: string;
  /** Desktop: skip link to the left of chevron on hover when field is empty. */
  skipLabel?: string;
  showFloatingSkip?: boolean;
  /** Desktop: large chevron (animates up from compact when user types). */
  edgeChevronProminent?: boolean;
  /** Desktop edge chevron; off on welcome (uses inline Empecemos). */
  showEdgeChevron?: boolean;
}

/** Mobile: full-width black bar. Desktop: right-edge zone with optional hover skip. */
export function AdvanceButton({
  onClick,
  disabled = false,
  label = "Continuar",
  barLabel,
  skipLabel,
  showFloatingSkip = false,
  edgeChevronProminent = true,
  showEdgeChevron = true,
}: Props) {
  const mobileLabel = barLabel ?? label;
  const [edgeHover, setEdgeHover] = useState(false);

  const onEdgeEnter = useCallback(() => setEdgeHover(true), []);
  const onEdgeLeave = useCallback(() => setEdgeHover(false), []);

  return (
    <>
      <nav className="advance-bar" aria-label="Avanzar">
        <button
          type="button"
          className="advance-bar-btn"
          onClick={onClick}
          disabled={disabled}
        >
          <span className="advance-bar-label">{mobileLabel}</span>
          <span className="advance-bar-icon" aria-hidden>
            ›
          </span>
        </button>
      </nav>
      {showEdgeChevron && (
        <div
          className={[
            "advance-edge-zone",
            showFloatingSkip ? "advance-edge-zone--skip" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onMouseEnter={showFloatingSkip ? onEdgeEnter : undefined}
          onMouseLeave={showFloatingSkip ? onEdgeLeave : undefined}
          onFocusCapture={showFloatingSkip ? onEdgeEnter : undefined}
          onBlurCapture={(e) => {
            if (!showFloatingSkip) return;
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              onEdgeLeave();
            }
          }}
        >
          {showFloatingSkip && skipLabel && (
            <button
              type="button"
              className={[
                "advance-edge-skip",
                edgeHover ? "advance-edge-skip--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={onClick}
              disabled={disabled}
              tabIndex={edgeHover ? 0 : -1}
            >
              <AnimatedReplyText
                text={skipLabel}
                className="advance-edge-skip-text"
                play={edgeHover}
              />
            </button>
          )}
          <button
            type="button"
            className={[
              "advance-btn advance-btn--edge",
              edgeChevronProminent ? "advance-btn--edge--prominent" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
          >
            <span className="advance-icon" aria-hidden>
              ›
            </span>
          </button>
        </div>
      )}
    </>
  );
}
