# core/

**Flavor-agnostic source code shared across all styling backends.**

Anything in this folder must NOT depend on a specific styling backend (no `react-native-unistyles` imports, no `StyleSheet.create((theme) => ...)` callbacks, no `<style>` injection helpers tied to one rendering pipeline).

Today the only flavor-agnostic asset is the theme contract:

- **`tokens/`** — `types.ts` (the `Theme` shape contract) + `shadcn-default.ts` (semantic token values: HSL light + dark themes, radius, typography, spacing). Both styling backends consume these via their own wiring file (`styles/<style>/lib/...`).

## Future subdirs

These are NOT in-tree until a phase actually needs them. Don't create empty placeholders; the folder is created together with its first real file.

- **`primitives/`** — pure-logic primitives (state machines, stores, hooks that return data not styles, math, type definitions). Reserved for cross-flavor gaps the upstream `@rn-primitives/*` peer deps don't cover. See `specs/architecture/primitive-layer.md` §Custom primitives.
- **`variants/`** — small dependency-free helper that mirrors `cva`'s API for backends that don't have built-in variants. The Unistyles flavor doesn't use it (Unistyles ships its own variant system); the future StyleSheet flavor will.
- **`web-ui/`** — single hook `useWebUi({ hover, focus, active, ... })` that produces style objects for CSS pseudo-class behavior on RN Web. Native = no-op. Needed by flavors without native `:hover` / `:focus-visible` support (StyleSheet flavor).

## When adding a new file to `core/`

1. Verify it has no styling-backend imports.
2. Decide whether the file needs to be referenced from a manifest (because it ships into consumer apps via a registry item) or is internal-only.
3. If consumer-facing: any manifest that references this file uses the `core:` prefix in its `source` (e.g., `"source": "core:tokens/shadcn-default.ts"`). The build script resolves the prefix and rewrites cross-tree imports automatically.
4. Add a small TSDoc block on each export explaining the why.
