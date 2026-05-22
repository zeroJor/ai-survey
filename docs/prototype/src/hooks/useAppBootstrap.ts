import { useEffect, useState } from "react";
import { runAppBootstrap } from "../lib/bootstrap";

export function useAppBootstrap(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void runAppBootstrap()
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
