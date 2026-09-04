---
name: persistent-project-thread
description: Maintain one long-lived project chat by separating human-visible transcript history, compactable active model context, durable local ROOT/Child MD state, and reusable local capabilities. Use when the user asks to keep one chat per project, save project state before compaction, compress/compact a long chat, continue after compaction, or design a Root Engineering persistent-thread workflow.
---

# Persistent Project Thread Skill

## 0. Purpose

Keep a project usable in **one long-lived conversation** without treating raw chat history or active model context as the project's durable memory.

Use this separation:

```text
Chat Transcript           = human-visible project history
Active Model Context      = compactable model working memory
Local ROOT / Child MD     = persistent canonical project state
Local Capability Workspace= reusable Skills / hot paths / runtime assets
```

Compaction maintains the **active model context**. It is not a request to delete the user's visible chat transcript.

The project continues in the same thread after compaction whenever the host supports that behavior.

## 1. Non-negotiable rule: persist before compact

Before deliberately compacting a meaningful long-running project conversation, inspect whether the current turn contains durable state that is not yet represented in the project's canonical local MD structure.

Durable state includes:

- confirmed decisions and rationale;
- verified success paths;
- user-approved constraints;
- canonical file/path changes;
- important failure fingerprints and do-not-repeat rules;
- current project state needed after context reduction.

Do **not** dump the entire conversation into ROOT. Promote only durable state.

Do **not** assume the visible transcript must be copied into ROOT merely because compaction is about to occur. Transcript history and canonical project state have different roles.

## 2. Pre-Compaction Save Gate — automatic local routing

When the user says `압축해`, `컴팩션`, `채팅 정리해`, or equivalent, do not jump directly to compaction.

Run this gate first:

```text
A. resolve canonical local ROOT
B. read ROOT routing / authority
C. identify the smallest canonical owner of any new durable state
D. check the filesystem containing ROOT
E. verify storage + write capability
F. patch only the required ROOT / Child MD / Hot Path
G. read back / verify the saved result
H. only then allow compaction
```

### A. Resolve canonical ROOT

Priority:

1. Use an explicit local ROOT path supplied by project/system/user instructions.
2. If the current project already has a known local canonical ROOT from the active workflow, reuse it.
3. Otherwise inspect the local project/workspace for its documented ROOT entry point or local project instruction file.
4. Once a valid local ROOT exists, **do not search File Library, Drive, GitHub, Web, or remote copies for the same canonical state** merely to prepare compaction.
5. If no trustworthy local ROOT can be resolved and new durable state must be saved, stop and report the blocker rather than compacting blindly.

### B–C. Route through ROOT

Read the ROOT only as needed to identify the authoritative Child MD / Hot Path owner.

Patch the **smallest canonical owner**:

```text
ROOT       → routing, authority, top-level state
Child MD   → subsystem-specific durable state
Hot Path   → verified repeated execution recipe
```

Do not create duplicate canonical files when an owner already exists.

### D–E. Local Storage Gate

Check the filesystem that actually contains the canonical ROOT, not a hard-coded mount assumption.

Verify at minimum:

- filesystem is present;
- target directory is writable;
- free bytes are sufficient for the intended write plus a reasonable safety margin;
- free inodes are available;
- an atomic/temp write probe is possible when safe;
- the final canonical write succeeds.

Useful Linux probes include `df -B1 <root-path>` and `df -i <root-path>` plus a harmless write/read/delete probe in the same writable directory or filesystem.

**Do not hard-code `32G` or any measured baseline as a platform guarantee.**

Observed research baseline on 2026-09-04 for `/mnt/data`:

```text
capacity:  33,770,192,896 bytes
available: 24,580,431,872 bytes
free inodes: 2,096,861
write probe: PASS
```

See `evidence/LOCAL_STORAGE_CAPACITY_2026-09-04.md`.

### F–G. Save and verify

Prefer minimal, atomic changes. After writing, read back the target and verify the expected durable state is present. If the write fails, verification fails, storage is unavailable, or the filesystem becomes read-only, **do not deliberately compact yet**.

Preserving active context is safer than compacting after a false assumption that state was saved.

## 3. Local Capability Workspace

The same writable local space can hold reusable capability, not only ROOT Markdown.

Possible layers:

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

ROOT remains small and authoritative. Bulk assets and caches belong in dedicated directories and should be referenced by path/hash when relevant.

A verified method may evolve through:

```text
problem → experiment → verified success → Skill / Hot Path → local reuse
```

Important reusable Skills and recovery packages should also be mirrored to a durable external source such as GitHub because local runtime persistence is not assumed permanent.

See `docs/LOCAL_CAPABILITY_WORKSPACE.md`.

## 4. Default project model

For ordinary project conversation, prefer:

```text
1 project
→ 1 long-lived primary Chat thread
→ retained human-visible transcript
→ compactable active model context
→ 1 local ROOT entry point
→ routed Child MDs by responsibility
→ reusable local Skills / Hot Paths where useful
→ compaction as needed
```

This rule does not prohibit separate execution threads when another system contract requires them, such as isolated Codex development stages, independent agents, security boundaries, or destructive experiments.

## 5. Compaction trigger priority

Only after the Pre-Compaction Save Gate passes:

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
→ verify active-context compaction
→ STOP triggering immediately on success
→ continue normal work in the same thread
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

## 6. Transcript rule

Compaction is **not transcript deletion**.

In the verified 2026-09-04 ChatGPT experiment, earlier messages remained visible when the user scrolled upward after repeated compaction events.

OpenAI's published ChatGPT retention documentation also states that chats kept by the user remain saved to the account until deleted.

Operational consequence:

```text
Need historical text for the human? → use/scroll transcript
Need model working memory reduced?   → compact active context
Need durable project truth?          → read Local ROOT / Child MD
Need reusable behavior?              → load Local Skill / Hot Path
```

Do not claim knowledge of ChatGPT's private database or storage service from this observation.

## 7. Do-not-repeat rules

- Do not make 3,200-line pressure output the default.
- Do not continue pressure after compaction success.
- Do not assume a zero-output boundary universally forces compaction.
- Do not describe active-context compaction as deletion of the visible transcript.
- Do not describe active-context compaction as physical deletion of provider/audit records.
- Do not compact before persisting new durable state.
- Do not compact when required local persistence failed or cannot be verified.
- Do not hard-code a local-storage size from one observed environment.
- Do not search remote copies for canonical project state when a valid local ROOT already owns it.
- Do not create a new project chat merely because the current chat is long if compaction + ROOT continuity can preserve the workflow.
- Do not repeatedly fire no-op boundaries when success cannot be verified.
- Do not load the entire historical transcript back into active context merely because it remains scrollable.
- If a host-level event is not visible locally, do not keep inventing local mechanisms after broad instrumentation has falsified the obvious local hypotheses.

## 8. Success criteria

A compaction operation is complete only when:

1. canonical local ROOT was resolved when required;
2. new durable project state needed for continuity was saved to the smallest canonical owner;
3. local storage/write health was sufficient and the saved result was verified;
4. active-context compaction/reset was actually observed or confirmed by a supported native action;
5. no further pressure/tool trigger was emitted after success;
6. the visible chat remains the same project thread unless the user chooses otherwise;
7. the next response can continue the same project using ROOT + compacted working context + reusable local capabilities.

## 9. Research evidence boundary

Verified on 2026-09-04 in one long-lived ChatGPT execution thread.

### Discovery experiment — trap minefield

Before the trigger-minimization experiment, the environment was instrumented with a broad "minefield" of watchers covering process activity, filesystem changes, TCP/Unix sockets, cgroup changes, file descriptors, environment changes, thread/turn/conversation-like identifiers, and Codex/socket-like local endpoints.

Synthetic control probes successfully triggered multiple watchers. During a real auto-compaction event, however, no decisive matching container-local process/file/socket/identifier event appeared.

Conservative interpretation: the observed compaction was not exposed as an obvious operation inside the attached local CaaS/container and was consistent with a higher host/harness-owned state transition.

See `evidence/COMPACTION_TRAP_MINEFIELD_2026-09-04.md`.

### Trigger reduction experiment

```text
3200 lines → observed auto-compaction
400 lines  → observed auto-compaction
100 lines  → observed auto-compaction
20 lines   → observed auto-compaction
1 line     → observed auto-compaction
zero-output no-op tool boundary → observed auto-compaction
```

After repeated compactions, the user also verified that earlier pre-compaction messages remained visible by scrolling upward in the same ChatGPT conversation.

Interpretation: the thread appeared already eligible for automatic compaction, and a subsequent tool/sampling boundary was sufficient to let the host perform it. The visible transcript and active model context behaved as different operational layers.

This is **environment-specific evidence**, not a universal ChatGPT guarantee or disclosure of private backend architecture.

## 10. Source-backed behavioral model

OpenAI Codex source provides useful implementation evidence for Codex itself:

- `session/turn.rs` states that after auto-compaction, model/tool continuation may resume before pending steer/input is drained.
- compaction paths call `Session::replace_compacted_history(...)` to replace the live model-visible history with compacted history.
- Codex configuration includes an auto-compaction token threshold.

OpenAI's ChatGPT retention documentation states that kept chats are saved to the user's account until deleted.

These facts support the architecture but do not prove that ChatGPT product harness internals are identical to open-source Codex or reveal ChatGPT's backend database structure.

See `docs/CHAT_COMPACTION_RESEARCH.md`, `docs/LOCAL_CAPABILITY_WORKSPACE.md`, and the `evidence/` directory.

## 11. Root Engineering principle

> Model is replaceable. Root persists.
>
> Transcript can remain. Active context can be compacted. Root preserves project state. Skills preserve verified behavior. The project continues.
