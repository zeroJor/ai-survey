import { RichText } from "../components/RichText";
import { StepColumns } from "../components/StepColumns";
import type { InterviewContent } from '@/types/talk';

interface Props {
  content: InterviewContent;
  onContinue: () => void;
}

function splitPrivacyDuration(duration: string) {
  const match = duration.match(/^(.+?)\s+(min)$/i);
  if (match) return { value: match[1], unit: match[2] };
  return { value: duration, unit: "" };
}

export function PrivacyScreen({ content, onContinue }: Props) {
  const { copy } = content;
  const { value, unit } = splitPrivacyDuration(copy.privacyDuration);

  return (
    <StepColumns
      advance={{ onClick: onContinue, label: copy.continueLabel }}
      prompt={
        <div className="question-stage">
          <RichText as="h1" className="question-hero" text={copy.privacyBody} />
          <a
            href={copy.privacyLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline"
          >
            {copy.privacyLinkLabel}
          </a>
        </div>
      }
      answers={
        <div className="step-answers-inner">
          <p className="stat-huge stat-huge-row !normal-case">
            <span className="stat-huge-value">{value}</span>
            {unit && <span className="stat-huge-unit">{unit}</span>}
          </p>
          <p className="copy-md mt-4">{copy.privacyDurationNote}</p>
        </div>
      }
    />
  );
}
