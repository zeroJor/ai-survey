interface Props {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

/** Large chevron fixed on the right edge of the viewport. */
export function AdvanceButton({
  onClick,
  disabled = false,
  label = "Continuar",
}: Props) {
  return (
    <button
      type="button"
      className="advance-btn"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      <span className="advance-icon" aria-hidden>
        ›
      </span>
    </button>
  );
}
