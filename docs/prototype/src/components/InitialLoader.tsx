import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { AssistantAiAura } from "./AssistantAiAura";

const AURA_LAYOUT_ID = "bootstrap-ai-aura";

const HANDOFF_EASE = [0.22, 1, 0.36, 1] as const;

interface Props {
  exiting: boolean;
  /** Animate ring into welcome intro avatar (default path only). */
  auraHandoff: boolean;
  onExited: () => void;
}

/** Full-screen splash — AI ring while bootstrap (API + assets) runs. */
export function InitialLoader({ exiting, auraHandoff, onExited }: Props) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!exiting || !reduceMotion) return;
    const t = window.setTimeout(onExited, 320);
    return () => window.clearTimeout(t);
  }, [exiting, onExited, reduceMotion]);

  const aura = (
    <AssistantAiAura className="initial-loader-aura">
      <span className="initial-loader-core" aria-hidden />
    </AssistantAiAura>
  );

  const auraHost = auraHandoff ? (
    <motion.div
      layoutId={AURA_LAYOUT_ID}
      className="initial-loader-aura-host"
      transition={{
        layout: { duration: 0.92, ease: HANDOFF_EASE },
      }}
    >
      {aura}
    </motion.div>
  ) : (
    <div className="initial-loader-aura-host initial-loader-aura-host--center">
      {aura}
    </div>
  );

  return (
    <motion.div
      className="initial-loader"
      role="status"
      aria-live="polite"
      aria-busy={!exiting}
      aria-label="Cargando entrevista"
      initial={false}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.95,
        ease: HANDOFF_EASE,
      }}
      onAnimationComplete={() => {
        if (exiting && !reduceMotion) onExited();
      }}
    >
      <motion.div
        className="initial-loader-backdrop"
        aria-hidden
        initial={false}
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{
          duration: reduceMotion ? 0.2 : 0.85,
          ease: HANDOFF_EASE,
        }}
      />
      {auraHost}
    </motion.div>
  );
}

export { AURA_LAYOUT_ID };
