import type { ReactNode } from "react";
import { AdvanceButton } from "./AdvanceButton";

interface AdvanceProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

interface Props {
  prompt: ReactNode;
  answers: ReactNode;
  advance?: AdvanceProps;
  layout?: "default" | "question-fill";
}

/** Prompt left, answers/options right — same slot on every step. */
export function StepColumns({ prompt, answers, advance, layout = "default" }: Props) {
  const rootClass = [
    advance ? "step-with-advance" : undefined,
    layout === "question-fill" ? "step-with-advance--question" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass || undefined}>
      <div className={["step-grid", advance ? "step-grid--advance" : ""].join(" ")}>
        <div className="step-prompt">{prompt}</div>
        <div className="step-answers">{answers}</div>
      </div>
      {advance && (
        <AdvanceButton
          onClick={advance.onClick}
          disabled={advance.disabled}
          label={advance.label}
        />
      )}
    </div>
  );
}
