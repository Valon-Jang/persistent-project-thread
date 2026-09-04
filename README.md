# Persistent Project Thread

> **A practical ChatGPT innovation: one project, one persistent thread, durable local state, and compaction instead of conversation reset.**

**Persistent Project Thread (PPT)** is an independent Root Engineering experiment for turning a long-running ChatGPT project into a persistent workspace instead of a sequence of disposable conversations.

The operating idea is simple:

```text
ONE PROJECT
   │
   ├── ONE LONG-LIVED CHAT THREAD  ← working memory
   │          │
   │          └── compact when needed
   │
   └── LOCAL ROOT                  ← durable project state
              ├── Child MDs
              ├── verified methods
              ├── decisions + rationale
              ├── failure memory
              └── hot paths
```

Instead of opening a new chat whenever context becomes heavy, the system separates **working memory** from **persistent state**. Important knowledge is promoted into a local ROOT/Child-MD hierarchy, while the conversation itself is allowed to be compacted and continued.

This repository packages that idea as both **research** and an executable **Agent Skill**.

> Independent research project. Not an official OpenAI or ChatGPT feature.

---

## Why this could matter

Long AI projects usually hit one of two failure modes:

### 1. Many-chat fragmentation

```text
Project
├── Chat 1: design
├── Chat 2: debugging
├── Chat 3: decisions
├── Chat 4: recovery
└── Chat 5: "what did we decide again?"
```

Context stays small, but project state becomes fragmented across conversations.

### 2. One-chat context growth

Keeping one conversation preserves continuity, but active context keeps growing and can become slower, noisier, or harder to manage.

Persistent Project Thread separates the two problems:

```text
Durable knowledge problem  → Local ROOT / Child MD
Active-context problem      → Compaction
```

That creates a different project loop:

```text
work
→ promote durable state into ROOT
→ keep using the same project chat
→ compact active conversation when needed
→ continue the same chat
```

The chat becomes a **persistent project workspace**, not the project database itself.

---

## The experiment that changed the design

The first compaction experiment assumed that a large tool output was needed to push a long ChatGPT conversation across an automatic-compaction threshold.

The pressure was then reduced step by step in the same long-lived thread:

```text
~3200 lines  → compaction observed
  400 lines  → compaction observed
  100 lines  → compaction observed
   20 lines  → compaction observed
    1 line   → compaction observed
0-output no-op tool boundary → compaction observed
```

The final result changed the interpretation completely.

The tested thread appeared to be **already eligible for automatic compaction**. Once eligible, a later tool/sampling boundary was sufficient for the host to perform it. The thousands of synthetic lines were unnecessary overshoot.

So the optimized fallback became:

```text
persist durable state
→ emit no disposable pressure text
→ create one verified zero-output tool boundary
→ observe compaction
→ STOP triggering immediately
→ continue the same project thread
```

This does **not** mean that a no-op universally forces compaction in every ChatGPT conversation. It is environment-specific evidence from the tested thread. See the research document for the conservative interpretation.

---

## The Skill

Canonical Skill path:

```text
.agents/skills/persistent-project-thread/SKILL.md
```

Use it when the user says things like:

- `압축해`
- `컴팩션`
- `채팅 정리해`
- `중요한 상태 저장하고 압축해`
- `이 프로젝트는 이 채팅 하나로 계속 가자`
- "keep this project in one long-lived chat"

The Skill enforces this order:

```text
1. Persist new durable project state into ROOT / Child MD
2. Prefer a supported native compact action when one is actually exposed
3. Otherwise use a previously verified minimal boundary trigger
4. Verify compaction
5. Stop immediately on success
6. Use bounded adaptive pressure only as diagnosis/fallback
```

**3,200-line pressure is evidence, not the hot path.**

---

## Root Engineering evolution

Root Engineering started from a simple principle:

> **Model is replaceable. Root persists.**

Persistent Project Thread extends it:

> **Conversation can be compacted. Root preserves project state. The project continues.**

That yields a layered project architecture:

```text
MODEL              replaceable
CHAT CONTEXT        compactable
TOOL / OS SESSION   restartable
LOCAL ROOT          persistent
PROJECT IDENTITY    persistent
```

The model can change. The active conversation can shrink. A runtime can restart. The project still has continuity because its canonical state exists outside transient context.

---

## Why the expansion surface is large

The current repository proves only a small core pattern, but the architecture opens several directions.

### Automatic state promotion
Detect decisions, verified methods, constraints, failures, and hot paths before compaction, then patch the smallest canonical ROOT owner automatically.

### Thread health management
Track context growth, recent compactions, retrieval quality, stale assumptions, and recommend compaction before the conversation becomes noisy.

### Compaction scheduler
Move from manual `압축해` to policy-based maintenance: compact at safe boundaries, after durable-state promotion, or before expensive project phases.

### Project continuity across model upgrades
Keep the same ROOT state while switching model families or reasoning modes without reconstructing the project from raw conversation history.

### Recovery after tool/runtime loss
Rehydrate a project from ROOT + verified hot paths instead of replaying an entire chat transcript.

### Multi-agent orchestration
Use one human-facing primary project thread while isolated agents/Codex stages run in separate execution threads and return only promoted durable results.

### Portable project roots
Move the persistent ROOT between ChatGPT, Codex, local agents, or future model runtimes while keeping the project authority structure stable.

### Long-horizon AI workspaces
Treat conversation as replaceable working memory around a durable project substrate—closer to an operating system for AI work than a conventional chat log.

These are **roadmap directions**, not claims of completed functionality.

---

## Research boundary

Verified empirically on **2026-09-04** in one long-lived ChatGPT execution thread with tool execution available.

OpenAI Codex source was also inspected for implementation evidence relevant to compaction behavior. In particular:

- auto-compaction can be followed by model/tool continuation in the same turn;
- compact paths replace the live model-visible history via `Session::replace_compacted_history(...)`;
- Codex exposes an automatic-compaction token threshold in configuration.

These Codex source observations are useful architecture evidence, but they do **not** prove that the ChatGPT product harness is internally identical to open-source Codex.

This research concerns **active model-visible context**. It does not claim provider-side raw logs, audit data, or retention records are physically deleted by compaction.

---

## Repository layout

```text
.
├── README.md
├── .agents/
│   └── skills/
│       └── persistent-project-thread/
│           └── SKILL.md
├── docs/
│   ├── PERSISTENT_PROJECT_THREAD_ARCHITECTURE.md
│   └── CHAT_COMPACTION_RESEARCH.md
├── evidence/
│   ├── FORCE_COMPACT_PROTOCOL_v2.md
│   └── EXPERIMENT_LOG_2026-09-04.md
└── tools/
    └── noop_boundary.py
```

## Status

**Experimental / operationally verified in one long-lived ChatGPT thread.**

The next research target is a supported native compaction path or host-visible compaction signal that removes the need for inference from boundary behavior.
