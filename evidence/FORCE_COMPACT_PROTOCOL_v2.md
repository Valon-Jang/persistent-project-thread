# FORCE COMPACTION PROTOCOL v2 — NO-OUTPUT BOUNDARY

Status: VERIFIED 2026-09-04 in this Chat thread.

- 3200 lines -> compaction
- 400 lines -> compaction
- 100 lines -> compaction
- 20 lines -> compaction
- 1 line -> compaction
- zero-output `pass` -> compaction

Optimized fallback:
1. `압축해`
2. No pressure text.
3. Execute one private zero-output tool boundary (`pass`).
4. If context reset/compaction is observed, stop immediately.
5. Continue normal work.

Auto-compaction does not SIGTERM the current tool. A tool result completes before the next compaction/sampling boundary. The v2 no-op therefore avoids pressure-text overshoot entirely. Active history is replaced with compacted history; physical deletion of provider/audit raw records is not asserted.

Priority: direct `thread/compact/start` RPC > zero-output boundary fallback > text-pressure diagnostic fallback.
