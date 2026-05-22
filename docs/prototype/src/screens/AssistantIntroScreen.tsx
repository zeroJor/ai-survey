import { motion, useReducedMotion } from "framer-motion";
import { AURA_LAYOUT_ID } from "../components/InitialLoader";
import { AssistantAiAura } from "../components/AssistantAiAura";
import { AssistantAvatar } from "../components/AssistantAvatar";
import { RichText } from "../components/RichText";
import { gestureById } from "../lib/assistantGestures";

const HANDOFF_EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  message: string;
  ctaLabel: string;
  onStart: () => void;
  /** Ring flies in from bootstrap loader; copy staggers after. */
  bootstrapHandoff?: boolean;
}

const WELCOME_GESTURE = gestureById("smile");

/** Welcome — light shell, avatar + copy + CTA (same flow as rest of interview). */
export function AssistantIntroScreen({
  message,
  ctaLabel,
  onStart,
  bootstrapHandoff = false,
}: Props) {
  const reduceMotion = useReducedMotion();

  const avatar = bootstrapHandoff ? (
    <motion.div
      layoutId={AURA_LAYOUT_ID}
      className="welcome-intro-avatar-wrap"
      transition={{
        layout: { duration: 0.92, ease: HANDOFF_EASE },
      }}
    >
      <AssistantAiAura className="welcome-intro-avatar">
        <motion.div
          className="welcome-intro-portrait-reveal"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.4,
            duration: 0.55,
            ease: HANDOFF_EASE,
          }}
        >
          <AssistantAvatar gesture={WELCOME_GESTURE} size="lg" />
        </motion.div>
      </AssistantAiAura>
    </motion.div>
  ) : (
    <AssistantAiAura className="welcome-intro-avatar">
      <AssistantAvatar gesture={WELCOME_GESTURE} size="lg" />
    </AssistantAiAura>
  );

  const copy = bootstrapHandoff ? (
    <motion.div
      className="welcome-intro-copy-reveal"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.5,
        duration: 0.7,
        ease: HANDOFF_EASE,
      }}
    >
      <RichText
        as="h1"
        className="welcome-intro-title !normal-case"
        text={message}
      />
      <button type="button" className="welcome-intro-cta" onClick={onStart}>
        {ctaLabel}
      </button>
    </motion.div>
  ) : (
    <>
      <RichText
        as="h1"
        className="welcome-intro-title !normal-case"
        text={message}
      />
      <button type="button" className="welcome-intro-cta" onClick={onStart}>
        {ctaLabel}
      </button>
    </>
  );

  const speech = (
    <div className="welcome-intro-speech">
      {avatar}
      {copy}
    </div>
  );

  return (
    <div className="welcome-intro-stage">
      {reduceMotion || bootstrapHandoff ? (
        speech
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: HANDOFF_EASE }}
        >
          {speech}
        </motion.div>
      )}
    </div>
  );
}
