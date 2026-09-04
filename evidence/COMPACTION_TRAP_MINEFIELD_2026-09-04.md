# Compaction Trap Minefield Experiment — 2026-09-04

## Why this experiment happened

Before the minimal no-op compaction trigger was discovered, the research question was more basic:

> **Where does ChatGPT compaction actually happen, and can the local execution environment observe it?**

The user proposed a deliberately adversarial debugging strategy: **lay traps everywhere** before provoking compaction, then inspect which trap fires.

This was the discovery phase that preceded the later pressure-reduction experiment.

## Trap layout

A set of parallel watchers was placed around the local Chat-attached execution environment to detect several classes of possible compaction side effects:

- process creation / termination changes;
- filesystem writes and new files;
- TCP / Unix-socket activity and socket appearance;
- cgroup CPU / memory changes;
- file-descriptor changes;
- environment-variable changes;
- strings resembling `threadId`, `turnId`, or `conversationId` appearing in local logs/state;
- Codex/socket-like local endpoints;
- a packet-level watch attempt where available.

The goal was not to assume an implementation. It was to cover multiple hypotheses at once:

```text
compaction might be...
├── a local subprocess
├── a file/state rewrite
├── a local RPC/socket call
├── a cgroup-visible compute event
├── a hidden thread/conversation identifier appearing locally
└── something above the local container entirely
```

## Control probes

Synthetic / fake probes were used to verify that the trap system itself was alive.

The controls successfully triggered multiple watchers, including process, keyword/string, filesystem, and socket/network-related detectors.

This mattered because a later lack of signal during real compaction could not simply be dismissed as "the watchers were broken."

## Real compaction observation

Automatic compaction was then observed in the long-lived ChatGPT thread. The active-context indicator reset, but the local minefield did **not** reveal a matching new compaction subprocess, file rewrite, local socket event, thread/conversation identifier, or other decisive container-local event.

A packet-level watcher attempt was not usable in this environment because the required raw-network capability was unavailable; this is recorded as a limitation rather than evidence of absence.

## Conservative conclusion

The strongest supported conclusion was:

> **The observed ChatGPT compaction event was not exposed as an obvious operation inside the attached CaaS/container environment.**

The evidence was consistent with compaction occurring in a higher conversation/runtime harness layer outside the local tool container.

This does **not** prove the exact internal ChatGPT implementation, server topology, or storage path. It only rules out the simple hypothesis that the compaction event was transparently implemented as one of the locally observable process/file/socket operations covered by the working traps.

## Why this mattered for the next experiment

The minefield result changed the strategy.

Instead of trying to intercept a hidden local compaction command, the research moved to **behavioral triggering**:

```text
1. accept that the host owns compaction
2. provoke a safe boundary where the host may compact
3. observe whether active context resets
4. reduce the trigger until disposable pressure disappears
```

That led to the later reduction sequence:

```text
~3200 lines
→ 400
→ 100
→ 20
→ 1
→ zero-output no-op boundary
```

So the zero-output technique was not an isolated trick. It was the endpoint of a two-stage investigation:

```text
Stage A — Minefield
Locate the layer that owns compaction.

Stage B — Boundary minimization
Find the smallest safe event that lets that layer compact an already-eligible thread.
```

## Research value

The minefield experiment established an important Root Engineering rule:

> **When a host-level state transition is not locally observable, do not keep inventing local mechanisms. Instrument broadly, falsify the local hypotheses, then move the control strategy to the observable boundary.**

That rule generalizes beyond compaction to other host-managed AI runtime behaviors.

## Status

Empirical experiment from one long-lived ChatGPT project thread with local tool execution available. Environment-specific evidence; not a universal claim about every ChatGPT runtime.
