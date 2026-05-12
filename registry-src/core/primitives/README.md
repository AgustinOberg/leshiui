# core/primitives/

**Pure-logic primitives shared across styling backends.**

> **Status: Phase 0 placeholder — empty folder.** All existing primitives still live whole at `styles/unistyles/primitives/<x>/` for Phase 0. See `specs/phase-0-restructure.md` §6 for rationale.

## When primitives move here

A primitive folder graduates to `core/primitives/` when:

1. Some file in it is genuinely flavor-agnostic (no `react-native-unistyles` import, no JSX rendering with style props, no return type tied to a specific backend's style shape).
2. Both flavors actually need the shared file (otherwise duplication is fine and cheaper than cross-tree imports).
3. Phase 2+ work has surfaced a concrete reuse case — we don't speculate.

When a primitive is split, the styled half stays under `styles/<style>/primitives/<x>/` and imports the shared half from `core/primitives/<x>/` via cross-tree relative paths (`../../../../core/primitives/<x>/<file>`). The build script rewrites these to install-relative paths automatically (the same mechanism used for tokens in Phase 0).

## Candidate splits (Phase 2+)

These folders contain at least one Unistyles-free file today and could be partially extracted when StyleSheet flavor ships:

- `portal/portal-store.ts` (pure store) → core; `Portal*.tsx` (renders Views) stays per-flavor.
- `overlay/dismiss-layer-state.ts` (pure state machine) → core; styled overlay UI stays per-flavor.
- `positioning/positioning-utils.ts` + `types.ts` → core; `use-positioning.*` hooks stay per-flavor (or become flavor-agnostic if they don't touch styling).
- `focus/types.ts` → core; `focus-scope.*` stays per-flavor.
- `roving-focus/utils.ts` (composeRefs) + `types.ts` → core; `roving-focus.*` stays per-flavor.
- `scroll-lock/*` — entire folder is style-agnostic, can move whole to `core/primitives/scroll-lock/`.
- `press/*` — entire folder is style-agnostic (just `composeEventHandlers` utility), can move whole.
- `a11y/*` — entire folder is style-agnostic, can move whole.

These are notes, not commitments. Phase 2's spec will pick which (if any) to extract based on what the StyleSheet flavor actually needs.
