# LLM services

- `App\Contracts\LlmClient` — `microReply`, `farewell`, `studioPrepSummary`.
- `App\Services\Llm\TemplateLlmClient` — random line from template pools + random sentiment (skip → `atenta`); default when LLM off or on API failure.
- `App\Services\Llm\GeminiFlashLlmClient` — Google Gemini Flash via `GeminiApiClient`.
- `App\Services\Llm\LlmGateway` — routes by `settings.llm_enabled` + `GEMINI_API_KEY`.

Controllers must call `LlmGateway`, not a provider directly.

Prompts: `content/prompts/`. Sentiment catalog: `content/assistant/sentiments.json`.
