/** Design-time welcome portrait radius at max type (2.35 × 3.75rem ÷ 2 @ 16px root). */
export const AURA_REF_PORTRAIT_RADIUS_PX = 70.5;

/** Resolves `--aura-portrait` on the aura host to pixels. */
export function portraitDiameterPx(host: HTMLElement): number {
  const size = getComputedStyle(host).getPropertyValue("--aura-portrait").trim();
  if (!size) return 0;

  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.width = size;
  probe.style.height = size;
  host.appendChild(probe);
  const px = probe.getBoundingClientRect().width;
  host.removeChild(probe);
  return px;
}

/** @deprecated Use {@link portraitDiameterPx}. */
export function refPortraitDiameterPx(host: HTMLElement): number {
  return portraitDiameterPx(host);
}

/**
 * Visual scale for ring width and bud protrusion vs. welcome intro (1).
 * `portraitRadiusPx` must be in the same pixel space as the canvas layout.
 */
export function auraDrawScale(
  host: HTMLElement,
  portraitRadiusPx: number,
): number {
  if (portraitRadiusPx <= 0) return 1;

  if (host.classList.contains("welcome-intro-avatar")) {
    return 1;
  }

  let refRadiusPx = portraitDiameterPx(host) / 2;
  if (refRadiusPx <= 0) {
    refRadiusPx = AURA_REF_PORTRAIT_RADIUS_PX;
  }

  const manual = parseFloat(
    getComputedStyle(host).getPropertyValue("--aura-draw-scale"),
  );
  const boost = Number.isFinite(manual) && manual > 0 ? manual : 1;
  return (portraitRadiusPx / refRadiusPx) * boost;
}
