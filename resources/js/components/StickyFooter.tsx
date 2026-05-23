import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  note?: ReactNode;
  fixed?: boolean;
}

export function StickyFooter({ children, note, fixed = true }: Props) {
  const wrap = fixed ? "bottom-bar-fixed" : "bottom-bar";

  return (
    <div className={wrap}>
      <div className="bottom-bar-pad">
        {note && <p className="bottom-note">{note}</p>}
        <div className="ml-auto">{children}</div>
      </div>
    </div>
  );
}
