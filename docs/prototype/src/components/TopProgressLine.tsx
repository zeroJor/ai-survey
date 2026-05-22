interface Props {
  percent: number;
}

export function TopProgressLine({ percent }: Props) {
  const clamped = Math.min(100, Math.max(0, percent));
  const fillWidth = clamped > 0 ? Math.max(clamped, 1.5) : 0;

  return (
    <div
      className="top-progress"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progreso de la entrevista"
    >
      <span
        className="top-progress-fill"
        style={{ width: `${fillWidth}%` }}
      />
    </div>
  );
}
