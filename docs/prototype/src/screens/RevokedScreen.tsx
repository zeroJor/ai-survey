import { RichText } from "../components/RichText";
import { SectionIndicator } from "../components/SectionIndicator";
import type { InterviewContent } from "../types";

interface Props {
  content: InterviewContent;
}

export function RevokedScreen({ content }: Props) {
  return (
    <div className="micro-reply-stage">
      <SectionIndicator label="Enlace cerrado" />
      <RichText
        as="h1"
        className="question-hero"
        text={content.copy.revokedBody}
      />
    </div>
  );
}
