# Local Storage Capacity Observation — 2026-09-04

## Environment

Observed in the long-lived ChatGPT project execution environment used for the Persistent Project Thread / Luna experiments.

The project-local canonical files were under `/mnt/data`, backed by the container's overlay filesystem.

## Measurement

Commands used:

```bash
df -h /mnt/data
df -B1 /mnt/data
df -i /mnt/data
du -sh /mnt/data
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

Observed `/mnt/data` payload size at measurement time:

```text
7.0G /mnt/data
```

## Interpretation

This is an **environment measurement**, not a universal ChatGPT storage guarantee. A later execution environment may expose a different filesystem size, mount, quota, lifetime, or persistence policy.

Therefore the Skill must **not hard-code 32G** as an assumed capacity.

Instead, before persisting durable project state immediately prior to a deliberate compaction, it should inspect the filesystem that actually owns the canonical ROOT path and verify that:

1. the target filesystem is writable;
2. free bytes are available for the intended write;
3. free inodes are available;
4. the write itself succeeds and can be read back/verified;
5. compaction is blocked if durable-state persistence fails.

## Why this belongs in the compaction protocol

Persistent Project Thread relies on a separation of responsibilities:

```text
Transcript      = human-visible history
Active Context  = compactable working memory
Local ROOT      = durable canonical project state
```

That architecture fails if the agent assumes ROOT was safely persisted when the local filesystem is full, read-only, missing, or otherwise unable to commit the update.

So local storage health is a **pre-compaction safety gate**, not merely a performance metric.

## Non-claim

This measurement does not prove that `/mnt/data` survives every ChatGPT runtime lifecycle, container replacement, host restart, cleanup event, or future product change. Persistence lifetime must be treated as a separate property from free-space capacity.
