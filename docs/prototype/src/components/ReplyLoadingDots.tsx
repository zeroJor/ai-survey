import { useReducedMotion } from "framer-motion";

/** Three bouncing dots while Lisa's reply loads. */
export function ReplyLoadingDots() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="reply-loading-dots"
      role="status"
      aria-label="Lisa está respondiendo"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="reply-loading-dot"
          style={
            reduceMotion
              ? undefined
              : { animationDelay: `${i * 0.14}s` }
          }
        />
      ))}
    </div>
  );
}
