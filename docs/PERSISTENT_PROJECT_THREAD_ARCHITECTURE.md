# Persistent Project Thread Architecture

## 1. Problem

Long-running AI projects have two competing failure modes.

### Many-chat fragmentation

Creating a new conversation for every subtask reduces local context size but fragments decisions, rationale, vocabulary, progress, and references. The operator repeatedly pays a reconstruction cost.

### One-chat context growth

Keeping everything in one conversation preserves continuity but eventually makes the active model context large enough that automatic or manual compaction becomes relevant.

The architectural mistake is to ask **conversation history to be both working memory and durable project storage**.

## 2. Separation of responsibilities

Persistent Project Thread splits those roles.

| Layer | Role | Expected lifetime |
|---|---|---|
| Primary Chat thread | current working context, discussion, recent reasoning | long-lived but compactable |
| Local ROOT | authority, routing, durable state | persistent |
| Child MD | detailed canonical rules/state per subsystem | persistent |
| Hot path | verified execution shortcut | persistent while valid |
| Archive/History | superseded evidence | persistent but non-canonical |
| Compaction | reduce active conversation history | episodic |

## 3. Core flow

```text
User works in one project chat
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
Active context becomes large / user requests compact
         │
         ▼
Verify durable state is already canonical
         │
         ▼
Compact active conversation
         │
         ▼
Continue SAME primary thread
```

## 4. Why this is Root Engineering

Root Engineering treats the model and transient context as replaceable execution resources. Durable state is externalized into a controlled structure.

Compaction extends that principle to the chat itself:

```text
model can change
context can be compressed
individual tool sessions can restart
but ROOT provides the stable project identity
```

## 5. One-project-one-chat is a default, not a law

Use one primary project Chat thread when continuity is beneficial. Create separate threads/processes when isolation is required, for example:

- Codex stage contracts requiring one thread per stage
- concurrent independent agents
- untrusted/destructive experiments
- permission/security boundaries
- a deliberately clean evaluation context

The architecture distinguishes **project-level conversation continuity** from **execution-level isolation**.

## 6. Canonicalization gate before compaction

Compaction must never be used as a substitute for saving important state.

Before compaction ask:

- What changed since the last ROOT/Child MD update?
- Which decisions would be expensive to reconstruct?
- Which successful operational path was verified?
- Which failed approach must not be repeated?
- Did any canonical path or authority relationship change?

Only durable answers are promoted.

## 7. Compaction hot-path policy

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

## 8. Expansion model

Persistent Project Thread is intentionally small at the execution layer. Its broader value is the separation of transient AI working context from durable project state.

Possible future layers include:

- automatic durable-state extraction before compaction;
- context-health scoring and proactive maintenance;
- project-level compaction policies;
- cross-model project continuity;
- recovery from runtime/tool loss using ROOT + hot paths;
- one primary human-facing thread with isolated execution-agent threads;
- portable ROOT packages shared across ChatGPT, Codex, and local agents.

These are roadmap directions, not currently verified capabilities.

## 9. Product framing

This architecture should be described as an **independent Root Engineering pattern for ChatGPT project continuity**, not as an official ChatGPT feature.

Its central claim is operational rather than platform-internal:

> A long-running AI project does not need raw conversation history to serve as its sole durable memory. Externalized canonical state plus compactable working context can preserve continuity with far less dependence on chat fragmentation.
