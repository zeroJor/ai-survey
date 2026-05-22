import logoIdwasoft from "../assets/logo-idwasoft.svg";
import patternDots from "../assets/pattern.svg";
import { assistantPortraitUrls } from "./assistantGestures";
import { APP_BOOTSTRAP_MS } from "./timing";

const STATIC_ASSETS = [logoIdwasoft, patternDots] as const;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

/** Prototype: parallel image preload (Lisa portraits + chrome). */
export function preloadInterviewAssets(): Promise<void> {
  const urls = [...new Set([...assistantPortraitUrls(), ...STATIC_ASSETS])];
  return Promise.all(urls.map((src) => preloadImage(src))).then(() => undefined);
}

/** Prototype: stand-in for GET /api/talk bootstrap. */
export function simulateTalkBootstrap(): Promise<void> {
  return delay(900 + Math.floor(Math.random() * 500));
}

/**
 * Waits for assets + mock API, enforcing a minimum splash duration.
 */
export async function runAppBootstrap(): Promise<void> {
  const started = performance.now();
  await Promise.all([preloadInterviewAssets(), simulateTalkBootstrap()]);
  const remaining = APP_BOOTSTRAP_MS - (performance.now() - started);
  if (remaining > 0) await delay(remaining);
}
