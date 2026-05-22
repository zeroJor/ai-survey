interface Props {
  label: string;
}

/** Small kicker — accent square + label (not a hero title). */
export function SectionIndicator({ label }: Props) {
  return (
    <p className="section-label">
      <span className="accent-square" aria-hidden />
      {label}
    </p>
  );
}
