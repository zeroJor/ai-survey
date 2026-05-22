interface Props {
  onBack: () => void;
  visible: boolean;
}

/** Back control — only visible while hovering the left edge. */
export function BackEdgeControl({ onBack, visible }: Props) {
  if (!visible) return null;

  return (
    <div className="back-edge-zone">
      <button
        type="button"
        className="back-edge-btn"
        onClick={onBack}
        aria-label="Atrás"
      >
        <span className="back-edge-icon" aria-hidden>
          ‹
        </span>
      </button>
    </div>
  );
}
