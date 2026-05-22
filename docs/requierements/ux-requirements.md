# UX Requirements (Phase 1 / MVP)

**Status:** Draft v0.6  
**Last updated:** 2026-05-21  
**Companion:** [functional-requirements.md](./functional-requirements.md)

---

## 1. Experience goals

- Feel like a **real conversation**, not a Google Form.
- **Personalized** from the first screen (name, business, register).
- **Modern, clean, delightful** — Idwasoft brand; signal an **AI-ready** studio that helps the business grow (excite, not intimidate).
- **Mobile-first**; large text areas for story answers.

**Anti-patterns:** purple form aesthetic, dense radio walls, mid-flow “Submit”, “Estimado usuario”, desktop-only.

**Reference vibe:** Typeform / Linear / Stripe — minimal, professional.

---

## 2. Branding

- **Full Idwasoft branding** on client interview: logo, colors, typography (configured in admin, global for MVP).
- Tone: contemporary, confident, growth-oriented — “we live in this AI era and we’re prepared to grow your business.”
- Prototype priority: mobile + one long-answer step + phase transition + tone onboarding.

---

## 3. Interview flow (client)

1. Open personalized link.
2. **Privacy** — conversational reassurance + link to aviso de privacidad (see §5).
3. **Tone onboarding** — choose register (§4).
4. **Phase 0** intro, then phases 1–5 (one question per screen).
5. After each answer: **micro-reply** → next question.
6. Final submit → **AI farewell** → optional delivery of copy (functional).
7. Reopen link → same farewell (no edit).

**UX checklist**

| # | Requirement |
|---|-------------|
| 1 | One question per screen; generous whitespace |
| 2 | Phase progress (e.g. “Fase 2 de 5”) + section objective |
| 3 | ~15–20 min expectation upfront; save & continue |
| 4 | Large text areas for narrative answers |
| 5 | Calm typography; readable measure; neutral + accent |
| 6 | Soft transitions between steps |
| 7 | Micro-delight between phases (static copy, tú/usted variants) |
| 8 | Every question: **“Prefiero no contestar”** |
| 9 | Micro-replies after answers (AI — §7) |
| 10 | AI farewell on complete (§8) |

---

## 4. Tone onboarding

First beat of the interview — **not** a settings toggle.

**Principles**

- Greet with **name + business** (from invite); neutral verbs until register chosen.
- Contrast **de usted / protocolario** vs **de tú / como con un amigo cercano** — not “respetuoso vs relajado”; never imply lack of trust (“cuando ya hay confianza”).
- Closing: **“Cuéntanos, ¿cuál es tu estilo?”** (possessive *tu* OK; avoid verbal tú/usted in the question).
- **Cards** with feeling labels or preview line — not grammar homework.
- Default register: **usted** if they continue without choosing.

**Reference copy**

> Hola, {{contactName}}. Un gusto salirnos por aquí.  
> Antes de empezar, hay algo que para nosotros sí importa: a algunas personas les gusta que la plática se sienta **muy de usted**, con ese tono más protocolario; a otras les late cuando suena **más de tú**, como cuando platicas con un amigo cercano.  
> **Cuéntanos, ¿cuál es tu estilo?**

---

## 5. Privacy (UX)

- Same **conversational tone** as the interview.
- Message: their data is **safe** and used to give a **more personalized** experience.
- **Link** to full aviso de privacidad (no wall of legal text on the main path).

---

## 6. Content architecture

Interview **content ≠ app code**.

| In content data | In app shell |
|-----------------|--------------|
| Phases, objectives, question labels (tú/usted variants) | Navigation, progress, animations |
| Hints, static micro-delight | Save, validation, invite binding |
| Tone onboarding strings | Branding layout |
| Farewell templates (optional fallbacks) | LLM orchestration |

- Stable **`questionId`** per question; answers stored by id.
- Source draft: [plantilla-entrevista-descubrimiento.md](../plantilla-entrevista-descubrimiento.md) → runtime JSON/YAML (`technical/`).
- **v1 language:** Spanish (client-facing).

**Phases (v1)**

| Phase | Focus |
|-------|--------|
| 0 | Intro — no “buttons and colors” talk yet |
| 1 | Business heart |
| 2 | Web goals |
| 3 | End-user / UX indirect |
| 4 | Anti-examples & brand |
| 5 | Logistics |

---

## 7. Conversational micro-replies (UX)

- One **short sentence** in chosen register; acknowledge only.
- **Sometimes** mirror a word or phrase from the client’s answer when it fits (e.g. “vendo flores” → “¡Qué bello negocio!”) — optional, not every time; see [assistant-expression §5.1](./assistant-expression.md#51-echoing-the-clients-words-when-appropriate).
- Each reply expresses exactly one **sentiment** from the closed catalog (ten ids: `atenta`, `smile`, `think`, `nod`, `sorprendida`, `complice`, `risa`, `seria`, `enSerio`, `sarcasmo`) — see [assistant-expression.md](./assistant-expression.md). Emotion in copy and avatar must match register (casual vs formal).
- **Lisa’s avatar** shows the image or GIF registered for that sentiment in the client’s register (**tú** = casual, **usted** = formal). Iconography elsewhere stays SVG; portrait media is not interchangeable with tone-card icons.
- Quick transition (skeleton/fade OK); no cheesy “AI typing” animation.
- Skip on tone onboarding and Phase 0.
- Fallback to curated line + fallback sentiment (`atenta`) if LLM fails.

**Training note:** document varied client answers, ideal replies, and matching **sentimentId** — see [functional §4.3](./functional-requirements.md#43-training-data) and [§4.4](./functional-requirements.md#44-micro-reply-sentiment--avatar-media).

---

## 8. Farewell & client copy (UX)

**Farewell (on complete and on link revisit)**

- AI-generated, **delightful**, same register.
- Sets expectation: team will contact **ASAP** to schedule the live call.

**Copy of answers to client**

- If sent: polished layout and tone — not a raw dump.
- Channels per functional requirements.

---

## 9. Admin panel (UX)

- Studio-facing; Google auth (@idwasoft.com).
- Clear layout: **summary / psychology / strategies / next steps** visible without digging; raw thread available.
- Actions: revoke link, re-send client copy.
- Invite generator form: minimal friction.

*(Visual design for admin can be simpler than client interview in MVP.)*

---

## 10. Differentiation vs Google Forms

| Google Form | This product |
|-------------|--------------|
| Generic | Idwasoft-branded, conversational |
| Flat list | Phased journey + AI micro-replies |
| Silent submit | Farewell + human-like flow |
| Data dump | Prep summary for studio |

---

## 11. Success signals (UX / product)

- Completion funnel (start → finish)
- Internal 1–5: usefulness for live call prep
- Optional client sentiment at end
- Qualitative: does the interview feel “worth their time”?

---

## 12. Open (UX / content)

- Exact farewell and privacy strings in content files
- Duplicate tú/usted strings vs placeholders in JSON
- Phase 0: single scroll vs stepped
- Sensitivity flags per question in schema for micro-reply prompts
- Asset delivery: CDN vs self-host for GIF loops
