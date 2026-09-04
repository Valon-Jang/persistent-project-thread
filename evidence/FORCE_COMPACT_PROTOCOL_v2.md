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
2. Persist any new durable project state before compaction.
3. Emit no pressure text.
4. Execute exactly one verified zero-output tool boundary (`pass`).
5. If active-context reset/compaction is observed, stop immediately.
6. Continue normal work in the same thread.

The useful event is the tool/sampling boundary, not the Python statement itself.

Auto-compaction does not require the current tool to be terminated. A tool result can complete before the next compaction/sampling boundary, so the v2 no-op avoids pressure-text overshoot entirely. Active model-visible history may be replaced with compacted history; physical deletion of provider/audit raw records is not asserted.

Priority:
1. Use an explicit native compact action/API/tool only when the current host actually exposes and supports it.
2. Otherwise use the previously verified zero-output boundary fallback only under matching demonstrated conditions and only when compaction can be verified.
3. Use bounded text-pressure probes only for diagnosis, increasing gradually and stopping immediately on success.

Do not invent or call an internal RPC such as `thread/compact/start` unless that exact action is actually exposed by the current host as a supported capability.
