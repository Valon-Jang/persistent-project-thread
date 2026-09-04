# Persistent Project Thread Architecture

## 1. Problem

Long-running AI projects have two competing failure modes.

### Many-chat fragmentation

Creating a new conversation for every subtask reduces local context size but fragments decisions, rationale, vocabulary, progress, and references. The operator repeatedly pays a reconstruction cost.

### One-chat context growth

Keeping everything in one conversation preserves continuity but eventually makes the **active model context** large enough that automatic or manual compaction becomes relevant.

The architectural mistake is to treat three different things as one:

1. the transcript the human can browse;
2. the context currently visible to the model;
3. the durable canonical state of the project.

## 2. Three-layer memory model

Persistent Project Thread separates those roles.

```text
┌────────────────────────────────────┐
│ 1. CHAT TRANSCRIPT                 │
│ Human-visible conversation history │
│ Scrollable historical record       │
└────────────────────────────────────┘
                 │
                 │ selected/compacted model input
                 ▼
┌────────────────────────────────────┐
│ 2. ACTIVE MODEL CONTEXT            │
│ Working memory for inference       │
│ Compactable / replaceable          │
└────────────────────────────────────┘
                 │
                 │ durable-state promotion
                 ▼
┌────────────────────────────────────┐
│ 3. LOCAL ROOT                      │
│ Canonical project state            │
│ Authority / rules / verified paths │
└────────────────────────────────────┘
```

Operationally:

```text
Transcript     = history for the human
Active context = working memory for the model
Local ROOT     = durable state for the project
```

This is an operational model, not a claim about ChatGPT's private database schema.

## 3. Supporting observation

In the tested long-lived ChatGPT thread, automatic compaction was observed repeatedly. After compaction:

- the same project thread remained usable;
- model/tool continuation could proceed;
- the user could scroll upward and still see earlier messages in the ChatGPT UI.

OpenAI's published ChatGPT retention documentation also states that chats kept by the user remain saved to the account until deleted:

- https://help.openai.com/en/articles/8983778-how-are-files-vs-chats-retained

That does not reveal the product's internal storage implementation, but it reinforces an important operational rule:

> **Do not treat active-context compaction as chat-transcript deletion.**

## 4. Separation of responsibilities

| Layer | Role | Expected lifetime |
|---|---|---|
| Chat transcript | human-readable project history and evidence | retained according to ChatGPT/user retention controls |
| Active model context | current working context used for inference | transient, compactable |
| Local ROOT | authority, routing, durable project state | persistent |
| Child MD | detailed canonical rules/state per subsystem | persistent |
| Hot path | verified execution shortcut | persistent while valid |
| Archive/History | superseded evidence | persistent but non-canonical |
| Compaction | reduce/replace active model-visible history | episodic |

## 5. Core flow

```text
User works in one project chat
        │
        ▼
Transcript grows normally
        │
        ▼
New durable decision?
   │ yes       │ no
   ▼           │
Patch ROOT / Child MD
   │           │
   └─────┬─────┘
         ▼
Continue project
         │
         ▼
Active model context becomes large / user requests compact
         │
         ▼
Verify durable state is already canonical
         │
         ▼
Compact ACTIVE CONTEXT
         │
         ├── transcript may remain human-visible
         │
         ▼
Continue SAME primary thread
```

## 6. Why this is Root Engineering

Root Engineering treats the model and transient context as replaceable execution resources. Durable state is externalized into a controlled structure.

Compaction extends that principle to model working memory without requiring the human-facing project history to disappear:

```text
model can change
active context can be compressed
human transcript can remain inspectable
individual tool sessions can restart
but ROOT provides the stable project identity
```

## 7. One-project-one-chat is a default, not a law

Use one primary project Chat thread when continuity is beneficial. Create separate threads/processes when isolation is required, for example:

- Codex stage contracts requiring one thread per stage
- concurrent independent agents
- untrusted/destructive experiments
- permission/security boundaries
- a deliberately clean evaluation context

The architecture distinguishes **project-level conversation continuity** from **execution-level isolation**.

## 8. Canonicalization gate before compaction

Compaction must never be used as a substitute for saving important state.

Before compaction ask:

- What changed since the last ROOT/Child MD update?
- Which decisions would be expensive to reconstruct?
- Which successful operational path was verified?
- Which failed approach must not be repeated?
- Did any canonical path or authority relationship change?

Only durable answers are promoted.

Do not copy the whole transcript into ROOT merely because it exists. The transcript and ROOT have different jobs.

## 9. Compaction hot-path policy

Preferred ordering:

```text
Supported native compact action
    ↓ unavailable
Previously verified minimal boundary trigger
    ↓ unsuccessful
Bounded adaptive diagnostic pressure
    ↓ unsuccessful
Stop and diagnose; do not flood the thread
```

This preserves the Root Engineering rule:

> Failed methods remain evidence. Verified minimal methods become the hot path.

After compaction succeeds, do not keep triggering. Continue the project.

## 10. Transcript vs retrieval

The fact that old messages remain visible to the human does **not** imply the model receives all of them on every turn.

A useful future architecture is therefore:

```text
retained transcript
     │
     ├── human scroll / audit / historical evidence
     │
     └── selective retrieval when needed

active model context
     └── only what is needed for the current inference window

ROOT
     └── authoritative durable project state
```

This opens a path toward transcript-aware retrieval without paying full-context cost on every response.

## 11. Expansion model

Possible future layers include:

- automatic durable-state extraction before compaction;
- transcript-aware selective retrieval;
- context-health scoring and proactive maintenance;
- project-level compaction policies;
- repeated-compaction quality monitoring;
- cross-model project continuity;
- recovery from runtime/tool loss using ROOT + hot paths;
- one primary human-facing thread with isolated execution-agent threads;
- portable ROOT packages shared across ChatGPT, Codex, and local agents.

These are roadmap directions, not currently verified capabilities.

## 12. Product framing

This architecture should be described as an **independent Root Engineering pattern for ChatGPT project continuity**, not as an official ChatGPT feature.

Its central claim is operational rather than platform-internal:

> A long-running AI project can separate human-visible transcript history, compactable model working memory, and durable canonical state. That separation can preserve continuity without making raw conversation history the project's only memory system.
