import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  stepKey: string;
  children: ReactNode;
}

export function StepTransition({ stepKey, children }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stepKey}
        initial={false}
        animate={{ opacity: 1 }}
        exit={
          reduceMotion
            ? undefined
            : { opacity: 0, transition: { duration: 0.22 } }
        }
        transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.25, 0.1, 0.25, 1] }}
        className="step-panel"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
