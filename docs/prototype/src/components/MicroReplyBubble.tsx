import type { AssistantGesture } from "../lib/assistantGestures";
import { confirmationHoldMs } from "../lib/timing";
import { AssistantAiAura } from "./AssistantAiAura";
import { AssistantAvatar } from "./AssistantAvatar";
import { AnimatedReplyText } from "./AnimatedReplyText";
import { ReplyLoadingDots } from "./ReplyLoadingDots";
import { ReplyWaitProgress } from "./ReplyWaitProgress";

interface Props {
  gesture: AssistantGesture | null;
  loading: boolean;
  message: string | null;
}

/** Brief ack on the left — letter-drop + wait line */
export function MicroReplyBubble({
  gesture,
  loading,
  message,
}: Props) {
  const holdMs = message ? confirmationHoldMs(message) : 0;

  return (
    <div
      className="micro-reply-stage micro-reply-layout"
      aria-live="polite"
      aria-busy={loading}
    >
      {gesture && (
        <div className="micro-reply-identity">
          <AssistantAiAura className="micro-reply-avatar">
            <AssistantAvatar gesture={gesture} size="lg" />
          </AssistantAiAura>
        </div>
      )}
      <div className="micro-reply-body">
        {loading ? (
          <ReplyLoadingDots />
        ) : (
          message && (
            <>
              <AnimatedReplyText key={message} text={message} />
              <ReplyWaitProgress
                durationMs={holdMs}
                phaseKey={`hold-${message}`}
              />
            </>
          )
        )}
      </div>
    </div>
  );
}
