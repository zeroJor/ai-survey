# Domain models

**Status:** Draft v0.1  
**Last updated:** 2026-05-21  

Technology-agnostic description of entities, their purpose, attributes, and relationships.  
Persistence: [database-schema.md](../technical/database-schema.md).

**Related:** [functional-requirements.md](./functional-requirements.md), [ux-requirements.md](./ux-requirements.md)

---

## Overview

| Area | Models |
|------|--------|
| Studio | `User`, `Settings` |
| Interview content | `InterviewTemplate`, `Phase`, `Question`, `QuestionText`, `TemplateCopy` |
| Client engagement | `Invite`, `Interview`, `InterviewSession` |
| Conversation | `Answer`, `AiMessage` |
| After completion | `InterviewArtifact`, `DeliveryRecord` |

---

## Studio

### `User`

**Purpose:** A person at the studio who creates invites and reviews completed interviews.

| Attribute | Description |
|-----------|-------------|
| `email` | Identity (e.g. studio domain) |
| `name` | Display name |

**Relationships:** creates many `Invite`

---

### `Settings`

**Purpose:** The studio’s single global configuration: presentation, outbound messaging setup, and process text used when interpreting a completed interview.

| Attribute | Description |
|-----------|-------------|
| `studioProcess` | Text describing Idwasoft’s process after discovery |
| `privacyNoticeUrl` | Link to the full privacy notice |
| `llmEnabled` | Whether AI-generated micro-replies, farewell, and studio summary call an external LLM (can be toggled anytime) |
| `branding` | `Branding` |
| `channels` | List of `Channel` |

**Relationships:** none (standalone; one logical instance for the product)

#### `Branding` (part of `Settings`)

**Purpose:** Visual and naming identity shown to the client during the interview.

| Attribute | Description |
|-----------|-------------|
| `logoUrl` | Logo asset location |
| `logoAlt` | Accessible label for the logo |
| `primaryColor` | Main brand color |
| `accentColor` | Secondary accent color |
| `displayName` | Name shown in the experience |
| `tagline` | Optional short line under the name |

#### `Channel` (part of `Settings`)

**Purpose:** One configured way to send a message (e.g. Slack, WhatsApp, email). The studio may define several; each holds its own connection details.

| Attribute | Description |
|-----------|-------------|
| `id` | Stable identifier within settings |
| `name` | Human-readable label (e.g. “Team Slack”) |
| `type` | Channel kind: `slack`, `whatsapp`, `email` (extensible) |
| `config` | Generic key–value object (connection parameters for that type) |

---

## Interview content

### `InterviewTemplate`

**Purpose:** The master definition of a discovery interview: phases, questions, and static copy. Each invite references one template so an in-flight interview does not change if the template is edited later.

| Attribute | Description |
|-----------|-------------|
| `version` | Label for this template revision (e.g. `1.0.0`) |
| `publishedAt` | Optional — when this revision became active |

**Relationships:**

- has many `Phase`
- has many `TemplateCopy`
- referenced by many `Invite`

---

### `Phase`

**Purpose:** A section of the interview (intro, business heart, web goals, etc.) that groups related questions and sets context for the client.

| Attribute | Description |
|-----------|-------------|
| `code` | Stable section id (e.g. `0`, `1`, … `5`) |
| `sortOrder` | Order among phases |

**Relationships:**

- belongs to `InterviewTemplate`
- has many `Question`

---

### `Question`

**Purpose:** A single prompt the client answers. Identified by a stable code so answers remain meaningful even if wording or order changes in a future template revision.

| Attribute | Description |
|-----------|-------------|
| `code` | Stable id (e.g. `1.1`, `2.3`) — must not be reused for a different meaning |
| `sortOrder` | Order within the phase |
| `inputType` | How the client responds (e.g. long text) |
| `sensitivity` | Optional — marks delicate topics for generated replies |

**Relationships:**

- belongs to `Phase`
- has many `QuestionText`

---

### `QuestionText`

**Purpose:** Wording for a question (or part of it) in a given register or neutral form.

| Attribute | Description |
|-----------|-------------|
| `field` | Which part of the question (e.g. `label`, `hint`) |
| `register` | `neutral`, `tu`, or `usted` |
| `body` | Text content |

**Relationships:** belongs to `Question`

---

### `TemplateCopy`

**Purpose:** Static text that is not a question — privacy snippet, tone onboarding, phase intros, encouragement between phases, etc.

| Attribute | Description |
|-----------|-------------|
| `key` | Stable id (e.g. `privacy`, `tone_onboarding`) |
| `register` | `neutral`, `tu`, or `usted` |
| `body` | Text content |

**Relationships:** belongs to `InterviewTemplate`

---

## Client engagement

### `Invite`

**Purpose:** A studio-initiated engagement for one client: who they are, how to reach them, and the access credential that starts the interview.

| Attribute | Description |
|-----------|-------------|
| `contactName` | Person completing the interview |
| `businessName` | Client’s company or brand |
| `businessAbout` | Optional — type or short description of the business |
| `clientEmail` | Optional — for sending a copy of answers |
| `clientWhatsapp` | Optional — for sending a copy of answers |
| `accessToken` | Link credential (e.g. action JWT) |
| `accessTokenExpiresAt` | When the link credential expires |
| `status` | `active` or `revoked` |
| `revokedAt` | Optional — when the invite was revoked |

**Relationships:**

- belongs to `User` (creator)
- belongs to `InterviewTemplate`
- has one `Interview`

---

### `Interview`

**Purpose:** One client’s run through the template: progress, chosen register, answers, and generated lines. The core record of the conversation.

| Attribute | Description |
|-----------|-------------|
| `status` | `not_started`, `in_progress`, or `completed` |
| `register` | `tu` or `usted` — optional until the client chooses |
| `currentQuestionCode` | Optional — resume pointer |
| `privacyAcknowledgedAt` | Optional — client saw privacy notice |
| `startedAt` | Optional |
| `completedAt` | Optional |

**Relationships:**

- belongs to `Invite`
- has many `Answer`
- has many `AiMessage`
- has many `InterviewSession`
- has zero or one `InterviewArtifact`
- has many `DeliveryRecord` (optional)

---

### `InterviewSession`

**Purpose:** A client visit bound to an interview so the same person can continue without presenting the link credential on every action.

| Attribute | Description |
|-----------|-------------|
| `expiresAt` | When this visit binding ends |
| `lastSeenAt` | Last activity on this visit |

**Relationships:** belongs to `Interview`

---

## Conversation

### `Answer`

**Purpose:** The client’s response to one question, including an explicit “prefer not to answer.”

| Attribute | Description |
|-----------|-------------|
| `questionCode` | Matches `Question.code` |
| `body` | Response text — optional when skipped |
| `skipped` | True when the client chose not to answer |

**Relationships:** belongs to `Interview`  
**Constraint:** at most one answer per `questionCode` per interview

---

### `AiMessage`

**Purpose:** A line generated for the client during the interview (brief acknowledgment after an answer, or farewell at the end), stored as part of the full conversation.

| Attribute | Description |
|-----------|-------------|
| `type` | `micro_reply` or `farewell` |
| `questionCode` | Optional — ties a micro-reply to a question |
| `content` | Message text |
| `sentimentId` | For `micro_reply` only — one of the v1 ids in [assistant-expression.md](./assistant-expression.md) §2 |
| `register` | `tu` or `usted` at generation time — selects which avatar asset variant was shown |
| `sequence` | Order within the conversation thread |

**Relationships:** belongs to `Interview`

---

## After completion

### `InterviewArtifact`

**Purpose:** Studio-facing synthesis after completion: understanding of the client, business, psychology, strategy, and suggested next steps — separate from the raw Q&A thread.

| Attribute | Description |
|-----------|-------------|
| `summary` | Overall prep brief |
| `psychologyNotes` | Rapport and deal-relevant signals |
| `strategyNotes` | Proposal / strategic angles |
| `nextSteps` | Suggested steps aligned with studio process |
| `generatedAt` | When this artifact was produced |

**Relationships:** belongs to `Interview` (at most one per interview)

---

### `DeliveryRecord` (optional)

**Purpose:** Record that a message was sent through a channel for this interview (audit and re-send).

| Attribute | Description |
|-----------|-------------|
| `channelId` | References `Channel.id` in settings |
| `channelType` | Copy of channel type at send time |
| `status` | Outcome of the send attempt |
| `sentAt` | When the send occurred |

**Relationships:** belongs to `Interview`

---

## Value concepts (enums)

| Name | Values |
|------|--------|
| `Register` | `tu`, `usted` |
| `InterviewStatus` | `not_started`, `in_progress`, `completed` |
| `InviteStatus` | `active`, `revoked` |
| `AiMessageType` | `micro_reply`, `farewell` |
| `AssistantSentimentId` | `atenta`, `smile`, `think`, `nod`, `sorprendida`, `complice`, `risa`, `seria`, `enSerio`, `sarcasmo` |
| `ChannelType` | `slack`, `whatsapp`, `email` (extensible) |
| `QuestionCode` | Stable string identifier (e.g. `1.1`) |

---

## Relationship diagram

```text
User ──< Invite >── InterviewTemplate
       Invite ──1 Interview ──< Answer
                            ──< AiMessage
                            ──0..1 InterviewArtifact
                            ──< InterviewSession
                            ──< DeliveryRecord

InterviewTemplate ──< Phase ──< Question ──< QuestionText
                    ──< TemplateCopy

Settings (one instance)
  ├── Branding
  └── Channel[]
```
