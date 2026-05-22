import { useEffect, useRef } from "react";
import { RichText } from "./RichText";
import { StepColumns } from "./StepColumns";

interface Props {
  label: string;
  hint?: string;
  body: string;
  skipped: boolean;
  skipLabel: string;
  continueLabel: string;
  onBodyChange: (value: string) => void;
  onSkip: () => void;
  onContinue: () => void;
  continueDisabled?: boolean;
}

export function QuestionCard({
  label,
  hint,
  body,
  skipped,
  skipLabel,
  continueLabel,
  onBodyChange,
  onSkip,
  onContinue,
  continueDisabled,
}: Props) {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const disabled =
    continueDisabled ?? (!skipped && body.trim().length === 0);

  useEffect(() => {
    if (skipped) return;
    const field = fieldRef.current;
    if (!field) return;

    const id = requestAnimationFrame(() => {
      field.focus({ preventScroll: true });
      const end = field.value.length;
      field.setSelectionRange(end, end);
    });

    return () => cancelAnimationFrame(id);
  }, [label, skipped]);

  return (
    <StepColumns
      advance={{
        onClick: onContinue,
        disabled,
        label: continueLabel,
      }}
      prompt={
        <div className="question-stage">
          <RichText as="h1" className="question-hero" text={label} />
          {hint && <p className="question-hint">{hint}</p>}
        </div>
      }
      answers={
        <div className="step-answers-inner">
          <textarea
            ref={fieldRef}
            className="answer-field min-h-[4rem] max-w-none"
            placeholder="Escribe aquí…"
            value={body}
            disabled={skipped}
            onChange={(e) => onBodyChange(e.target.value)}
            rows={4}
          />
          <button
            type="button"
            onClick={onSkip}
            className={["link-quiet", skipped ? "is-active" : ""].join(" ")}
          >
            {skipLabel}
          </button>
        </div>
      }
    />
  );
}
