import { motion, useReducedMotion } from "framer-motion";
import type { AssistantGesture } from "../lib/assistantGestures";

interface Props {
  gesture: AssistantGesture;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZE_CLASS = {
  sm: "assistant-avatar assistant-avatar-sm",
  md: "assistant-avatar",
  lg: "assistant-avatar assistant-avatar-lg",
  xl: "assistant-avatar assistant-avatar-xl",
} as const;

const SIZE_PX = { sm: 32, md: 44, lg: 72, xl: 112 } as const;

/** Lisa — virtual assistant portrait; expression chosen per question. */
export function AssistantAvatar({ gesture, size = "md" }: Props) {
  const reduceMotion = useReducedMotion();
  const className = SIZE_CLASS[size];
  const px = SIZE_PX[size];

  if (reduceMotion) {
    return (
      <img
        src={gesture.src}
        alt={gesture.label}
        width={px}
        height={px}
        className={className}
        decoding="async"
      />
    );
  }

  return (
    <motion.img
      key={gesture.id}
      src={gesture.src}
      alt={gesture.label}
      width={px}
      height={px}
      className={className}
      decoding="async"
      initial={{ opacity: 0, scale: 0.92, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    />
  );
}
