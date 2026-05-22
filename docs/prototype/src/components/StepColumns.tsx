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
}

/** Prompt left, answers/options right — same slot on every step. */
export function StepColumns({ prompt, answers, advance }: Props) {
  return (
    <>
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
    </>
  );
}
