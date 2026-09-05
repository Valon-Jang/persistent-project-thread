# Long-Horizon Thread Limit Observation — 2026-09-05

## Observation

Environment: one long-lived ChatGPT project conversation used continuously after repeated active-context compaction experiments.

The working hypothesis behind Persistent Project Thread was that separating durable project state from active model context, then repeatedly compacting that active context, could allow one ChatGPT conversation to serve as a practically permanent project workspace.

The active-context part worked for substantial periods. Compaction was repeatedly observed, the same conversation continued, and earlier messages remained visible in the ChatGPT UI after compaction.

A later long-horizon observation exposed a higher-level limit:

```text
long-running ChatGPT thread
→ repeated active-context compaction
→ human-visible transcript continues to accumulate
→ same thread eventually becomes unavailable for continued work
```

This falsifies the stronger hypothesis:

> **Managing active model context is sufficient to make one ChatGPT thread an indefinitely persistent project workspace.**

It is not sufficient in the tested environment.

## What this supports

The failure does not invalidate the earlier compaction observations. Instead, it reveals another independent lifecycle boundary.

The operational model should now separate at least these resources:

```text
THREAD / CHAT SURFACE
= product-level execution container with a bounded lifetime in the tested environment

HUMAN-VISIBLE TRANSCRIPT
= accumulating user-facing history

ACTIVE MODEL CONTEXT
= compactable inference working memory

ROOT / CHECKPOINT / CAPABILITIES
= project continuity outside the transient model/session boundary
```

The important architectural lesson is:

> **Active-context lifetime and thread lifetime are different problems.**

## What this does NOT prove

This observation does not identify the internal reason the thread became unavailable.

It does not prove:

- a specific message-count limit;
- a specific transcript token or byte threshold;
- a UI payload limit;
- a backend database limit;
- a retention-policy threshold;
- a specific private OpenAI/ChatGPT implementation rule.

The strongest supported wording is that the tested ChatGPT/OpenAI-hosted environment exposed a **product/thread-level boundary independent of successful active-context compaction**.

## Hypothesis status

### Supported findings

1. Human-visible transcript and active model context behave as distinct operational resources.
2. Active-context compaction can occur while older transcript remains visible.
3. A durable external Root can preserve project authority independently of current model working context.
4. Checkpoints and verified capabilities can support continuation after context replacement.

### Falsified long-horizon claim

```text
Active-context compaction
+ retained transcript
+ durable Root
= one permanent ChatGPT thread
```

The final implication does not hold in the tested long-horizon case.

## Research continuation

Persistent Project Thread remains the experiment and evidence repository for this finding.

The surviving architecture continues under **Root Engineering**.

The research question changes from:

> **How do we make one ChatGPT thread permanent?**

to:

> **How do we make the project survive models, contexts, runtimes, and threads?**

The generalized persistence model becomes:

```text
PROJECT / AGENT IDENTITY
    ≠ THREAD
    ≠ HUMAN-VISIBLE TRANSCRIPT
    ≠ ACTIVE MODEL CONTEXT
    ≠ TOOL / MODEL RUNTIME
```

Current Root Engineering research direction:

> **Model is replaceable. Context is replaceable. Thread is replaceable. Root persists.**

A future platform could preserve raw history separately while compressing the human-facing view, selectively retrieving old events into model context, and rolling over provider sessions behind one stable project identity. That is a design direction, not a claim about current ChatGPT functionality.

## Status

Empirical long-horizon product observation reported by the user on **2026-09-05**.

Research continues in:

- `Valon-Jang/Root-Engineering`
- `docs/ROOT_ENGINEERING_1.0_PERSISTENT_THREAD_FUSION.md`
