import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";
import { auraDrawScale } from "../lib/auraScale";
import { updateActiveBuds, type ActiveBud } from "./assistantAuraBuds";
import { paintAssistantAura } from "./assistantAiAuraDraw";

interface Props {
  children: ReactNode;
  className?: string;
}

/** Thick AI ring with subtle buds fused to the edge (canvas) */
export function AssistantAiAura({ children, className = "" }: Props) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const startRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0, portraitR: 0, drawScale: 1 });
  const budsRef = useRef<ActiveBud[]>([]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const resize = () => {
      const rect = root.getBoundingClientRect();
      const portraitEl = root.querySelector<HTMLElement>(
        ".assistant-ai-aura-portrait",
      );
      const portraitRect = portraitEl?.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height, 1);
      const px = Math.ceil(size);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== px * dpr || canvas.height !== px * dpr) {
        canvas.width = px * dpr;
        canvas.height = px * dpr;
        canvas.style.width = `${px}px`;
        canvas.style.height = `${px}px`;
      }
      const scale = rect.width > 0 ? px / rect.width : 1;
      const portraitR = portraitRect
        ? (Math.min(portraitRect.width, portraitRect.height) / 2) * scale
        : px * 0.18;
      const drawScale = auraDrawScale(root, portraitR);
      sizeRef.current = { w: px, h: px, portraitR, drawScale };
    };

    const drawFrame = (now: number) => {
      if (!running) return;
      if (!startRef.current) startRef.current = now;

      resize();
      const { w, h, portraitR, drawScale } = sizeRef.current;
      if (w <= 0 || h <= 0 || portraitR <= 0) return;

      const elapsed = (now - startRef.current) / 1000;
      const breathe = reduceMotion
        ? 0.5
        : 0.5 + 0.5 * Math.sin(elapsed * 1.15);

      const animate = !reduceMotion;
      budsRef.current = updateActiveBuds(budsRef.current, elapsed, animate);
      paintAssistantAura(
        ctx,
        w,
        h,
        elapsed,
        breathe,
        portraitR,
        budsRef.current,
        animate,
        drawScale,
      );

      if (!reduceMotion) {
        frameRef.current = requestAnimationFrame(drawFrame);
      }
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(root);
    resize();
    frameRef.current = requestAnimationFrame(drawFrame);

    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, [reduceMotion]);

  return (
    <div
      ref={rootRef}
      className={["assistant-ai-aura", className].filter(Boolean).join(" ")}
    >
      <canvas
        ref={canvasRef}
        className="assistant-ai-aura-canvas"
        aria-hidden
      />
      <div className="assistant-ai-aura-portrait">{children}</div>
    </div>
  );
}
