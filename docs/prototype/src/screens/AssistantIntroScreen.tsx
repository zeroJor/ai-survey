import { motion, useReducedMotion } from "framer-motion";
import {
  BootstrapAuraDock,
  type BootstrapPhase,
} from "../components/BootstrapAuraDock";
import { AdvanceButton } from "../components/AdvanceButton";
import { RichText } from "../components/RichText";
import { gestureById } from "../lib/assistantGestures";
import { EASE_OUT } from "../lib/motion";

interface Props {
  message: string;
  ctaLabel: string;
  onStart: () => void;
  bootstrapPhase: BootstrapPhase;
  onDocked: () => void;
}

const WELCOME_GESTURE = gestureById("smile");

const COPY_FADE_DURATION_S = 0.7;

/** Welcome — ring docks first; Lisa + copy appear only when at rest. */
export function AssistantIntroScreen({
  message,
  ctaLabel,
  onStart,
  bootstrapPhase,
  onDocked,
}: Props) {
  const reduceMotion = useReducedMotion();
  const ringAtRest = bootstrapPhase === "ready";

  const speech = (
    <div className="welcome-intro-speech">
      <BootstrapAuraDock
        phase={bootstrapPhase}
        onDocked={onDocked}
        portrait={{
          src: WELCOME_GESTURE.src,
          alt: WELCOME_GESTURE.label,
        }}
      />
      {ringAtRest ? (
        <motion.div
          className="welcome-intro-copy-reveal"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: COPY_FADE_DURATION_S,
            ease: EASE_OUT,
          }}
        >
          <RichText
            as="h1"
            className="welcome-intro-title !normal-case"
            text={message}
          />
          <button
            type="button"
            className="welcome-intro-cta welcome-intro-cta--inline"
            onClick={onStart}
          >
            {ctaLabel}
          </button>
        </motion.div>
      ) : (
        <div
          className="welcome-intro-copy-reveal welcome-intro-copy-reveal--hidden"
          aria-hidden
        >
          <RichText
            as="h1"
            className="welcome-intro-title !normal-case"
            text={message}
          />
          <button
            type="button"
            tabIndex={-1}
            className="welcome-intro-cta welcome-intro-cta--inline"
          >
            {ctaLabel}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={["welcome-intro-stage", ringAtRest ? "welcome-intro-stage--advance" : ""].join(" ")}>
      {speech}
      {ringAtRest && (
        <AdvanceButton
          onClick={onStart}
          label={ctaLabel}
          showEdgeChevron={false}
        />
      )}
    </div>
  );
}
