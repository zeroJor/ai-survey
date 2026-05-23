import { useState } from "react";
import type { Scenario } from '@/types/talk';

const scenarios: { id: Scenario; label: string }[] = [
  { id: "default", label: "Happy path" },
  { id: "in_progress", label: "Resume" },
  { id: "completed", label: "Completed" },
  { id: "revoked", label: "Revoked" },
  { id: "loading_answer", label: "Loading" },
  { id: "llm_off", label: "LLM off" },
  { id: "long_answer", label: "Long" },
  { id: "skip_answer", label: "Skip" },
];

interface Props {
  current: Scenario;
}

export function DevScenarioSwitcher({ current }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 top-4 z-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="border border-idwa-line bg-white px-2 py-1 font-body text-[10px] font-medium uppercase tracking-wider text-idwa-muted"
      >
        Dev
      </button>
      {open && (
        <div className="absolute right-0 mt-1 flex w-44 flex-col gap-1">
          <select
            className="border border-idwa-line bg-white px-2 py-1 font-body text-xs"
            value={current}
            onChange={(e) => {
              const url = new URL(window.location.href);
              if (e.target.value === "default") {
                url.searchParams.delete("scenario");
              } else {
                url.searchParams.set("scenario", e.target.value);
              }
              window.location.href = url.toString();
            }}
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="border border-idwa-line bg-white px-2 py-1 text-left font-body text-xs text-idwa-muted"
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.set("reset", "");
              url.searchParams.delete("scenario");
              window.location.href = url.toString();
            }}
          >
            Reiniciar respuestas
          </button>
        </div>
      )}
    </div>
  );
}
