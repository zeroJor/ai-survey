# LLM integration

**Last updated:** 2026-05-22

---

## Feature toggle

LLM is a **studio feature** that can be turned **on or off anytime** from admin (`Settings.llmEnabled`).

| `llmEnabled` | Behavior |
|--------------|----------|
| `true` | Use configured `LlmClient` implementation (Gemini Flash for MVP) |
| `false` | **No external API calls** — template fallbacks only for micro-reply, farewell, and studio summary |

Toggle applies **immediately** to new API calls (not retroactive to past `ai_messages`).

When disabled, still write `ai_messages` rows with `source: template` (optional metadata) so the admin thread stays consistent.

---

## Micro-reply response shape

`microReply` returns structured output (JSON), not plain text:

```json
{
  "text": "Qué buen detalle — eso ayuda mucho.",
  "sentimentId": "smile"
}
```

| Field | Rules |
|-------|--------|
| `text` | One short sentence; register from request (`tu` / `usted`) |
| `sentimentId` | Must be one of the v1 ids in [assistant-expression.md](../requierements/assistant-expression.md) §2 |

Client resolves `sentimentId` + register → asset path via `content/assistant/sentiments.json`. Invalid id → `atenta`.

Template fallback: each template line carries `sentimentId`; map answers using §2.1 when LLM is off. Prototype preview uses random portraits only — not production rules.

### Micro-reply copy rules (prompt)

Include in the fixed system prompt for `microReply`:

1. **Acknowledge only** — no new questions, no advice, no sales pitch.
2. **Register** — strict tú vs usted per `MicroReplyRequest.register`.
3. **Sentiment** — pick one id; avatar and tone must align (warmth → `smile`, doubt → `think`, etc.).
4. **Optional echo** — *when appropriate*, weave **one** word or short phrase from the client’s current answer (e.g. business type, product, place). If nothing fits, use a generic ack. Never echo on skip/sensitive answers.
5. **Length** — max one sentence; target ≤ 12–14 words in Spanish.

**Echo examples for prompt few-shot**

```text
Answer (tu): "Vendemos flores para eventos y bodas."
→ { "text": "¡Qué bello negocio con las flores!", "sentimentId": "smile" }

Answer (usted): "Vendemos flores para eventos y bodas."
→ { "text": "Un enfoque muy claro con las flores para eventos.", "sentimentId": "smile" }

Answer (tu): "Prefiero no contestar."
→ { "text": "Sin problema, seguimos.", "sentimentId": "atenta" }
```

Do **not** require echo on every reply — model should default to generic acknowledgment when mirroring would feel forced.

---

## Pattern

```text
App\Contracts\LlmClient
  ├── microReply(MicroReplyRequest): MicroReplyResponse
  ├── farewell(FarewellRequest): string
  └── studioPrepSummary(StudioPrepRequest): InterviewArtifactPayload

App\Services\Llm\LlmGateway
  └── if (!Settings::current().llmEnabled) → TemplateLlmClient
      else → GeminiFlashLlmClient (MVP binding)
```

- Swap drivers in `config/llm.php` + service container.
- **Never** call the provider from controllers directly — always through `LlmGateway`.

---

## MVP implementation: Google Gemini Flash

| Setting | Value |
|---------|--------|
| Driver key | `gemini` |
| Model | `gemini-2.0-flash` (or latest Flash stable id) |
| Why | Fast, low cost, good Spanish, workable free tier for low volume |

**Env:** `GEMINI_API_KEY`, optional `LLM_TIMEOUT_MS` (e.g. `2500`).

**Alternatives later:** `groq`, `openai` — same interface, new class.

---

## Token budget (free / low-cost)

| Method | Input | `max_output_tokens` |
|--------|--------|---------------------|
| `microReply` | Register, question label, **current answer only**, closed `sentimentId` list in prompt | **48** (text + id; tune in implementation) |
| `farewell` | Register, contact name, business name | **80** |
| `studioPrepSummary` | Compact Q&A list (codes + answers), invite meta, `studioProcess` | **600–800** |

**Do not send** full conversation history on micro-reply. **One** summary call at complete.

System prompts: short, fixed; reuse across calls (use provider prompt caching if available).

---

## Call sites

| Call site | Method | When LLM off |
|-----------|--------|--------------|
| `POST /api/answers` | `microReply` | Random/rotating template from `content/training/micro-replies/` |
| `POST /api/talk/complete` | `farewell` | Static template (tú/usted variants) — **no Gemini in MVP** |
| `POST /api/admin/interviews/{id}/generate-summary` | `studioPrepSummary` | Full JSON sections; requires `llm_enabled` |

---

## Fallback (when LLM on)

Timeout or API error → same templates as LLM off. **Never** block saving the client answer.

No automatic retry in MVP (saves tokens and latency).

---

## Admin

- `GET /api/admin/settings` includes `llmEnabled`.
- `PATCH /api/admin/settings` can set `llmEnabled: true | false`.
- Optional: show last error / quota hint in admin when enabled (later).

---

## Config file sketch (`config/llm.php`)

```php
'default' => env('LLM_DRIVER', 'gemini'),
'timeout_ms' => (int) env('LLM_TIMEOUT_MS', 2500),
'drivers' => [
    'gemini' => [
        'model' => env('GEMINI_MODEL', 'gemini-2.0-flash'),
        'api_key' => env('GEMINI_API_KEY'),
    ],
],
'limits' => [
    'micro_reply' => 48,
    'farewell' => 80,
    'studio_prep_summary' => 700,
],
```
