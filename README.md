# Persistent Project Thread

> **A ChatGPT persistence experiment: durable project state, compactable model context, and the discovery that the thread itself is also a replaceable resource.**

**Persistent Project Thread (PPT)** is an independent Root Engineering experiment that began by asking whether one long-running ChatGPT project could become a persistent workspace instead of a sequence of disposable conversations.

The architecture separated several resources that conventional chat workflows often mix together:

```text
ONE PROJECT
   │
   ├── CHAT / THREAD SURFACE          ← product-level session container
   │
   ├── CHAT TRANSCRIPT                ← human-visible history
   │
   ├── ACTIVE MODEL CONTEXT           ← compactable working memory
   │
   ├── LOCAL ROOT                     ← durable canonical project state
   │      ├── Child MDs
   │      ├── decisions + rationale
   │      ├── failure memory
   │      └── verified routes
   │
   └── LOCAL CAPABILITY WORKSPACE     ← reusable behavior + execution assets
          ├── Skills
          ├── Hot Paths
          ├── runtime helpers
          ├── caches / manifests
          ├── generated artifacts
          ├── optional model assets
          └── recovery state
```

The mental model originally became:

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

## Important update — the permanent-thread hypothesis failed

The original long-horizon hypothesis was stronger than the verified compaction findings:

> **If durable project state is externalized and active model context can be repeatedly compacted, one ChatGPT thread can become a practically permanent project workspace.**

That stronger hypothesis was eventually falsified.

The active-context part worked for substantial periods:

- automatic compaction was observed repeatedly;
- the same conversation continued after compaction;
- older messages remained visible to the user;
- project truth could remain externalized in a Local ROOT.

But a later long-horizon observation exposed a higher-level boundary:

```text
long-running ChatGPT thread
→ repeated active-context compaction
→ human-visible transcript keeps accumulating
→ same thread eventually becomes unavailable for continued work
```

Therefore:

> **Managing active model context is not sufficient to make one ChatGPT thread indefinitely persistent.**

The exact internal cause is unknown. This repository does not claim a specific message-count threshold, transcript-token threshold, UI limit, backend limit, or private OpenAI policy rule. The strongest supported conclusion is that the tested ChatGPT/OpenAI-hosted environment exposed a **thread/product-level lifecycle boundary independent of successful active-context compaction**.

Full evidence:

- `evidence/LONG_HORIZON_THREAD_LIMIT_2026-09-05.md`

This failure changed the architecture rather than ending the research.

The persistence boundary moves upward:

```text
PROJECT / AGENT IDENTITY
    ≠ THREAD
    ≠ HUMAN-VISIBLE TRANSCRIPT
    ≠ ACTIVE MODEL CONTEXT
    ≠ TOOL / MODEL RUNTIME
```

The new principle is:

> **The goal is not to make the thread permanent. The goal is to make the project survive the thread.**

The generalized research continues under **[Root Engineering](https://github.com/Valon-Jang/Root-Engineering)**.

> **Model is replaceable. Context is replaceable. Thread is replaceable. Root persists.**

Persistent Project Thread remains the experiment and evidence repository that exposed this boundary.

---

## Why this could matter

Long AI projects usually hit more than one failure mode.

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

### 3. Thread-level lifetime

Even if active model context is successfully compacted, the hosting product may still impose an independent lifecycle boundary on the conversation itself. The tested long-horizon ChatGPT thread eventually demonstrated this failure mode.

Persistent Project Thread therefore separates the problems:

```text
Human history problem       → retained Chat transcript
Durable knowledge problem   → Local ROOT / Child MD
Active-context problem      → Compaction
Repeated-method problem     → Local Skills / Hot Paths
Expensive setup problem     → Local caches / runtime state
Thread-lifetime problem     → project identity must survive thread replacement
```

That creates a more general project loop:

```text
work
→ promote durable state into ROOT
→ promote verified methods into Skills / Hot Paths
→ compact active model context when useful
→ keep using the current thread while it remains viable
→ when the thread reaches a product boundary, preserve project identity outside it
→ rehydrate the next execution surface from canonical state
```

The chat can still be a useful **project workspace**, but the thread itself is no longer treated as the permanent object.

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

So active-context compaction and human-visible transcript retention had to be treated as different operational concerns.

The 2026-09-05 long-horizon observation added one more boundary:

```text
active context can be maintained
≠ thread can live forever
```

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
12. Continue the same project chat while that thread remains viable
```

If required durable-state persistence fails, **do not deliberately compact yet**.

Once a valid local ROOT exists, the Skill also avoids rediscovering the same canonical project state through File Library, Drive, GitHub, or Web merely to prepare compaction.

**3,200-line pressure is evidence, not the hot path.**

The current Skill does **not** implement automatic provider-thread rollover. That is a Root Engineering research direction derived from the long-horizon failure.

---

## Root Engineering evolution

Root Engineering started from a simple principle:

> **Model is replaceable. Root persists.**

Persistent Project Thread first extended it:

> **Transcript can remain. Active context can be compacted. Root preserves project state. Skills preserve verified behavior.**

The long-horizon thread failure extends it again:

> **Model is replaceable. Context is replaceable. Thread is replaceable. Root persists.**

That yields a layered project architecture:

```text
MODEL                    replaceable
ACTIVE CONTEXT            compactable / replaceable
CHAT THREAD / SESSION     replaceable at the architecture level
CHAT TRANSCRIPT           retained according to product/user controls, but not a persistence authority
TOOL / OS SESSION         restartable
LOCAL ROOT                canonical project state while local storage survives
CHECKPOINT                resume bridge across context/session replacement
LOCAL SKILLS / HOT PATHS  reusable capability while installed
GITHUB / EXTERNAL BACKUP  durable distribution / recovery for reusable capability
PROJECT IDENTITY          persistent by design
```

The model can change. Active context can shrink. A thread can eventually reach a host boundary. A runtime can restart. Verified methods can be reloaded as Skills. The project still has continuity only if its authority and capability are externalized from those transient resources.

---

## Why the expansion surface is large

### Automatic state promotion
Detect decisions, verified methods, constraints, failures, and hot paths before compaction, then patch the smallest canonical ROOT owner automatically.

### Automatic capability promotion
Detect a repeatedly verified method, package it into a Skill or Hot Path, and make it available to later work.

### Thread health management
Track context growth, recent compactions, retrieval quality, stale assumptions, transcript growth, and signs that a thread may be approaching a product-level boundary.

### Thread/session rollover
Treat thread replacement as a normal lifecycle event: persist authoritative state, refresh CHECKPOINT, establish a new execution session, selectively rehydrate only what is required, and continue the same project identity. This is a research direction, not a currently verified ChatGPT-native capability.

### Human-view compression
A future user-owned platform could preserve raw event history separately while collapsing older visible conversation segments into summaries/cards that can be expanded on demand. This could remove the requirement that the entire accumulated transcript remain permanently rendered in one chat surface.

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
Use one stable project identity while primary human-facing surfaces and isolated execution agents may use different, replaceable sessions.

### Portable project roots and capability packs
Move ROOT + Skill packages between ChatGPT, Codex, local agents, or future model runtimes while keeping project authority and verified behavior stable.

### Long-horizon AI workspaces
Treat thread, transcript, active context, canonical state, and installed capability as separate resources—closer to an operating system for AI work than a conventional chat log.

These are **roadmap directions**, not claims of completed functionality.

---

## Research boundary

Verified empirically on **2026-09-04** in one long-lived ChatGPT execution thread with tool execution available:

- repeated automatic compaction occurred;
- the same turn/project could continue afterward;
- earlier messages remained visible when scrolling upward after compaction;
- a writable local filesystem was available and could store project/capability artifacts.

A later observation on **2026-09-05** in the long-lived project workflow found that repeated active-context compaction did **not** make the same ChatGPT thread indefinitely usable. The thread eventually reached a product-level boundary and became unavailable for continued work. The internal cause of that boundary is unknown.

OpenAI Codex source was also inspected for implementation evidence relevant to active-context compaction behavior. OpenAI's ChatGPT retention documentation was used separately for kept-chat retention behavior.

These evidence types must not be conflated, and local-storage capacity/lifetime must not be generalized from one runtime measurement.

This research does not claim ChatGPT's private backend storage schema, universal no-op compaction behavior, permanent `/mnt/data` persistence, or a specific private rule responsible for the observed thread-level limit.

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
│   ├── LOCAL_STORAGE_CAPACITY_2026-09-04.md
│   └── LONG_HORIZON_THREAD_LIMIT_2026-09-05.md
└── tools/
    └── noop_boundary.py
```

## Status

**Experimental research. The permanent-single-thread hypothesis is falsified; the surviving persistence architecture continues under Root Engineering.**

Persistent Project Thread remains useful as the evidence repository for:

- active-context compaction behavior;
- transcript/context separation;
- local Root and capability preservation;
- compaction trigger reduction;
- and the long-horizon discovery that thread lifetime is a separate resource boundary.

The next research target is no longer “make one ChatGPT thread permanent.” It is **project/agent continuity across replaceable models, contexts, runtimes, and threads**.
