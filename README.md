# Persistent Project Thread

> **A practical ChatGPT innovation: one project, one persistent thread, durable local state, and compaction instead of conversation reset.**

**Persistent Project Thread (PPT)** is an independent Root Engineering experiment for turning a long-running ChatGPT project into a persistent workspace instead of a sequence of disposable conversations.

The key discovery is that a long-lived project can be understood as **three different memory layers**, not one:

```text
ONE PROJECT
   │
   ├── CHAT TRANSCRIPT               ← human-visible history
   │      └── old messages can remain scrollable after compaction
   │
   ├── ACTIVE MODEL CONTEXT          ← compactable working memory
   │      └── compact / replace when needed
   │
   └── LOCAL ROOT                    ← durable canonical project state
          ├── Child MDs
          ├── verified methods
          ├── decisions + rationale
          ├── failure memory
          └── hot paths
```

This changes the mental model completely:

```text
Transcript      = history for the human
Active context  = working memory for the model
Local ROOT      = durable state for the project
```

Compaction is therefore **not the same thing as deleting the conversation**. In the tested ChatGPT thread, repeated compaction reduced/replaced active model-visible context while earlier messages remained available to the user by scrolling the same chat.

OpenAI's published ChatGPT retention policy separately states that chats kept by the user are saved to the account until deleted. That supports the distinction between retained chat history and transient model working context, but this repository does **not** claim knowledge of ChatGPT's private database implementation.

Official retention reference:

- https://help.openai.com/en/articles/8983778-how-are-files-vs-chats-retained

This repository packages the operating pattern as both **research** and an executable **Agent Skill**.

> Independent research project. Not an official OpenAI or ChatGPT feature.

---

## Why this could matter

Long AI projects usually hit one of two failure modes.

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

Persistent Project Thread separates the problems:

```text
Human history problem       → retained Chat transcript
Durable knowledge problem   → Local ROOT / Child MD
Active-context problem      → Compaction
```

That creates a different project loop:

```text
work
→ promote durable state into ROOT
→ keep using the same project chat
→ compact active model context when needed
→ user can still scroll the historical transcript
→ continue the same chat
```

The chat becomes a **persistent project workspace**, while neither raw transcript nor active context has to serve as the project database.

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

Then another observation changed the memory model again:

```text
compact active context
→ continue same thread
→ scroll upward in ChatGPT UI
→ old message text is still visible
```

So active-context compaction and human-visible transcript retention must be treated as different operational concerns.

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
4. Verify active-context compaction
5. Stop immediately on success
6. Continue the same project chat
7. Never confuse compaction with transcript deletion
```

**3,200-line pressure is evidence, not the hot path.**

---

## Root Engineering evolution

Root Engineering started from a simple principle:

> **Model is replaceable. Root persists.**

Persistent Project Thread extends it:

> **Conversation context can be compacted. The transcript can remain human-visible. Root preserves project state. The project continues.**

That yields a layered project architecture:

```text
MODEL               replaceable
CHAT TRANSCRIPT      retained for human history until product/user deletion rules apply
ACTIVE CONTEXT       compactable
TOOL / OS SESSION    restartable
LOCAL ROOT           persistent canonical state
PROJECT IDENTITY     persistent
```

The model can change. Active context can shrink. The user can still inspect earlier transcript history. A runtime can restart. The project still has continuity because its canonical state exists outside transient model context.

---

## Why the expansion surface is large

The current repository proves only a small core pattern, but the architecture opens several directions.

### Automatic state promotion
Detect decisions, verified methods, constraints, failures, and hot paths before compaction, then patch the smallest canonical ROOT owner automatically.

### Thread health management
Track context growth, recent compactions, retrieval quality, stale assumptions, and recommend compaction before the conversation becomes noisy.

### Compaction scheduler
Move from manual `압축해` to policy-based maintenance: compact at safe boundaries, after durable-state promotion, or before expensive project phases.

### Transcript-aware retrieval
Use the retained human-visible transcript as historical evidence without forcing the entire transcript back into every active model context.

### Project continuity across model upgrades
Keep the same ROOT state while switching model families or reasoning modes without reconstructing the project from raw conversation history.

### Recovery after tool/runtime loss
Rehydrate a project from ROOT + verified hot paths instead of replaying an entire chat transcript.

### Multi-agent orchestration
Use one human-facing primary project thread while isolated agents/Codex stages run in separate execution threads and return only promoted durable results.

### Portable project roots
Move the persistent ROOT between ChatGPT, Codex, local agents, or future model runtimes while keeping the project authority structure stable.

### Long-horizon AI workspaces
Treat transcript, active context, and canonical project state as separate resources—closer to an operating system for AI work than a conventional chat log.

These are **roadmap directions**, not claims of completed functionality.

---

## Research boundary

Verified empirically on **2026-09-04** in one long-lived ChatGPT execution thread with tool execution available.

Observed in the tested ChatGPT UI:

- repeated automatic compaction occurred;
- the same turn/project could continue afterward;
- earlier messages remained visible when scrolling upward after compaction.

OpenAI Codex source was also inspected for implementation evidence relevant to active-context compaction behavior. In particular:

- auto-compaction can be followed by model/tool continuation in the same turn;
- compact paths replace the live model-visible history via `Session::replace_compacted_history(...)`;
- Codex exposes an automatic-compaction token threshold in configuration.

OpenAI's ChatGPT retention documentation states that kept chats remain saved to the user's account until the user deletes them.

These three evidence types must not be conflated:

```text
ChatGPT UI observation     → old transcript remained scrollable
OpenAI retention policy    → kept chats are saved until deleted
Open-source Codex evidence → active model-visible history can be replaced/compacted
```

Together they motivate the three-layer operational model, but they do **not** prove ChatGPT's private backend storage schema or that the ChatGPT product harness is internally identical to open-source Codex.

This research concerns **active model-visible context and project continuity**. It does not claim provider-side raw logs, audit data, or retention records are physically deleted by compaction.

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
│   ├── EXPERIMENT_LOG_2026-09-04.md
│   └── TRANSCRIPT_AFTER_COMPACTION_2026-09-04.md
└── tools/
    └── noop_boundary.py
```

## Status

**Experimental / operationally verified in one long-lived ChatGPT thread.**

The next research targets are repeated-compaction quality loss, transcript/context boundary behavior, and a supported native compaction path or host-visible compaction signal.
