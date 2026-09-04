# Chat Compaction Research — 2026-09-04

## Research question

Can a long-lived project conversation be kept as the single primary thread while reducing active context overhead, and if automatic compaction is already eligible, what is the smallest trigger needed to let it occur?

A second research question emerged later:

> After active-context compaction, does the human-visible ChatGPT transcript disappear, or can the user still inspect old messages by scrolling?

## Stage 0 — the compaction minefield

Before trying to minimize a compaction trigger, the first question was more primitive:

> **Where does compaction happen at all?**

The user proposed a debugging experiment in plain language: **lay mines/traps everywhere, trigger compaction, and see which trap fires.**

Parallel watchers were placed around the Chat-attached local execution environment for:

- process creation / termination;
- filesystem writes and new files;
- TCP / Unix sockets and socket appearance;
- cgroup CPU / memory changes;
- file-descriptor changes;
- environment changes;
- `threadId` / `turnId` / `conversationId`-like strings in local state/logs;
- Codex/socket-like local endpoints;
- packet-level observation where the environment allowed it.

Control probes deliberately triggered process, keyword/string, filesystem, and socket/network watchers, proving that the minefield was capable of detecting synthetic events.

Then a real automatic-compaction event was observed. The active context reset, but there was no matching decisive compaction subprocess, file rewrite, local socket event, identifier appearance, or other obvious container-local signal. The packet-level watcher could not be used because raw-network capability was unavailable, so that branch remained explicitly unverified.

The conservative result was not "we found the hidden compaction command." It was the opposite:

> **The compaction observed in ChatGPT was not exposed as an obvious operation inside the attached CaaS/container environment covered by the working traps.**

That result shifted the research strategy upward. Instead of continuing to invent local mechanisms, the experiment treated compaction as a **host/harness-owned state transition** and moved to behavioral triggering at tool/sampling boundaries.

Full evidence:

- `evidence/COMPACTION_TRAP_MINEFIELD_2026-09-04.md`

## Initial trigger hypothesis

A large tool output might push the conversation over the host's automatic compaction threshold.

An early fallback produced thousands of harmless lines. It appeared to correlate with context reset/compaction, but it had an obvious inefficiency: a tool command generally completes its output before the next model/tool boundary. If the threshold had already been crossed partway through the output, the remainder could still be generated unnecessarily.

This raised another question:

> Does the pressure text itself matter, or is the next tool/sampling boundary sufficient once the thread is already eligible for auto-compaction?

## Reduction experiment

In the same long-lived ChatGPT thread, successive trials reduced output size.

| Trial | Tool output | Observed auto-compaction |
|---:|---:|---|
| 1 | ~3,200 lines | yes |
| 2 | 400 lines | yes |
| 3 | 100 lines | yes |
| 4 | 20 lines | yes |
| 5 | 1 line | yes |
| 6 | zero-output no-op (`pass`) | yes |

The thread continued after each observed compaction event.

## Most conservative interpretation

The experiment does **not** establish that an empty tool call universally forces ChatGPT compaction.

The supported interpretation is narrower:

1. This long-lived thread was apparently already at or beyond an automatic-compaction eligibility condition.
2. A subsequent tool/sampling boundary was sufficient for the host to perform automatic compaction.
3. Therefore large synthetic pressure output was unnecessary **in this state**.

This is operationally valuable because the fallback can avoid injecting large amounts of disposable text into conversation history.

## What happens to the current turn?

OpenAI Codex source contains a relevant comment in `codex-rs/core/src/session/turn.rs`:

> `After auto-compact, when model/tool continuation needs to resume before any steer.`

This supports the observed behavior that auto-compaction is not necessarily a terminal end-of-turn event; model/tool continuation may continue in the same turn after compaction.

Pinned source observed during research:

- https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/core/src/session/turn.rs

## What is replaced?

Codex compaction implementations call `Session::replace_compacted_history(...)`, and the session implementation replaces the live model-visible history structure.

Relevant source paths:

- https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/core/src/session/mod.rs
- https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/core/src/compact.rs
- https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/core/src/compact_remote.rs
- https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/core/src/compact_remote_v2.rs

Codex configuration also exposes `model_auto_compact_token_limit`, described as the token-usage threshold triggering automatic compaction:

- https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/config/src/config_toml.rs
- https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/core/config.schema.json

## New observation: transcript remains human-visible

After repeated compaction in the same ChatGPT project thread, the user scrolled upward in the ChatGPT UI and confirmed that earlier messages were still visible.

Observed behavior:

```text
long thread
→ active-context compaction observed
→ same thread continues
→ user scrolls upward
→ pre-compaction message text remains visible
```

This is a major architectural distinction.

The safest operational model is now:

```text
CHAT TRANSCRIPT      = human-visible retained history
ACTIVE MODEL CONTEXT = compactable inference working memory
LOCAL ROOT           = durable canonical project state
```

The observation does **not** prove how ChatGPT stores transcripts internally or which database/service holds them.

## Official retention evidence

OpenAI's published ChatGPT retention policy states that chats kept by the user are saved to the user's account until deleted manually.

Reference:

- https://help.openai.com/en/articles/8983778-how-are-files-vs-chats-retained

This supports the product-level fact that a kept chat can remain available as account history independently of whether its entire raw text is present in each model inference context.

It still does not expose ChatGPT's private backend storage schema.

## Three evidence types

The research now separates three kinds of evidence:

| Evidence | Supports | Does not prove |
|---|---|---|
| ChatGPT UI observation | old messages remained scrollable after compaction | backend DB architecture |
| OpenAI retention policy | kept chats are saved to the account until deleted | what exact subset is sent to the model each turn |
| Open-source Codex source | compacted model-visible history can replace active history and continue | that ChatGPT product harness is internally identical |

The three-layer Persistent Project Thread architecture is based on the intersection of these observations, not on pretending they are the same thing.

## Overshoot finding

Large pressure output has a poor shape:

```text
start tool
→ generate disposable text
→ tool result completes
→ next boundary
→ compaction may occur
```

If compaction becomes eligible early, output after that point is still wasted work. A zero-output boundary eliminates pressure-text overshoot.

## Optimized fallback

When the environment has already demonstrated the same behavior:

```text
persist durable state
→ emit no disposable text
→ create one zero-output tool boundary
→ observe/confirm active-context compaction
→ stop immediately
→ continue same project thread
```

If no compaction occurs, do not loop blindly. Escalate through bounded small probes only for diagnosis.

## Practical implication

Compaction can now be treated as **model working-memory maintenance**, not conversation erasure.

For the tested workflow this means:

```text
Human wants history?    → scroll transcript
Model needs continuity? → compacted active context + selective context
Project needs authority?→ Local ROOT / Child MD
```

This creates a path toward keeping one long-lived human-facing project conversation for much longer than a raw-context-only design would suggest.

## Open research

1. Determine whether the ChatGPT host exposes a supported native compact action directly.
2. Determine whether a stable thread identifier and compact API are officially available to the current harness.
3. Characterize when a zero-output boundary is sufficient versus when additional context growth is required.
4. Build a reliable host-visible compaction-success signal instead of inferring it from context reset behavior.
5. Measure quality loss across repeated compactions for different project types.
6. Test how many compaction cycles one long-lived project thread can survive before continuity or retrieval quality degrades.
7. Determine what historical transcript content can be selectively reintroduced without loading the entire transcript into active context.

## Privacy / retention non-claim

This research concerns **active model-visible conversation context, visible transcript behavior, and project continuity**.

It does not claim that compaction physically deletes provider-side raw conversation, audit, safety, or legal-retention records. It also does not claim access to ChatGPT's private backend database design.
