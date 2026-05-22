# Content seed

**Last updated:** 2026-05-21  
**Source:** [plantilla-entrevista-descubrimiento.md](../plantilla-entrevista-descubrimiento.md)

---

## Goal

Populate `interview_templates`, `phases`, `questions`, `question_texts`, and `template_copies` from the initial Markdown template.

---

## MVP seed

1. Create one `interview_templates` row:
   - `version` = `1.0.0`
   - `is_active` = `true`
   - `published_at` = now

2. **Phases** `0`–`5` from Markdown headings (objectives → `template_copies` or phase-level copy).

3. **Questions** — one row per numbered item (`1.1` … `5.3`):
   - `code` from Markdown id
   - `input_type` = `long_text`
   - `sort_order` within phase

4. **Question texts** — `field` = `label`, `register` = `neutral` initially (add `tu` / `usted` variants when copy exists).

5. **Template copies** — e.g.:
   - `phase_0_intro` — Phase 0 blockquote script
   - `privacy` — placeholder until UX copy finalized
   - `tone_onboarding` — from requirements reference copy

6. **Assistant sentiments** — `content/assistant/sentiments.json` + media files:
   - Ten ids: `atenta`, `smile`, `think`, `nod`, `sorprendida`, `complice`, `risa`, `seria`, `enSerio`, `sarcasmo`
   - Per id: `assets.tu` and `assets.usted` (WebP and/or GIF)
   - See [assistant-expression.md](../requierements/assistant-expression.md)

---

## Implementation

- Laravel **seeder** (`InterviewTemplateSeeder`) reads Markdown or a generated JSON intermediate.
- Prefer **one-time parse** from MD → seed arrays in seeder class for deterministic CI.
- Do not hand-edit production DB for question wording — change MD / seeder and re-seed on dev.

---

## Active template

New invites use `interview_templates` where `is_active = true` (only one in MVP).
