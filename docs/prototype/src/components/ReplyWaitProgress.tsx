import { useReducedMotion } from "framer-motion";

interface Props {
  durationMs: number;
  phaseKey: string;
}

/** Thin line under confirmation copy — shrinks over the wait until next step */
export function ReplyWaitProgress({ durationMs, phaseKey }: Props) {
  const reduceMotion = useReducedMotion();
  const seconds = Math.max(durationMs / 1000, 0.3);

  return (
    <div
      className="reply-wait"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Tiempo hasta el siguiente paso"
    >
      <div className="reply-wait-track">
        <div
          key={phaseKey}
          className="reply-wait-fill"
          style={
            reduceMotion
              ? { transform: "scaleX(0.35)" }
              : { animationDuration: `${seconds}s` }
          }
        />
      </div>
    </div>
  );
}
