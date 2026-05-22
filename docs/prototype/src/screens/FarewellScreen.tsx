import { motion, useReducedMotion } from "framer-motion";
import { AssistantAiAura } from "../components/AssistantAiAura";
import { AssistantAvatar } from "../components/AssistantAvatar";
import { RichText } from "../components/RichText";
import { gestureById } from "../lib/assistantGestures";

interface Props {
  message: string;
}

const FAREWELL_GESTURE = gestureById("smile");

export function FarewellScreen({ message }: Props) {
  const reduceMotion = useReducedMotion();

  const speech = (
    <div className="welcome-intro-speech farewell-speech">
      <AssistantAiAura className="welcome-intro-avatar">
        <AssistantAvatar gesture={FAREWELL_GESTURE} size="lg" />
      </AssistantAiAura>
      <div className="farewell-copy">
        <RichText
          as="p"
          className="welcome-intro-title !normal-case"
          text={message}
        />
      </div>
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
