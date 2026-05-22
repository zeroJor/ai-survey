interface Props {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  /** Desktop edge chevron; off on welcome (uses inline Empecemos). */
  showEdgeChevron?: boolean;
}

/** Mobile: full-width black bar + white chevron. Desktop (lg+): optional right-edge chevron. */
export function AdvanceButton({
  onClick,
  disabled = false,
  label = "Continuar",
  showEdgeChevron = true,
}: Props) {
  return (
    <>
      <nav className="advance-bar" aria-label="Avanzar">
        <button
          type="button"
          className="advance-bar-btn"
          onClick={onClick}
          disabled={disabled}
        >
          <span className="advance-bar-label">{label}</span>
          <span className="advance-bar-icon" aria-hidden>
            ›
          </span>
        </button>
      </nav>
      {showEdgeChevron && (
        <button
          type="button"
          className="advance-btn advance-btn--edge"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
        >
          <span className="advance-icon" aria-hidden>
            ›
          </span>
        </button>
      )}
    </>
  );
}
