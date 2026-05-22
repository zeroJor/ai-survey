import { motion, useReducedMotion } from "framer-motion";
import { AssistantAiAura } from "../components/AssistantAiAura";
import { AssistantAvatar } from "../components/AssistantAvatar";
import { RichText } from "../components/RichText";
import { gestureById } from "../lib/assistantGestures";

interface Props {
  message: string;
  ctaLabel: string;
  onStart: () => void;
}

const WELCOME_GESTURE = gestureById("smile");

/** Welcome — light shell, avatar + copy + CTA (same flow as rest of interview). */
export function AssistantIntroScreen({ message, ctaLabel, onStart }: Props) {
  const reduceMotion = useReducedMotion();

  const speech = (
    <div className="welcome-intro-speech">
      <AssistantAiAura className="welcome-intro-avatar">
        <AssistantAvatar gesture={WELCOME_GESTURE} size="lg" />
      </AssistantAiAura>
      <RichText
        as="h1"
        className="welcome-intro-title !normal-case"
        text={message}
      />
      <button type="button" className="welcome-intro-cta" onClick={onStart}>
        {ctaLabel}
      </button>
    </div>
  );

  return (
    <div className="welcome-intro-stage">
      {reduceMotion ? (
        speech
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {speech}
        </motion.div>
      )}
    </div>
  );
}
