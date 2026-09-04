# Persistent Project Thread

> **A practical ChatGPT innovation: one project, one persistent thread, durable local state, reusable local capabilities, and compaction instead of conversation reset.**

**Persistent Project Thread (PPT)** is an independent Root Engineering experiment for turning a long-running ChatGPT project into a persistent workspace instead of a sequence of disposable conversations.

The architecture separates several resources that conventional chat workflows often mix together:

```text
ONE PROJECT
   │
   ├── CHAT TRANSCRIPT               ← human-visible history
   │      └── old messages can remain scrollable after compaction
   │
   ├── ACTIVE MODEL CONTEXT          ← compactable working memory
   │      └── compact / replace when needed
   │
   ├── LOCAL ROOT                    ← durable canonical project state
   │      ├── Child MDs
   │      ├── decisions + rationale
   │      ├── failure memory
   │      └── verified routes
   │
   └── LOCAL CAPABILITY WORKSPACE    ← reusable behavior + execution assets
          ├── Skills
          ├── Hot Paths
          ├── runtime helpers
          ├── caches / manifests
          ├── generated artifacts
          ├── optional model assets
          └── recovery state
```

The mental model becomes:

```text
Transcript          = history for the human
Active context      = working memory for the model
Local ROOT          = durable truth for the project
Local Skills/assets = reusable capability for future work
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
Repeated-method problem     → Local Skills / Hot Paths
Expensive setup problem     → Local caches / runtime state
```

That creates a different project loop:

```text
work
→ promote durable state into ROOT
→ promote verified methods into Skills / Hot Paths
→ keep using the same project chat
→ compact active model context when needed
→ user can still scroll historical transcript
→ continue the same chat with stronger local capability
```

The chat becomes a **persistent project workspace**, while neither raw transcript nor active context has to serve as the project database.

---

## The experiment that changed the design

The research did not begin with the no-op trick.

First, a **compaction minefield** was built around the local Chat-attached container: process watchers, filesystem traps, TCP/Unix-socket observation, cgroup changes, file descriptors, environment changes, identifier-like strings, and Codex/socket-like endpoints. Synthetic probes verified that multiple watchers worked. During a real auto-compaction event, no decisive matching local process/file/socket/identifier event appeared.

That pushed the working hypothesis upward: the observed compaction looked like a **host/harness-owned transition**, not an obvious operation exposed inside the local tool container.

See:

- `evidence/COMPACTION_TRAP_MINEFIELD_2026-09-04.md`

The next hypothesis assumed that a large tool output was needed to push the long thread across an automatic-compaction threshold.

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

## Local Capability Workspace

The writable local filesystem changes the expansion surface dramatically. It can store not just project facts but **reusable behavior and execution state**.

```text
Local ROOT / Child MDs    project truth
Local Skills              reusable behavior contracts
Hot Paths                 verified low-latency execution recipes
Runtime helpers           scripts / deterministic tooling
Caches / manifests        disposable acceleration + provenance
Artifacts                 WAV / JSON / reports / generated outputs
Model/runtime assets      optional large assets when capacity permits
Recovery state            pointers / hashes / checkpoints / restore notes
```

That enables a capability accumulation loop:

```text
problem
→ experiment
→ verify success
→ Skill-ize / Hot-Path the method
→ store locally
→ reuse later without rediscovering it
```

A base model can therefore gain a user-controlled external capability layer **without retraining the model**.

The tested `/mnt/data` filesystem on 2026-09-04 reported:

```text
capacity:  33,770,192,896 bytes (~31.5 GiB)
available: 24,580,431,872 bytes (~22.9 GiB)
free inodes: 2,096,861
write probe: PASS
```

These values are evidence from one environment, **not a ChatGPT storage guarantee**. The Skill must re-measure the filesystem containing the actual ROOT instead of assuming `32G`.

See:

- `docs/LOCAL_CAPABILITY_WORKSPACE.md`
- `evidence/LOCAL_STORAGE_CAPACITY_2026-09-04.md`

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

The Skill now enforces a **Pre-Compaction Save Gate**:

```text
1. Resolve the canonical local ROOT
2. Read ROOT routing and select the smallest canonical owner
3. Measure the filesystem containing ROOT
4. Verify free bytes / free inodes / write capability
5. Save only new durable state to ROOT / Child MD / Hot Path
6. Read back and verify the save
7. Only then attempt compaction
8. Prefer a supported native compact action if exposed
9. Otherwise use a previously verified minimal boundary trigger
10. Verify active-context compaction
11. Stop immediately on success
12. Continue the same project chat
```

If required durable-state persistence fails, **do not deliberately compact yet**.

Once a valid local ROOT exists, the Skill also avoids rediscovering the same canonical project state through File Library, Drive, GitHub, or Web merely to prepare compaction.

**3,200-line pressure is evidence, not the hot path.**

---

## Root Engineering evolution

Root Engineering started from a simple principle:

> **Model is replaceable. Root persists.**

Persistent Project Thread extends it:

> **Transcript can remain. Active context can be compacted. Root preserves project state. Skills preserve verified behavior. The project continues.**

That yields a layered project architecture:

```text
MODEL                    replaceable
CHAT TRANSCRIPT           retained for human history until product/user deletion rules apply
ACTIVE CONTEXT            compactable
TOOL / OS SESSION         restartable
LOCAL ROOT                persistent canonical state while local storage survives
LOCAL SKILLS / HOT PATHS  reusable capability while installed
GITHUB / EXTERNAL BACKUP  durable distribution / recovery for reusable capability
PROJECT IDENTITY          persistent by design
```

The model can change. Active context can shrink. The user can still inspect earlier transcript history. A runtime can restart. Verified methods can be reloaded as Skills. The project still has continuity because its authority and capability are externalized from transient model context.

---

## Why the expansion surface is large

### Automatic state promotion
Detect decisions, verified methods, constraints, failures, and hot paths before compaction, then patch the smallest canonical ROOT owner automatically.

### Automatic capability promotion
Detect a repeatedly verified method, package it into a Skill or Hot Path, and make it available to later work.

### Thread health management
Track context growth, recent compactions, retrieval quality, stale assumptions, and recommend compaction before the conversation becomes noisy.

### Compaction scheduler
Move from manual `압축해` to policy-based maintenance: compact at safe boundaries, after durable-state promotion, or before expensive project phases.

### Transcript-aware retrieval
Use retained transcript history as human evidence or selective retrieval material without forcing the whole transcript back into every active model context.

### Storage-aware capability planning
Choose whether to install models, caches, tools, or recovery bundles based on current disk/memory capacity instead of fixed assumptions.

### Project continuity across model upgrades
Keep the same ROOT and Skill layer while switching model families or reasoning modes without reconstructing the project from raw conversation history.

### Recovery after tool/runtime loss
Rehydrate a project from ROOT + verified Hot Paths + external Skill backups instead of replaying an entire chat transcript.

### Multi-agent orchestration
Use one human-facing primary project thread while isolated agents/Codex stages run in separate execution threads and return only promoted durable results.

### Portable project roots and capability packs
Move ROOT + Skill packages between ChatGPT, Codex, local agents, or future model runtimes while keeping project authority and verified behavior stable.

### Long-horizon AI workspaces
Treat transcript, active context, canonical state, and installed capability as separate resources—closer to an operating system for AI work than a conventional chat log.

These are **roadmap directions**, not claims of completed functionality.

---

## Research boundary

Verified empirically on **2026-09-04** in one long-lived ChatGPT execution thread with tool execution available.

Observed in the tested ChatGPT UI:

- repeated automatic compaction occurred;
- the same turn/project could continue afterward;
- earlier messages remained visible when scrolling upward after compaction;
- a writable local filesystem was available and could store project/capability artifacts.

OpenAI Codex source was also inspected for implementation evidence relevant to active-context compaction behavior. OpenAI's ChatGPT retention documentation was used separately for kept-chat retention behavior.

These evidence types must not be conflated, and local-storage capacity/lifetime must not be generalized from one runtime measurement.

This research does not claim ChatGPT's private backend storage schema, universal no-op compaction behavior, or permanent `/mnt/data` persistence.

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
│   ├── CHAT_COMPACTION_RESEARCH.md
│   └── LOCAL_CAPABILITY_WORKSPACE.md
├── evidence/
│   ├── FORCE_COMPACT_PROTOCOL_v2.md
│   ├── EXPERIMENT_LOG_2026-09-04.md
│   ├── COMPACTION_TRAP_MINEFIELD_2026-09-04.md
│   ├── TRANSCRIPT_AFTER_COMPACTION_2026-09-04.md
│   └── LOCAL_STORAGE_CAPACITY_2026-09-04.md
└── tools/
    └── noop_boundary.py
```

## Status

**Experimental / operationally verified in one long-lived ChatGPT thread.**

The next research targets are repeated-compaction quality loss, automatic ROOT/Skill promotion, storage lifecycle behavior, transcript/context boundary behavior, and a supported native compaction path or host-visible compaction signal.
