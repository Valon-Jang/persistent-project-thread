# Persistent Project Thread Architecture

## 1. Problem

Long-running AI projects have multiple competing failure modes.

### Many-chat fragmentation

Creating a new conversation for every subtask reduces local context size but fragments decisions, rationale, vocabulary, progress, and references. The operator repeatedly pays a reconstruction cost.

### One-chat context growth

Keeping everything in one conversation preserves continuity but eventually makes the **active model context** large enough that automatic or manual compaction becomes relevant.

### Thread-level lifetime

The long-horizon experiment added a third failure mode: even when active model context is repeatedly compacted, the surrounding Chat/thread may still reach an independent product-level lifecycle boundary.

The architectural mistake is therefore broader than originally assumed. It is not enough to separate only transcript, model context, and durable state. The current **thread/session surface itself** must also be treated as a separate resource.

## 2. Four-layer persistence model

Persistent Project Thread now separates these roles.

```text
┌────────────────────────────────────┐
│ 1. THREAD / CHAT SURFACE           │
│ Current product-level container    │
│ Replaceable at architecture level  │
└────────────────────────────────────┘
                 │
                 │ renders / hosts
                 ▼
┌────────────────────────────────────┐
│ 2. CHAT TRANSCRIPT                 │
│ Human-visible conversation history │
│ Historical evidence / user view    │
└────────────────────────────────────┘
                 │
                 │ selected/compacted model input
                 ▼
┌────────────────────────────────────┐
│ 3. ACTIVE MODEL CONTEXT            │
│ Working memory for inference       │
│ Compactable / replaceable          │
└────────────────────────────────────┘
                 │
                 │ durable-state promotion
                 ▼
┌────────────────────────────────────┐
│ 4. LOCAL ROOT + CHECKPOINT         │
│ Canonical project state + resume   │
│ Authority outside session/context  │
└────────────────────────────────────┘
```

Operationally:

```text
Thread         = current execution surface
Transcript     = history for the human
Active context = working memory for the model
Local ROOT     = durable state for the project
Checkpoint     = bounded resume state
```

This is an operational model, not a claim about ChatGPT's private database schema.

The generalized identity rule is:

```text
PROJECT / AGENT IDENTITY
    ≠ THREAD
    ≠ TRANSCRIPT
    ≠ ACTIVE CONTEXT
    ≠ MODEL / TOOL RUNTIME
```

## 3. Supporting observations

### 3.1 Active-context compaction

In the tested long-lived ChatGPT thread, automatic compaction was observed repeatedly. After compaction:

- the same project thread remained usable for substantial periods;
- model/tool continuation could proceed;
- the user could scroll upward and still see earlier messages in the ChatGPT UI.

OpenAI's published ChatGPT retention documentation also states that chats kept by the user remain saved to the account until deleted:

- https://help.openai.com/en/articles/8983778-how-are-files-vs-chats-retained

That does not reveal the product's internal storage implementation, but it reinforces an important operational rule:

> **Do not treat active-context compaction as chat-transcript deletion.**

### 3.2 Long-horizon thread failure

A later observation on 2026-09-05 showed:

```text
long-running thread
→ repeated active-context compaction succeeds
→ human-visible transcript continues to accumulate
→ same thread eventually becomes unavailable for continued work
```

Evidence:

- `evidence/LONG_HORIZON_THREAD_LIMIT_2026-09-05.md`

This falsifies the stronger claim that successful context maintenance is sufficient to make one ChatGPT thread indefinitely persistent.

The exact internal cause is unknown. No specific message-count, transcript-size, UI, backend, storage, or retention-policy threshold is claimed.

The supported conclusion is:

> **Active-context lifetime and thread lifetime are different problems.**

## 4. Separation of responsibilities

| Layer | Role | Expected lifetime |
|---|---|---|
| Thread / Chat surface | current provider/product execution container | bounded / replaceable |
| Chat transcript | human-readable project history and evidence | retained according to product/user controls; not canonical authority |
| Active model context | current working context used for inference | transient, compactable |
| Local ROOT | authority, routing, durable project state | persistent while local storage survives |
| CHECKPOINT | immediate resume state | transient but explicitly persisted |
| Child MD | detailed canonical rules/state per subsystem | persistent |
| Hot path | verified execution shortcut | persistent while valid |
| Archive/History | superseded evidence | persistent but non-canonical |
| Compaction | reduce/replace active model-visible history | episodic |
| Future session rollover | replace execution surface while preserving project identity | research direction |

## 5. Core flow

Current Rebirth/PPT operation inside one viable Chat:

```text
User works in current project chat
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
Verify durable state is canonical
         │
         ▼
Compact ACTIVE CONTEXT
         │
         ▼
Rehydrate bounded working state
         │
         ▼
Continue SAME thread while viable
```

Architecture-level continuation when the thread itself is no longer viable:

```text
Current thread reaches product/session boundary
        │
        ▼
Project truth already persisted in ROOT
        │
        ▼
Refresh / seal CHECKPOINT + recovery evidence
        │
        ▼
Replace execution/session surface
        │
        ▼
Rehydrate ROOT + CHECKPOINT + required owners only
        │
        ▼
Continue SAME PROJECT IDENTITY
```

The second flow is a research architecture. Transparent provider-thread rollover is not claimed as a currently implemented ChatGPT-native feature.

## 6. Why this is Root Engineering

Root Engineering treats the model and transient context as replaceable execution resources. The long-horizon failure extends the same principle to the thread itself.

```text
model can change
active context can be compressed/replaced
thread/session can eventually end
individual tool sessions can restart
but ROOT provides the stable project identity
```

The new principle becomes:

> **Model is replaceable. Context is replaceable. Thread is replaceable. Root persists.**

## 7. One-project-one-chat is an optimization, not an identity rule

Use one primary project Chat thread while continuity is beneficial and the thread remains viable.

Do **not** equate:

```text
one project
=
one permanent provider thread
```

Create or replace separate threads/processes when isolation or lifecycle requires it, for example:

- Codex stage contracts requiring one thread per stage;
- concurrent independent agents;
- untrusted/destructive experiments;
- permission/security boundaries;
- a deliberately clean evaluation context;
- a provider/product thread that has reached its practical lifetime.

The architecture distinguishes **project-level identity** from **execution-level session continuity**.

## 8. Canonicalization gate before compaction or rollover

Neither compaction nor session replacement may be used as a substitute for saving important state.

Before either transition ask:

- What changed since the last ROOT/Child MD update?
- Which decisions would be expensive to reconstruct?
- Which successful operational path was verified?
- Which failed approach must not be repeated?
- Did any canonical path or authority relationship change?
- What transient work is required to resume immediately?

Durable answers go to Root owners. Immediate resume state goes to CHECKPOINT.

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

Compaction success means only that **active model context maintenance succeeded**. It does not prove transcript compression or thread lifetime extension beyond the product boundary.

## 10. Transcript vs human view vs retrieval

The fact that old messages remain visible to the human does **not** imply the model receives all of them on every turn.

The long-horizon failure also suggests that a future user-owned platform should not require raw accumulated history to remain fully rendered forever.

A stronger future architecture is:

```text
RAW EVENT / TRANSCRIPT HISTORY
     │
     ├── durable/auditable source record
     │
     ├── selective retrieval for model context
     │
     └── compressed HUMAN VIEW
            ├── summaries/cards for old segments
            └── expand raw history on demand

ACTIVE MODEL CONTEXT
     └── only what is needed for current inference

ROOT + CHECKPOINT
     └── authoritative project state + immediate resume state
```

This makes **human-view compression** different from both context compaction and raw-history deletion.

## 11. Agent architecture implication

The result generalizes beyond ChatGPT project chats.

A long-lived agent may outlive:

- one model version;
- one context window;
- one provider session;
- one tool runtime;
- one UI surface.

Therefore a durable agent should separate:

```text
AGENT / PROJECT IDENTITY
│
├── DURABLE STATE
├── CHECKPOINT
├── EVENT / HISTORY LOG
├── WORKING CONTEXT
├── SESSION / THREAD
├── SKILLS / TOOLS
└── HUMAN VIEW
```

An agent is not identical to its current model, context, or conversation. Persistence belongs to the identity and canonical state that can survive replacement of those resources.

## 12. Expansion model

Possible future layers include:

- automatic durable-state extraction before context/session transitions;
- transcript-aware selective retrieval;
- context-health scoring and proactive maintenance;
- separate context epochs and session/thread epochs;
- session rollover policies;
- human-view compression with raw-history preservation;
- repeated transition quality monitoring;
- cross-model project continuity;
- recovery from runtime/tool loss using ROOT + hot paths;
- one stable project identity with isolated execution-agent sessions;
- portable ROOT packages shared across ChatGPT, Codex, and local agents.

These are roadmap directions, not currently verified capabilities.

## 13. Product framing

This architecture should be described as an **independent Root Engineering pattern for project and agent continuity**, not as an official ChatGPT feature.

The original permanent-single-thread hypothesis is no longer the central claim.

The surviving claim is operational:

> A long-running AI project can separate the current thread, human-visible transcript, model working context, and durable canonical state. That separation allows project continuity to be designed independently of any one model/context/session lifetime.

## 14. Status

The permanent-single-thread hypothesis is **falsified in the tested long-horizon ChatGPT workflow**.

The following findings remain supported by the experiment:

- active-context compaction behavior;
- transcript/context separation;
- durable Root as external project authority;
- reusable local capability preservation;
- the discovery that thread lifetime is a separate product/session boundary.

The generalized research continues under **Root Engineering** as thread-replaceable project/agent continuity.
