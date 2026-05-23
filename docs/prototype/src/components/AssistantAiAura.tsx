import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { auraDrawScale, portraitDiameterPx } from "../lib/auraScale";
import { updateActiveBuds, type ActiveBud } from "./assistantAuraBuds";
import { paintAssistantAura } from "./assistantAiAuraDraw";

export interface AuraPortrait {
  src: string;
  alt: string;
}

interface Props {
  portrait: AuraPortrait;
  className?: string;
  /** 0–1 reveal gate; fades in when raised and the image has loaded. */
  portraitOpacity?: number;
}

const PORTRAIT_FADE_S = 0.5;

/** Thick AI ring with Lisa painted on the same canvas as the buds. */
export function AssistantAiAura({
  portrait,
  className = "",
  portraitOpacity = 1,
}: Props) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const startRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0, portraitR: 0, drawScale: 1 });
  const budsRef = useRef<ActiveBud[]>([]);
  const ringWidthScaleRef = useRef(1);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const portraitAlphaRef = useRef(0);
  const portraitTargetRef = useRef(0);
  const fadeFromRef = useRef(0);
  const fadeStartRef = useRef(0);

  const revealTarget = portraitOpacity * (imageReady ? 1 : 0);

  useEffect(() => {
    fadeFromRef.current = portraitAlphaRef.current;
    fadeStartRef.current = performance.now();
    portraitTargetRef.current = revealTarget;
  }, [revealTarget]);

  useEffect(() => {
    let cancelled = false;
    setImageReady(false);
    imageRef.current = null;

    const img = new Image();
    img.decoding = "async";
    img.src = portrait.src;

    const apply = () => {
      if (cancelled) return;
      imageRef.current = img;
      setImageReady(true);
    };

    img.onload = apply;
    if (img.complete) apply();

    return () => {
      cancelled = true;
      img.onload = null;
    };
  }, [portrait.src]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const readRingWidthScale = () => {
      const raw = getComputedStyle(root)
        .getPropertyValue("--aura-ring-width-scale")
        .trim();
      const v = parseFloat(raw);
      ringWidthScaleRef.current = Number.isFinite(v) && v > 0 ? v : 1;
    };

    const resize = () => {
      readRingWidthScale();
      const rect = root.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height, 1);
      const px = Math.ceil(size);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (canvas.width !== px * dpr || canvas.height !== px * dpr) {
        canvas.width = px * dpr;
        canvas.height = px * dpr;
        canvas.style.width = `${px}px`;
        canvas.style.height = `${px}px`;
      }
      const layoutScale = rect.width > 0 ? px / rect.width : 1;
      const portraitD = portraitDiameterPx(root);
      const portraitR = (portraitD / 2) * layoutScale;
      const drawScale = auraDrawScale(root, portraitR);
      sizeRef.current = { w: px, h: px, portraitR, drawScale };
    };

    const samplePortraitAlpha = (now: number) => {
      const target = portraitTargetRef.current;
      if (reduceMotion) {
        portraitAlphaRef.current = target;
        return;
      }
      const elapsed = (now - fadeStartRef.current) / 1000;
      const t = Math.min(elapsed / PORTRAIT_FADE_S, 1);
      const eased = 1 - (1 - t) ** 3;
      portraitAlphaRef.current =
        fadeFromRef.current + (target - fadeFromRef.current) * eased;
    };

    const drawFrame = (now: number) => {
      if (!running) return;
      if (!startRef.current) startRef.current = now;

      resize();
      samplePortraitAlpha(now);

      const { w, h, portraitR, drawScale } = sizeRef.current;
      if (w <= 0 || h <= 0 || portraitR <= 0) return;

      const elapsed = (now - startRef.current) / 1000;
      const breathe = reduceMotion
        ? 0.5
        : 0.5 + 0.5 * Math.sin(elapsed * 1.15);

      const animate = !reduceMotion;
      budsRef.current = updateActiveBuds(budsRef.current, elapsed, animate);

      const img = imageRef.current;
      const showWelcomeInset = root.classList.contains("welcome-intro-avatar");

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
        ringWidthScaleRef.current,
        img
          ? {
              image: img,
              opacity: portraitAlphaRef.current,
              showWelcomeInset,
            }
          : undefined,
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
  }, [reduceMotion, portrait.src]);

  return (
    <div
      ref={rootRef}
      className={["assistant-ai-aura", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={portrait.alt}
      style={
        {
          "--aura-portrait-opacity": portraitOpacity,
        } as CSSProperties
      }
    >
      <canvas
        ref={canvasRef}
        className="assistant-ai-aura-canvas"
        aria-hidden
      />
    </div>
  );
}
