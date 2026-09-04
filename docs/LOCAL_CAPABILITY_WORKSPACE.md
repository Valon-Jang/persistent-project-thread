# Local Capability Workspace

## 1. Why local storage changes the architecture

Persistent Project Thread began as a conversation-continuity pattern, but the writable Chat-attached filesystem adds another layer: the model can reuse **locally stored capabilities**, not only project facts.

The useful distinction is:

```text
Chat Transcript           human-visible history
Active Model Context      compactable working memory
Local ROOT / Child MD     durable project truth
Local Capability Workspace reusable behavior + execution assets
```

The capability workspace is orthogonal to ROOT. ROOT should remain small and authoritative; large assets, caches, scripts, models, generated files, and reusable Skills belong in dedicated local directories referenced by path/hash when needed.

## 2. What can live there

### Reusable Skills

Verified operating procedures can be packaged as Skills and loaded again instead of rediscovering the method from scratch.

Examples:

```text
persistent-project-thread
root-engineering
voice-generation hot paths
narration planning
GitHub release workflow
debug/recovery playbooks
project orchestration
```

This creates a capability accumulation loop:

```text
problem
→ experiment
→ verify success
→ Skill-ize the method
→ store locally
→ reuse on later work
```

### Local ROOT / Child MDs

Project state that must survive active-context compaction:

- decisions and rationale;
- constraints;
- canonical routes;
- verified success methods;
- failure fingerprints and do-not-repeat rules;
- current subsystem state.

### Hot paths

Small deterministic execution recipes for repeated tasks where rereading the whole project would add latency or risk.

Examples:

- a verified TTS path;
- a recovery command;
- a build/test sequence;
- a known-safe data transformation.

### Runtime helpers

Python, shell, manifests, small local services, deterministic validators, and orchestration helpers.

### Caches and manifests

Reuse expensive setup work while keeping provenance:

- model condition caches;
- content hashes;
- dependency manifests;
- verified runtime state;
- index/cache files.

Caches are disposable accelerators, not canonical truth.

### Generated artifacts

WAV, JSON, reports, images, temporary exports, test outputs, and other user-visible files.

### Model/runtime assets

When capacity and lifecycle permit, local storage can hold model weights or runtime packages. These are large and must never be assumed persistent merely because they are locally writable today.

### Recovery state

Pointers, hashes, restore notes, checkpoints, known-good snapshots, and small packages that can reconstruct a lost runtime faster than repeating the original investigation.

## 3. A user-controlled capability layer

The architectural implication is larger than local file storage:

```text
BASE MODEL
   │
   ▼
LOCAL SKILL / TOOL / HOT-PATH LAYER
   │
   ▼
PROJECT ROOT
   │
   ▼
CURRENT CHAT WORK
```

The base model does not need to be retrained every time a useful operating method is discovered. Verified behavior can be externalized into a Skill and reloaded later.

A useful Root Engineering principle is therefore:

> Context can be compacted. Knowledge can persist in ROOT. Capability can persist in Skills and verified local execution assets.

## 4. Storage safety before compaction

Local persistence is only useful if the write really succeeds.

Before deliberate compaction when new durable state must be saved:

```text
1. locate the canonical ROOT from project instructions / local routing
2. identify the filesystem containing that ROOT
3. check free bytes and free inodes
4. verify the target directory is writable
5. route through ROOT to the smallest canonical Child MD / Hot Path owner
6. write the minimal patch, atomically when possible
7. read back / verify the saved state
8. only then compact active context
```

If any required save fails, deliberate compaction must stop. Keeping the active context is safer than compacting after a false assumption that durable state was persisted.

## 5. Measured example — not a guarantee

On 2026-09-04 the tested Chat-attached environment reported for `/mnt/data`:

```text
capacity:  33,770,192,896 bytes (~31.5 GiB)
used:       7,454,998,528 bytes
available: 24,580,431,872 bytes (~22.9 GiB)
use:       24%

inodes total: 2,097,152
inodes used:        291
inodes free:  2,096,861
write probe: PASS
```

Evidence: `evidence/LOCAL_STORAGE_CAPACITY_2026-09-04.md`.

These numbers are **not** a ChatGPT product guarantee. A later environment may expose different mounts, quotas, cleanup behavior, capacity, or persistence lifetime. The Skill must measure the current filesystem rather than hard-code `32G`.

## 6. Directory discipline

A practical layout can separate authority from bulk state:

```text
/mnt/data/
├── PROJECT_ROOT.md                 canonical route/authority
├── project_children/               canonical detailed state
├── skills/                         reusable behavior
├── hot_paths/                      verified fast execution recipes
├── runtime/                        helpers / environments
├── cache/                          disposable acceleration
├── models/                         optional large assets
├── artifacts/                      outputs
├── recovery/                       restore/checkpoint state
└── archive/                        superseded non-canonical history
```

Exact paths are project-specific. The important rule is semantic separation.

## 7. Local versus GitHub

Local storage and GitHub solve different problems.

```text
Local     = fastest execution / live workspace / caches / runtime state
GitHub    = distribution / backup / recovery / versioned reusable Skills
ROOT      = project authority
Skill     = reusable behavior contract
Chat      = human + model collaborative workspace
```

Important reusable Skills and recovery packages should be mirrored to a durable external source because local runtime lifetime is not assumed permanent.

## 8. Expansion surface

The capability workspace enables future directions such as:

- automatic Skill installation and routing;
- capability inventories per project;
- self-updating hot paths after verified success;
- cache-aware task planning;
- model/runtime downloads selected by available storage and memory;
- automatic cleanup policies for disposable artifacts;
- recovery after container replacement;
- portable Root + Skill bundles shared across ChatGPT, Codex, and local agents;
- project-specific toolchains that evolve without retraining the base model.

These are roadmap directions unless separately verified.
