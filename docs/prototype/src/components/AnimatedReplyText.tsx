import { motion, useReducedMotion } from "framer-motion";
import { CONFIRM_LETTER_STAGGER_MS } from "../lib/timing";

interface Props {
  text: string;
  className?: string;
  /** When false, letters stay hidden (re-animate on next true). Default: true. */
  play?: boolean;
}

function fallOffset(index: number) {
  return 18 + (index % 4) * 6;
}

function fallRotate(index: number) {
  return ((index * 5) % 9) - 4;
}

const hidden = (index: number) => ({
  opacity: 0,
  y: -fallOffset(index),
  rotate: fallRotate(index),
  scale: 0.72,
  filter: "blur(6px)",
});

const shown = {
  opacity: 1,
  y: 0,
  rotate: 0,
  scale: 1,
  filter: "blur(0px)",
};

export function AnimatedReplyText({
  text,
  className = "reply-text",
  play = true,
}: Props) {
  const reduceMotion = useReducedMotion();

  if (!text) return null;

  if (reduceMotion) {
    return (
      <p className={className} style={{ opacity: play ? 1 : 0 }}>
        {text}
      </p>
    );
  }

  const chars = [...text];

  return (
    <motion.p
      className={className}
      initial={false}
      aria-label={text}
      aria-hidden={!play}
    >
      {chars.map((char, index) => {
        const isSpace = char === " ";
        return (
          <motion.span
            key={`${index}-${char}`}
            className={isSpace ? undefined : "reply-letter"}
            style={{ display: isSpace ? "inline" : "inline-block" }}
            initial={hidden(index)}
            animate={play ? shown : hidden(index)}
            transition={{
              type: "spring",
              stiffness: 520,
              damping: 24,
              mass: 0.45,
              delay: play ? (index * CONFIRM_LETTER_STAGGER_MS) / 1000 : 0,
            }}
          >
            {isSpace ? " " : char}
          </motion.span>
        );
      })}
    </motion.p>
  );
}
