import { motion, useReducedMotion } from "framer-motion";
import { ReplyWaitProgress } from "../components/ReplyWaitProgress";

interface Props {
  title: string;
  holdMs: number;
}

/** Section transition — title large and centered, then first question. */
export function PhaseIntroScreen({ title, holdMs }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="phase-intro-stage">
      {reduceMotion ? (
        <h1 className="phase-intro-title !normal-case">{title}</h1>
      ) : (
        <motion.h1
          className="phase-intro-title !normal-case"
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {title}
        </motion.h1>
      )}
      <ReplyWaitProgress durationMs={holdMs} phaseKey={`intro-${title}`} />
    </div>
  );
}
