import { OptionCard } from "../components/OptionCard";
import { RichText } from "../components/RichText";
import { StepColumns } from "../components/StepColumns";
import type { InterviewContent, Register } from "../types";

interface Props {
  content: InterviewContent;
  selected: Register | null;
  onSelect: (value: Register) => void;
  onContinue: () => void;
}

export function ToneScreen({
  content,
  selected,
  onSelect,
  onContinue,
}: Props) {
  const { copy } = content;

  return (
    <StepColumns
      prompt={
        <div className="question-stage">
          <RichText as="h1" className="question-hero" text={copy.toneLead} />
        </div>
      }
      answers={
        <div className="step-answers-inner">
          <div className="choice-list">
            <OptionCard
              tag={copy.toneOptionTu}
              icon="casual"
              hint={copy.tonePreviewTu}
              selected={selected === "tu"}
              onSelect={() => onSelect("tu")}
            />
            <OptionCard
              tag={copy.toneOptionUsted}
              icon="formal"
              hint={copy.tonePreviewUsted}
              selected={selected === "usted"}
              onSelect={() => onSelect("usted")}
            />
          </div>
        </div>
      }
      advance={{
        onClick: onContinue,
        disabled: !selected,
        label: "Continuar",
      }}
    />
  );
}
