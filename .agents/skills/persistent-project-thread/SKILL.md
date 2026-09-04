---
name: persistent-project-thread
description: Maintain one long-lived project chat by promoting durable state into a local ROOT/Child MD hierarchy and compacting active conversation when needed. Use when the user asks to keep one chat per project, save project state before compaction, compress/compact a long chat, continue after compaction, or design a Root Engineering persistent-thread workflow.
---

# Persistent Project Thread Skill

## 0. Purpose

Keep a project usable in **one long-lived conversation** without treating raw chat history as the project's durable memory.

Use this separation:

```text
Conversation = working memory
Local ROOT   = persistent project state
Compaction   = working-memory maintenance
```

The project continues in the same thread after compaction whenever the host supports that behavior.

## 1. Non-negotiable rule: persist before compact

Before deliberately compacting a meaningful long-running project conversation, inspect whether the current turn contains durable state that is not yet represented in the project's canonical local MD structure.

Durable state includes:

- confirmed decisions and rationale
- verified success paths
- user-approved constraints
- canonical file/path changes
- important failure fingerprints and do-not-repeat rules
- current project state needed after context reduction

If such state exists, patch the **smallest canonical owner** first: ROOT for routing/authority, Child MD for detailed rules, or a verified hot-path document for operational execution.

Do **not** dump the entire conversation into ROOT. Promote only durable state.

## 2. Default project model

For ordinary project conversation, prefer:

```text
1 project
→ 1 long-lived primary Chat thread
→ 1 local ROOT entry point
→ routed Child MDs by responsibility
→ compaction as needed
```

This rule does not prohibit separate execution threads when another system contract requires them, such as isolated Codex development stages, independent agents, security boundaries, or destructive experiments.

## 3. Compaction trigger priority

When the user explicitly asks `압축해`, `컴팩션`, `채팅 정리해`, or equivalent:

### Priority A — native supported compact action

If the current host exposes an explicit, supported compact action/API/tool, use it.

Do not invent an endpoint or claim access to an internal RPC that is not actually exposed by the current host.

### Priority B — verified zero-output boundary fallback

Use only when ALL are true:

1. The current environment has previously demonstrated automatic compaction at a tool/sampling boundary under matching conditions.
2. A zero-output/no-op tool boundary is available.
3. The host provides a reliable signal that compaction/reset occurred, or the agent can otherwise verify the active context was compacted.

Then:

```text
persist durable state
→ execute exactly one zero-output no-op boundary
→ verify compaction
→ STOP triggering immediately on success
→ continue normal work
```

The reference no-op is semantically just:

```python
pass
```

The useful event is the **tool boundary**, not the Python statement.

### Priority C — bounded adaptive diagnostic pressure

Only if a required compaction has not occurred and there is no native action.

Use small bounded increments, checking after every boundary. Never start with thousands of lines.

Example diagnostic progression:

```text
1 small chunk
→ verify
→ 20 lines
→ verify
→ 100 lines
→ verify
→ 400 lines maximum unless user explicitly authorizes deeper experiment
```

Stop immediately when compaction occurs.

## 4. Do-not-repeat rules

- Do not make 3,200-line pressure output the default.
- Do not continue pressure after compaction success.
- Do not assume a zero-output boundary universally forces compaction.
- Do not describe active-context compaction as physical deletion of provider/audit records.
- Do not compact before persisting new durable state.
- Do not create a new project chat merely because the current chat is long if compaction + ROOT continuity can preserve the workflow.
- Do not repeatedly fire no-op boundaries when success cannot be verified.

## 5. Success criteria

A compaction operation is complete only when:

1. durable project state needed for continuity is canonicalized locally;
2. compaction/reset is actually observed or confirmed by a supported native action;
3. no further pressure/tool trigger is emitted after success;
4. the next response can continue the same project using ROOT + compacted working context.

## 6. Research evidence boundary

Verified on 2026-09-04 in one long-lived ChatGPT execution thread:

```text
3200 lines → observed auto-compaction
400 lines  → observed auto-compaction
100 lines  → observed auto-compaction
20 lines   → observed auto-compaction
1 line     → observed auto-compaction
zero-output no-op tool boundary → observed auto-compaction
```

Interpretation: the thread appeared already eligible for automatic compaction, and a subsequent tool/sampling boundary was sufficient to let the host perform it. This is **environment-specific evidence**, not a universal ChatGPT guarantee.

## 7. Source-backed behavioral model

OpenAI Codex source provides useful implementation evidence for Codex itself:

- `session/turn.rs` states that after auto-compaction, model/tool continuation may resume before pending steer/input is drained.
- compaction paths call `Session::replace_compacted_history(...)` to replace the live model-visible history with compacted history.
- Codex configuration includes an auto-compaction token threshold.

These facts support the general architecture but do not prove that ChatGPT product harness internals are identical to open-source Codex.

See `docs/CHAT_COMPACTION_RESEARCH.md` for exact source links and experiment notes.

## 8. Root Engineering principle

> Model is replaceable. Root persists.
>
> Conversation can be compacted. Root preserves project state. The project continues.
