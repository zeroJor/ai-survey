import type { ActiveBud } from "./assistantAuraBuds";

/** --accent-ink anillo · --accent brillo del degradado AI */
const RING_PRIMARY: [number, number, number] = [0, 119, 255];
const RING_ACCENT: [number, number, number] = [0, 180, 255];
const RING_SHIMMER = 0.38;

/** Altura, apertura en el anillo y redondez del domo */
interface BudProfile {
  peak: number;
  mergeWidth: number;
  domeWidth: number;
  domePower: number;
  capGain: number;
  neckGain: number;
}

const BUD_PROFILES: BudProfile[] = [
  { peak: 1.08, mergeWidth: 0.72, domeWidth: 0.3, domePower: 6, capGain: 11, neckGain: 1.7 },
  { peak: 0.88, mergeWidth: 1.2, domeWidth: 0.56, domePower: 3, capGain: 4.2, neckGain: 3.9 },
  { peak: 1.02, mergeWidth: 0.84, domeWidth: 0.34, domePower: 5, capGain: 8.5, neckGain: 2.3 },
  { peak: 0.94, mergeWidth: 1.06, domeWidth: 0.48, domePower: 4, capGain: 5.5, neckGain: 3.2 },
];

import { BUD_CYCLE_S } from "./assistantAuraBuds";

/** Ring band thickness and bud reach at welcome reference scale (drawScale = 1). */
const RING_WIDTH_AT_REF = 5;
const BUD_NECK_FLOOR_AT_REF = 1.5;
const RING_SEGMENTS = 128;
const RING_ROTATION = 0.1;

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
}

function easeOutCubic(x: number): number {
  return 1 - (1 - x) ** 3;
}

function waterEmerge(t: number, phase: number, cycleScale = 1): number {
  const period = BUD_CYCLE_S * cycleScale;
  const cycle = ((t + phase) % period) / period;
  const pushRatio = 0.62;

  if (cycle < pushRatio) {
    return easeInOutCubic(cycle / pushRatio);
  }
  return 1 - easeOutCubic((cycle - pushRatio) / (1 - pushRatio));
}

function rgba(rgb: [number, number, number], a: number) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
}

function angleDelta(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function angularBell(delta: number, width: number, power = 3): number {
  const x = Math.abs(delta) / width;
  if (x >= 1) return 0;
  const c = Math.cos(x * Math.PI * 0.5);
  return c ** power;
}

function budTheta(bud: ActiveBud, t: number): number {
  return (
    bud.angle +
    bud.driftAmp * Math.sin(t * bud.driftSpeed + bud.phase) +
    bud.driftAmp * 0.28 * Math.sin(t * bud.driftSpeed * 2.4 + bud.phase * 0.7)
  );
}

function outerFluidRadius(
  angle: number,
  portraitR: number,
  ringWidth: number,
  t: number,
  buds: ActiveBud[],
  drawScale: number,
): number {
  const base = portraitR + ringWidth;
  let protrusion = 0;

  for (const bud of buds) {
    const profile = BUD_PROFILES[bud.profileIdx % BUD_PROFILES.length]!;
    const theta = budTheta(bud, t);
    const elapsed = t - bud.bornAt;
    const emerge = waterEmerge(elapsed, 0, bud.cycleScale);
    const morph = 0.96 + 0.05 * Math.sin(elapsed * 0.16 + bud.phase * 0.4);
    const stretch = emerge * emerge * profile.peak * morph;
    const delta = angleDelta(angle, theta);

    const mergeW =
      profile.mergeWidth *
      (0.97 + 0.05 * Math.sin(elapsed * 0.12 + bud.phase));
    const domeW =
      profile.domeWidth *
      (0.96 + 0.06 * Math.cos(elapsed * 0.14 + bud.phase * 0.6));
    const capGain =
      profile.capGain * (0.94 + 0.08 * Math.sin(elapsed * 0.2 + bud.phase * 1.2));

    const merge = angularBell(delta, mergeW, 2);
    const dome = angularBell(delta, domeW, profile.domePower);
    const neck =
      (BUD_NECK_FLOOR_AT_REF * drawScale + stretch * profile.neckGain * drawScale) *
      merge;
    const cap = stretch * capGain * drawScale * dome;

    protrusion = Math.max(protrusion, neck + cap);
  }

  return base + protrusion;
}

function traceFluidRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  portraitR: number,
  ringWidth: number,
  t: number,
  buds: ActiveBud[],
  drawScale: number,
) {
  const n = RING_SEGMENTS;

  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = outerFluidRadius(a, portraitR, ringWidth, t, buds, drawScale);
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  for (let i = n; i >= 0; i--) {
    const a = (i / n) * Math.PI * 2;
    ctx.lineTo(cx + Math.cos(a) * portraitR, cy + Math.sin(a) * portraitR);
  }

  ctx.closePath();
}

export function paintAssistantAura(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  breathe: number,
  portraitR: number,
  buds: ActiveBud[],
  animate = true,
  drawScale = 1,
  ringWidthScale = 1,
) {
  const dpr = width > 0 ? ctx.canvas.width / width : 1;
  const cx = width / 2;
  const cy = height / 2;
  const s = drawScale > 0 ? drawScale : 1;
  const ringBoost = ringWidthScale > 0 ? ringWidthScale : 1;
  const ringWidth = RING_WIDTH_AT_REF * s * ringBoost;
  const pulse = 1 + breathe * 0.02;
  const rInner = portraitR * pulse;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.shadowBlur = 0;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(animate ? t * RING_ROTATION : 0);
  ctx.translate(-cx, -cy);

  ctx.beginPath();
  traceFluidRing(ctx, cx, cy, rInner, ringWidth, t, buds, s);

  const conic = ctx.createConicGradient(
    animate ? t * RING_SHIMMER : 0,
    cx,
    cy,
  );
  conic.addColorStop(0, rgba(RING_PRIMARY, 1));
  conic.addColorStop(0.38, rgba(RING_PRIMARY, 1));
  conic.addColorStop(0.5, rgba(RING_ACCENT, 0.72));
  conic.addColorStop(0.62, rgba(RING_PRIMARY, 1));
  conic.addColorStop(1, rgba(RING_PRIMARY, 1));
  ctx.fillStyle = conic;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
  ctx.strokeStyle = rgba(RING_ACCENT, 0.4);
  ctx.lineWidth = Math.max(0.5, RING_WIDTH_AT_REF * 0.2 * s * ringBoost);
  ctx.stroke();

  ctx.restore();

  ctx.restore();
}
