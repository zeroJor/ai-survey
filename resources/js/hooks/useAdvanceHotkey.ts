import { useEffect } from "react";

function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLInputElement) {
    const type = target.type;
    return type === "text" || type === "search" || type === "email" || type === "";
  }
  return target.isContentEditable;
}

export function useAdvanceHotkey(onAdvance: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const inField = isTextField(event.target);

      if (event.key === "ArrowRight" && !inField) {
        event.preventDefault();
        onAdvance();
        return;
      }

      if (event.key === "Enter" && !event.shiftKey) {
        if (inField) {
          if (event.metaKey || event.ctrlKey) {
            event.preventDefault();
            onAdvance();
          }
          return;
        }
        event.preventDefault();
        onAdvance();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, onAdvance]);
}
