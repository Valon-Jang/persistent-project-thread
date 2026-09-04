# Transcript Visibility After Compaction — 2026-09-04

## Observation

Environment: one long-lived ChatGPT project conversation used continuously for Root Engineering / Luna work.

After repeated automatic-compaction events had been observed, the user manually scrolled upward in the same ChatGPT conversation and confirmed that earlier pre-compaction messages were still visible in the UI.

Observed sequence:

```text
long-running ChatGPT project thread
→ automatic compaction observed
→ same project conversation continues
→ user scrolls upward
→ earlier message text is still visible
```

## What this supports

The strongest supported operational conclusion is:

> Human-visible chat transcript history and the model's current active context should be treated as different layers.

Combined with the already observed compaction/continuation behavior, this motivated the three-layer Persistent Project Thread model:

```text
Chat Transcript      = human-visible history
Active Model Context = compactable working memory
Local ROOT           = durable canonical project state
```

## Official product-policy support

OpenAI's ChatGPT retention policy states that chats kept by the user are saved to the account until manually deleted.

Reference:

- https://help.openai.com/en/articles/8983778-how-are-files-vs-chats-retained

This supports the product-level fact that a kept conversation can persist as account history.

## Source-model support

Open-source Codex source independently shows that compaction can replace the live model-visible history and continue execution:

- `codex-rs/core/src/session/turn.rs`
- `codex-rs/core/src/session/mod.rs`
- compaction paths using `Session::replace_compacted_history(...)`

Pinned research links are recorded in `docs/CHAT_COMPACTION_RESEARCH.md`.

## What this does NOT prove

This observation does not prove:

- the name or structure of ChatGPT's backend database;
- whether visible transcript and active context are stored by separate services;
- what exact transcript subset is supplied to the model on any given turn;
- that compaction physically deletes any provider-side raw, audit, safety, or legal-retention record;
- that ChatGPT is internally implemented identically to open-source Codex.

## Architectural impact

Before this observation, Persistent Project Thread could be described as a two-part system:

```text
Conversation working memory + Local ROOT
```

After this observation, the more useful model is three-part:

```text
Human transcript + Model working context + Project ROOT
```

This significantly expands the design space because the human can potentially retain a browsable project history while the model repeatedly compacts its working memory and the ROOT preserves canonical project state.

## Status

Empirical product observation from the tested thread. Verified by user inspection of the ChatGPT UI on 2026-09-04.
