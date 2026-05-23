import type { Variants } from "framer-motion";

/** CSS ease-out — rápido al salir, suave al llegar (aterrizaje del anillo, etc.). */
export const EASE_OUT: [number, number, number, number] = [0, 0, 0.2, 1];

/** Simple, elegant — opacity only */
export const pageVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.42, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
  },
};

export const reducedPageVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

