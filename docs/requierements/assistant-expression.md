# Assistant expression (Lisa) — sentiments & avatar media

**Last updated:** 2026-05-22  
**Related:** [ux-requirements §7](./ux-requirements.md#7-conversational-micro-replies-ux), [functional §4.4](./functional-requirements.md#44-micro-reply-sentiment--avatar-media), [domain `AiMessage`](./domain-models.md#aimessage), [LLM `microReply`](../technical/llm.md#microreply-response-shape)

---

## 1. Principle

Every **micro-reply** is not only text: it must convey a **sentiment** from a **closed list**. The on-screen avatar shows the **image or GIF** registered for that sentiment, in the register the client chose (**casual / tú** vs **formal / usted**).

Farewell and welcome may use a fixed sentiment (e.g. `smile`) but are out of scope for the per-answer loop.

---

## 2. Finite sentiment catalog (v1)

These ids are **stable** — used in content registry, API, LLM schema, and analytics. Do not add values at runtime.

| `sentimentId` | Studio label (ES) | Cuándo utilizarlo |
|---------------|-------------------|-------------------|
| `atenta` | Seria y atenta | El cliente **omite** la pregunta, deja la respuesta **vacía**, prefiere no contestar, o el tema es **delicado**; también cuando la micro-respuesta debe ser sobria y sin juicio |
| `smile` | Sonrisa amable | Tono **positivo**, agradecimiento, pasión o entusiasmo genuino en la respuesta |
| `think` | Pensativa | **Duda**, incertidumbre (*no sé*, *tal vez*), o respuesta **larga / compleja** que Lisa debe asimilar antes de seguir |
| `nod` | De acuerdo, sigamos | **Afirmación breve** (*sí*, *ok*, *de acuerdo*), confirmación sin matiz emocional fuerte; micro-respuesta de cierre y continuar |
| `sorprendida` | Sorprendida | **Dato inesperado**, cifra o hecho que destaca (*20 años*, *500 clientes*, *wow*, *increíble*) |
| `complice` | Guiño cómplice | **Complicidad** coloquial o cercana (*la neta*, *obvio*, *ándale*) sin ironía negativa |
| `risa` | Qué risa | **Humor** explícito (*jaja*, *jeje*, anécdota divertida) |
| `seria` | Neutral y seria | Respuesta **neutra**, factual o **corta** sin carga emocional clara; **fallback** cuando ningún otro sentimiento encaja mejor |
| `enSerio` | ¿Es en serio? | **Sorpresa escéptica** o incredulidad (*en serio*, *no mames*, *de verdad*) — no confundir con sarcasmo |
| `sarcasmo` | Harta / sarcasmo | **Ironía**, exasperación o “meme” de ojos en blanco (*claro que sí*, *qué maravilla*, *ya basta*) cuando el tono del cliente es sarcástico, no entusiasta |

**Rules**

- Exactly **one** `sentimentId` per micro-reply generation.
- LLM (or template fallback) must return an id from this table — never free-text emotion labels.
- The chosen sentiment must **match** both the client’s answer tone and the micro-reply copy (see §5.1).
- If mapping fails or id is invalid → fallback `atenta` (or `seria` when the reply is neutral and non-delicate — product may tune; default safe: `atenta`).

### 2.1 Señales orientativas (LLM / reglas)

Guía no exhaustiva para clasificar la respuesta del cliente **antes** de redactar la micro-respuesta:

| Señal en la respuesta del cliente | `sentimentId` preferido |
|-----------------------------------|-------------------------|
| Skip / vacío / “prefiero no contestar” | `atenta` |
| Palabras de duda o vacilación | `think` |
| Entusiasmo, orgullo, gratitud | `smile` |
| “Sí”, “ok”, una línea afirmativa | `nod` |
| Cifras, sorpresa, “no esperaba” | `sorprendida` |
| Jerga cómplice, “obvio” sin ironía | `complice` |
| Risas, chiste | `risa` |
| Texto plano, datos sin emoción | `seria` |
| “¿En serio?”, incredulidad | `enSerio` |
| Ironía, “claro que sí” sarcástico | `sarcasmo` |

**Conflicts:** if two sentiments apply, prefer the one that best matches the **micro-reply text** Lisa will show (avatar and copy must agree). Example: ironic “qué maravilla” → `sarcasmo`, not `smile`.

### 2.2 Prototype assets (PNG, sin tú/usted)

| `sentimentId` | Prototype file (`public/assets/assistant/`) |
|---------------|-----------------------------------------------|
| `atenta` | `lisa-atenta.png` |
| `smile` | `lisa.png` |
| `think` | `lisa-think.png` |
| `nod` | `lisa-seria.png` (shared with `seria` until dedicated nod asset) |
| `sorprendida` | `lisa-sorprendida.png` |
| `complice` | `lisa-complice.png` |
| `risa` | `lisa-risa.png` |
| `seria` | `lisa-seria.png` |
| `enSerio` | `lisa-en-serio.png` |
| `sarcasmo` | `lisa-sarcasmo.png` |

---

## 3. Avatar media registry

### 3.1 Variants (tú / usted)

For **each** `sentimentId`, the product maintains **two** visual assets:

| Register | Tone onboarding | Asset slot |
|----------|-----------------|------------|
| `tu` | CASUAL | `assets.tu` |
| `usted` | FORMAL | `assets.usted` |

Same sentiment, **different** file per register (posture, expression, or motion tuned to casual vs formal). Not a single image with copy overlay.

### 3.2 Format

- **Static:** WebP (preferred for weight), PNG fallback in pipeline if needed.
- **Animated:** GIF or short loop WebP — one file per slot; no video player in MVP.
- **Iconography** (tone cards, UI chrome) stays SVG — this registry is **only** for Lisa’s portrait in micro-replies (and optional fixed beats).

### 3.3 Registry location (content)

Canonical file (prototype and production align on shape):

```text
content/assistant/sentiments.json
public/assets/assistant/{register}/{sentimentId}.{ext}
```

Example registry entry:

```json
{
  "version": "1",
  "sentiments": [
    {
      "id": "smile",
      "label": "Sonrisa amable",
      "assets": {
        "tu": { "src": "/assets/assistant/tu/smile.webp", "alt": "Lisa, tono cercano, sonrisa amable" },
        "usted": { "src": "/assets/assistant/usted/smile.gif", "alt": "Lisa, tono formal, sonrisa amable" }
      }
    }
  ]
}
```

**Requirements**

- All **ten** sentiments in §2 must have **both** `tu` and `usted` entries before release.
- `alt` per asset for accessibility (screen readers); visible label can match studio table.
- Broken `src` → fallback asset for `atenta` + current register; log in admin/studio (later).

### 3.4 Prototype behavior

The prototype (`docs/prototype`, `assistantGestures.ts`) uses **one PNG per sentiment** (§2.2), **no** register split yet.

For **micro-replies only**, the portrait is chosen **uniformly at random** from the full catalog so reviewers can see every expression during the walkthrough. This is **not** production behavior.

Production and LLM-off templates must map each answer to the correct `sentimentId` using §2 and §2.1.

---

## 4. UX behavior (client)

| Moment | Avatar |
|--------|--------|
| Micro-reply loading | Same sentiment asset (optional subtle pulse; no “typing” theatrics) |
| Micro-reply text visible | Unchanged asset + animated reply copy |
| Register | Chosen at tone step; drives `tu` vs `usted` asset path for **all** following micro-replies |

Sentiment may change every answer; asset swap should feel instant (preload next-step assets when possible).

---

## 5. LLM & templates

**With LLM on:** response includes `sentimentId` + `text` (see [llm.md](../technical/llm.md)).

**With LLM off:** template picker chooses `text` and `sentimentId` using §2 / §2.1 (never random).

**Training data** (`content/training/micro-replies/`): each example should tag `sentimentId` and register-appropriate tone, not only good/bad copy.

### 5.1 Echoing the client’s words (when appropriate)

Micro-replies stay **one short sentence**, but **sometimes** Lisa may reuse a **specific word or phrase** from the answer the client just gave — only when it sounds natural and reinforces rapport.

| Guideline | Detail |
|-----------|--------|
| When | Answer names something concrete (business, product, place, passion) or offers a vivid detail worth mirroring |
| When not | Skip, empty, very short (“sí”, “ok”), sensitive topics, or answers where parroting feels mocking |
| How | Pick **one** anchor (noun or short phrase), not a full quote; paraphrase the rest |
| Register | Same rules as the interview: **tú** = casual warmth; **usted** = formal courtesy |
| Sentiment | Echo must **match** `sentimentId` — e.g. “flores” + delight → `smile`; doubt about budget → `think`, not forced enthusiasm |

**Examples (Spanish)**

| Client answer (excerpt) | Register | OK micro-reply | `sentimentId` |
|-------------------------|----------|----------------|---------------|
| “Yo vendo flores…” | `tu` | “¡Qué bello negocio!” | `smile` |
| “Yo vendo flores…” | `usted` | “Qué interesante enfoque con las flores.” | `smile` |
| “Llevamos 20 años en el centro.” | `tu` | “Wow — 20 años, eso dice mucho.” | `sorprendida` |
| “No estoy seguro del presupuesto.” | `usted` | “Entendemos la duda sobre el presupuesto.” | `think` |
| “Claro que sí, qué maravilla.” | `tu` | “Entiendo el tono — seguimos.” | `sarcasmo` |
| “Jaja sí, fue un desastre.” | `tu` | “Suena a historia buena para contar.” | `risa` |

**Avoid:** repeating slang the client did not use; inventing facts; long lists; emoji in MVP unless product later allows.

Template fallbacks without LLM may use placeholders (`{{keyword}}`) when a safe keyword is extracted client- or server-side; LLM path prefers model-chosen echo.

---

## 6. Persistence

Each stored micro-reply (`AiMessage` type `micro_reply`) should record:

- `content` — reply text  
- `sentimentId` — from catalog  
- `register` — `tu` \| `usted` at time of reply (denormalized for thread replay)

Reopening an in-progress interview replays the same text + sentiment + correct register asset.

---

## 7. Studio / content checklist

- [ ] `sentiments.json` lists all v1 ids (§2) with `tu` + `usted` assets  
- [ ] Files exist under `public/assets/assistant/{tu,usted}/`  
- [ ] LLM prompt documents closed sentiment list  
- [ ] Template fallbacks specify `sentimentId` per line  
- [ ] Admin thread view shows sentiment id (optional badge) for QA  

---

## 8. Open (later)

- Per-question **default** sentiment hints in question schema  
- A/B still vs animated per sentiment  
- Additional sentiments (requires version bump of catalog)  
- Dedicated `nod` asset separate from `seria`
