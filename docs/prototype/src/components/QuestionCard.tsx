import { useEffect, useMemo, useRef } from "react";
import { RichText } from "./RichText";
import { StepColumns } from "./StepColumns";

interface Props {
  label: string;
  hint?: string;
  body: string;
  skipLabel: string;
  continueLabel: string;
  onBodyChange: (value: string) => void;
  onContinue: () => void;
  continueDisabled?: boolean;
}

export function QuestionCard({
  label,
  hint,
  body,
  skipLabel,
  continueLabel,
  onBodyChange,
  onContinue,
  continueDisabled = false,
}: Props) {
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const hasText = body.trim().length > 0;
  const barLabel = useMemo(
    () => (hasText ? continueLabel : skipLabel),
    [hasText, continueLabel, skipLabel],
  );

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const id = requestAnimationFrame(() => {
      field.focus({ preventScroll: true });
      const end = field.value.length;
      field.setSelectionRange(end, end);
    });

    return () => cancelAnimationFrame(id);
  }, [label]);

  return (
    <StepColumns
      layout="question-fill"
      advance={{
        onClick: onContinue,
        disabled: continueDisabled,
        label: continueLabel,
        barLabel,
        skipLabel,
        showFloatingSkip: !hasText,
        edgeChevronProminent: hasText,
      }}
      prompt={
        <div className="question-stage">
          <RichText as="h1" className="question-hero" text={label} />
          {hint && <p className="question-hint">{hint}</p>}
        </div>
      }
      answers={
        <div className="step-answers-inner step-answers-inner--question">
          <textarea
            ref={fieldRef}
            className="answer-field answer-field--fill"
            placeholder="Escribe aquí…"
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
          />
        </div>
      }
    />
  );
}
