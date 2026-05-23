import { stripHighlightMarkers } from "../lib/text";
import { AnimatedReplyText } from "./AnimatedReplyText";
import { RichText } from "./RichText";

interface Props {
  kicker: string;
  text: string;
  animate?: boolean;
}

/** Left-column confirmation / transition copy */
export function ConfirmationMessage({
  kicker,
  text,
  animate = true,
}: Props) {
  const plain = stripHighlightMarkers(text);

  return (
    <div className="micro-reply-stage">
      <p className="section-label">
        <span className="accent-square" aria-hidden />
        {kicker}
      </p>
      {animate ? (
        <AnimatedReplyText key={plain} text={plain} />
      ) : (
        <RichText as="p" className="reply-text" text={text} />
      )}
    </div>
  );
}
