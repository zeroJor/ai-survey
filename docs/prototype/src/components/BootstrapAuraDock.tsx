import { motion, useReducedMotion } from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { EASE_OUT } from "../lib/motion";
import {
  AssistantAiAura,
  type AuraPortrait,
} from "./AssistantAiAura";

/** Small ring centered on screen during bootstrap load. */
const LOADER_CENTER_SCALE = 0.56;
const DOCK_DURATION_S = 1.08;

export type BootstrapPhase = "loading" | "docking" | "ready";

interface DockTransform {
  x: number;
  y: number;
}

interface Props {
  phase: BootstrapPhase;
  onDocked: () => void;
  portrait: AuraPortrait;
}

/**
 * One persistent AI aura (same canvas) for loader → welcome.
 * Lisa and the ring travel together from the first frame.
 */
export function BootstrapAuraDock({ phase, onDocked, portrait }: Props) {
  const reduceMotion = useReducedMotion();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [centerOffset, setCenterOffset] = useState<DockTransform>({ x: 0, y: 0 });

  const isLoading = phase === "loading";
  const isDocking = phase === "docking";
  const dockMotion = isDocking && !reduceMotion;

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const measure = () => {
      const slot = anchor.getBoundingClientRect();
      if (slot.width <= 0 || slot.height <= 0) return;

      const slotCx = slot.left + slot.width / 2;
      const slotCy = slot.top + slot.height / 2;

      setCenterOffset({
        x: window.innerWidth / 2 - slotCx,
        y: window.innerHeight / 2 - slotCy,
      });
    };

    measure();
    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(anchor);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useLayoutEffect(() => {
    if (!reduceMotion || phase !== "docking") return;
    const id = requestAnimationFrame(() => onDocked());
    return () => cancelAnimationFrame(id);
  }, [reduceMotion, phase, onDocked]);

  return (
    <div ref={anchorRef} className="welcome-intro-avatar-mount bootstrap-aura-anchor">
      <motion.div
        className="bootstrap-aura-dock__motion"
        initial={false}
        animate={{
          x: isLoading ? centerOffset.x : 0,
          y: isLoading ? centerOffset.y : 0,
          scale: isLoading ? LOADER_CENTER_SCALE : 1,
        }}
        transition={{
          duration: dockMotion ? DOCK_DURATION_S : 0,
          ease: EASE_OUT,
        }}
        onAnimationComplete={() => {
          if (!dockMotion) return;
          requestAnimationFrame(() => {
            requestAnimationFrame(() => onDocked());
          });
        }}
      >
        <AssistantAiAura
          portrait={portrait}
          portraitOpacity={isLoading ? 0 : 1}
          className={[
            "welcome-intro-avatar",
            isLoading ? "bootstrap-aura-dock__aura--loading" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </motion.div>
    </div>
  );
}
