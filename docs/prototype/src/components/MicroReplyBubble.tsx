import type { AssistantGesture } from "../lib/assistantGestures";
import { confirmationHoldMs } from "../lib/timing";
import { AssistantAiAura } from "./AssistantAiAura";
import { AnimatedReplyText } from "./AnimatedReplyText";
import { ReplyLoadingDots } from "./ReplyLoadingDots";
import { ReplyWaitProgress } from "./ReplyWaitProgress";

interface Props {
  gesture: AssistantGesture | null;
  loading: boolean;
  message: string | null;
}

/** Brief ack — same Lisa stack as welcome (avatar arriba, copy abajo en móvil). */
export function MicroReplyBubble({
  gesture,
  loading,
  message,
}: Props) {
  const holdMs = message ? confirmationHoldMs(message) : 0;

  return (
    <div className="micro-reply-stage">
      <div
        className="welcome-intro-speech micro-reply-speech"
        aria-live="polite"
        aria-busy={loading}
      >
        {gesture && (
          <AssistantAiAura
            className="welcome-intro-avatar micro-reply-avatar"
            portrait={{ src: gesture.src, alt: gesture.label }}
          />
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
    </div>
  );
}
