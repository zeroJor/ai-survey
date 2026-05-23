import type { ReactNode } from "react";
import { TopProgressLine } from "./TopProgressLine";

interface Props {
  children: ReactNode;
  progressPercent?: number;
  showProgressLine?: boolean;
}

export function InterviewShell({
  children,
  progressPercent = 0,
  showProgressLine = true,
}: Props) {
  return (
    <div className="shell">
      {showProgressLine && <TopProgressLine percent={progressPercent} />}
      <div className="shell-inner">
        <main className="shell-main">{children}</main>
      </div>
    </div>
  );
}
