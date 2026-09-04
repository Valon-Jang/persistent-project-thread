# Chat Compaction Research — 2026-09-04

## Research question

Can a long-lived project conversation be kept as the single primary thread while reducing active context overhead, and if automatic compaction is already eligible, what is the smallest trigger needed to let it occur?

## Initial hypothesis

A large tool output might push the conversation over the host's automatic compaction threshold.

An early fallback produced thousands of harmless lines. It appeared to correlate with context reset/compaction, but it had an obvious inefficiency: a tool command generally completes its output before the next model/tool boundary. If the threshold had already been crossed partway through the output, the remainder could still be generated unnecessarily.

This raised a second question:

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

Codex compaction implementations call `Session::replace_compacted_history(...)`, and the session implementation replaces the live history structure.

Relevant source paths:

- https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/core/src/session/mod.rs
- https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/core/src/compact.rs
- https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/core/src/compact_remote.rs
- https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/core/src/compact_remote_v2.rs

Codex configuration also exposes `model_auto_compact_token_limit`, described as the token-usage threshold triggering automatic compaction:

- https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/config/src/config_toml.rs
- https://github.com/openai/codex/blob/3c837e568c24e4281bba4abdf3bc3c398f3fff13/codex-rs/core/config.schema.json

## Important distinction

The source above is **OpenAI Codex source evidence**, not proof that the ChatGPT product harness is implemented identically.

The ChatGPT-side no-op result is empirical evidence from the tested environment. The Codex source is used to understand a plausible compaction/continuation model and to avoid overclaiming.

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
→ observe/confirm compaction
→ stop immediately
```

If no compaction occurs, do not loop blindly. Escalate through bounded small probes only for diagnosis.

## Open research

1. Determine whether the ChatGPT host exposes a supported native compact action directly.
2. Determine whether a stable thread identifier and compact API are officially available to the current harness.
3. Characterize when a zero-output boundary is sufficient versus when additional context growth is required.
4. Build a reliable host-visible compaction-success signal instead of inferring it from context reset behavior.
5. Measure quality loss across repeated compactions for different project types.

## Privacy / retention non-claim

This research concerns **active model-visible conversation context**. It makes no claim that provider-side raw conversation, audit, safety, or legal-retention records are physically erased by compaction.
