# Local Storage Capacity Observation — 2026-09-04

## Environment

Observed in the long-lived ChatGPT project execution environment used for the Persistent Project Thread / Luna experiments.

The project-local canonical files were under `/mnt/data`, backed by the container's overlay filesystem.

## Measurement

Commands / checks used:

```bash
df -B1 /mnt/data
df -i /mnt/data
write/read/delete probe under /mnt/data
```

Observed filesystem capacity:

```text
Filesystem: overlay
Total:      33,770,192,896 bytes  (~31.5 GiB; df -h shows 32G)
Used:        7,454,998,528 bytes  (~6.9 GiB; df -h shows 7.0G)
Available:  24,580,431,872 bytes  (~22.9 GiB; df -h shows 23G)
Use%:       24%
```

Observed inode capacity:

```text
Total inodes: 2,097,152
Used inodes:        291
Free inodes:  2,096,861
Use%:                1%
```

Write/read/delete probe:

```text
PASS
```

## Interpretation

This is an **environment measurement**, not a universal ChatGPT storage guarantee. A later execution environment may expose a different filesystem size, mount, quota, lifetime, cleanup policy, or persistence boundary.

Therefore the Skill must **not hard-code 32G** as an assumed capacity.

Instead, before persisting durable project state immediately prior to a deliberate compaction, it should inspect the filesystem that actually owns the canonical ROOT path and verify that:

1. the target filesystem is present and writable;
2. free bytes are sufficient for the intended write plus a safety margin;
3. free inodes are available;
4. a safe write/read check succeeds when appropriate;
5. the canonical write itself succeeds and can be read back/verified;
6. compaction is blocked if required durable-state persistence fails.

## Why this belongs in the compaction protocol

Persistent Project Thread separates:

```text
Transcript             = human-visible history
Active Context         = compactable working memory
Local ROOT             = durable canonical project state
Local Capability Layer = reusable Skills / Hot Paths / runtime assets
```

That architecture fails if the agent assumes ROOT was safely persisted when the local filesystem is full, read-only, missing, or otherwise unable to commit the update.

So local storage health is a **pre-compaction safety gate**, not merely a performance metric.

## Capability-workspace interpretation

The same writable local space can host more than Markdown state:

```text
ROOT / Child MDs       durable project truth
Skills                 reusable behavior contracts
Hot Paths              verified fast execution recipes
runtime helpers        scripts / deterministic tooling
caches / manifests     disposable acceleration + provenance
artifacts               WAV / JSON / reports / generated output
model/runtime assets   optional large assets when capacity permits
recovery state         pointers / hashes / checkpoints / restore notes
```

This creates a user-controlled capability layer around the base model: verified methods can be externalized into Skills or Hot Paths and reused without re-deriving them from scratch.

ROOT should remain small and authoritative. Bulk assets and caches belong in separate directories and should be referenced by path/hash when relevant.

See `docs/LOCAL_CAPABILITY_WORKSPACE.md`.

## Non-claim

This measurement does not prove that `/mnt/data` survives every ChatGPT runtime lifecycle, container replacement, host restart, cleanup event, or future product change. Persistence lifetime must be treated as a separate property from free-space capacity.

Important reusable Skills and recovery packages should therefore be mirrored to a durable external/versioned source such as GitHub.
