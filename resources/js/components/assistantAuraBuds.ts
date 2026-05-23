export interface ActiveBud {
  angle: number;
  /** Desfase para deriva angular (no afecta el ciclo de empuje) */
  phase: number;
  profileIdx: number;
  cycleScale: number;
  driftAmp: number;
  driftSpeed: number;
  bornAt: number;
}

export const BUD_CYCLE_S = 5.5;

const MAX_BUDS = 4;
const COUNT_EPOCH_S = 6.2;
const MIN_SEPARATION = 0.42;

function hashInt(n: number): number {
  return Math.abs(Math.floor(Math.sin(n * 12.9898 + 78.233) * 43758.5453));
}

function angleSep(a: number, b: number): number {
  let d = Math.abs(a - b);
  if (d > Math.PI) d = Math.PI * 2 - d;
  return d;
}

export function budCycleDuration(bud: ActiveBud): number {
  return BUD_CYCLE_S * bud.cycleScale;
}

/** Objetivo de gotas simultáneas (1–4), cambia cada ~6s */
function targetBubbleCount(t: number): number {
  const epoch = Math.floor(t / COUNT_EPOCH_S);
  return 1 + (hashInt(epoch * 17 + 3) % MAX_BUDS);
}

function spawnBud(t: number, existing: ActiveBud[]): ActiveBud {
  for (let attempt = 0; attempt < 16; attempt++) {
    const angle = Math.random() * Math.PI * 2;
    const farEnough = existing.every(
      (b) => angleSep(angle, b.angle) >= MIN_SEPARATION,
    );
    if (farEnough || existing.length === 0) {
      return {
        angle,
        phase: Math.random() * Math.PI * 2,
        profileIdx: Math.floor(Math.random() * 4),
        cycleScale: 0.9 + Math.random() * 0.14,
        driftAmp: 0.07 + Math.random() * 0.14,
        driftSpeed: 0.055 + Math.random() * 0.07,
        bornAt: t,
      };
    }
  }

  return {
    angle: Math.random() * Math.PI * 2,
    phase: Math.random() * Math.PI * 2,
    profileIdx: Math.floor(Math.random() * 4),
    cycleScale: 0.95 + Math.random() * 0.1,
    driftAmp: 0.1,
    driftSpeed: 0.08,
    bornAt: t,
  };
}

/** Máx. 4 gotas; cada una vive un ciclo completo (sale y vuelve a fusionarse) */
export function updateActiveBuds(
  buds: ActiveBud[],
  t: number,
  animate: boolean,
): ActiveBud[] {
  if (!animate) return [];

  let next = buds.filter((b) => t - b.bornAt < budCycleDuration(b));
  const target = targetBubbleCount(t);

  while (next.length < target && next.length < MAX_BUDS) {
    next = [...next, spawnBud(t, next)];
  }

  return next;
}
