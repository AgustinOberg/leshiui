# core/primitives/

**Cross-flavor, pure-logic primitives.**

This directory is reserved for primitive logic that is **(a) genuinely flavor-agnostic** (no styling-system imports, no JSX rendering with styled props) and **(b) not already shipped by `@rn-primitives`**.

## Default primitive layer is external

Per `specs/architecture/primitive-layer.md`, Leshi UI uses **`@rn-primitives/*`** as its primitive layer — the RN equivalent of how shadcn/ui uses Radix. Behavior like portal, overlay, focus trap, keyboard semantics, controllable state, slot composition lives in the upstream packages. Components import directly from `@rn-primitives/<name>` and list it in the manifest's `dependencies`.

**Do not re-implement primitives that `@rn-primitives` already ships.**

## What still lives here

Gap-fillers and helpers the upstream does not cover, for example:

- Theme-aware hooks (e.g., reading the current breakpoint from Unistyles `rt`).
- Web-only `useWebUi` hover / focus-visible / active state machine (planned).
- cva-like variants helper (planned).
- A stronger native focus containment wrapper layered on top of `@rn-primitives` — only if a component proves it needs more than the upstream provides.

Each gap-filler must justify its existence in its component's spec.

## Layout rules

- One folder per primitive (`core/primitives/<name>/`).
- Files are pure TypeScript / React with no `react-native-unistyles` import.
- Cross-flavor consumers reach in via `../../../core/primitives/<name>/<file>.js`; the registry build rewrites this to `lib/primitives/<name>/<file>` on install (same mechanism used for tokens).

## Status

Currently empty. The previous `slot/` primitive was migrated to `@rn-primitives/slot` as part of adopting the upstream model.
