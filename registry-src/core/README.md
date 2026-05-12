# core/

**Flavor-agnostic source code shared across all styling backends.**

Anything in this folder must NOT depend on a specific styling backend (no `react-native-unistyles` imports, no `StyleSheet.create((theme) => ...)` callbacks, no `<style>` injection helpers tied to one rendering pipeline). Instead, it provides:

- **`primitives/`** — pure-logic primitives (state machines, stores, hooks that return data not styles, math, type definitions). Currently empty in Phase 0; styled primitives still live under `styles/unistyles/primitives/`. Phase 2+ extracts files here when the second styling backend (StyleSheet flavor) is added and shared logic becomes worth the cross-tree imports.
- **`tokens/`** — `types.ts` (the `Theme` shape contract) + `default.ts` (semantic token values: HSL light + dark themes, radius, typography, spacing). Both styling backends consume these via their own wiring file (`styles/<style>/lib/...`).
- **`variants/`** — small, dependency-free helper that mirrors `cva`'s API for backends that don't have built-in variants (StyleSheet flavor today; future NativeWind, etc.). The Unistyles flavor doesn't use it because Unistyles ships its own variant system. Currently empty; Phase 2 implements.
- **`web-ui/`** — single hook `useWebUi({ hover, focus, active, ... })` that produces style objects for CSS pseudo-class behavior on RN Web. Native = no-op. Used by any flavor that doesn't have native `:hover` / `:focus-visible` support (StyleSheet flavor today). Currently a placeholder; Phase 2 implements.

## Phase 0 status

Phase 0 only extracts **tokens** to `core/`. Primitives, variants, and web-ui are reserved folders awaiting their respective phases. See `specs/phase-0-restructure.md` §6 for the exact extraction plan and the rationale for keeping primitives whole in `styles/unistyles/` for now.

## When adding a new file to `core/`

1. Verify it has no styling-backend imports.
2. Decide whether the file needs to be referenced from a manifest (because it ships into consumer apps via a registry item) or is internal-only.
3. If consumer-facing: any manifest that references this file uses the `core:` prefix in its `source` (e.g., `"source": "core:tokens/default.ts"`). The build script resolves the prefix and rewrites cross-tree imports automatically.
4. Add a small TSDoc block on each export explaining the why.
