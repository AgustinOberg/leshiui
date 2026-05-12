# core/tokens/

**Shared semantic tokens consumed by all styling backends.**

After Phase 0 step 6 lands:

- `types.ts` — the `Theme` type contract (the shape that every flavor's theme must match).
- `default.ts` — concrete light + dark theme values (HSL color strings + radius, typography, spacing scales) and the `space()` helper.

Each styling backend has its own thin wiring file in `styles/<style>/lib/` that consumes these and registers them with the backend's runtime:

- Unistyles flavor: `styles/unistyles/lib/unistyles.ts` calls `StyleSheet.configure({ themes: { light, dark } })` with values imported from here.
- StyleSheet flavor (Phase 2+): `styles/stylesheet/lib/theme-provider.tsx` exposes the same values via React Context and a `useTheme()` hook.

The `core/tokens/` files ship into the consumer's project as `lib/tokens/types.ts` and `lib/tokens/default.ts` (kebab-case install paths). The flavor's wiring file imports from `./tokens/default.js` after install — sibling-relative — because the build script rewrites the cross-tree source-time import (`../../../core/tokens/default.js`) to install-relative paths.

## Why values + types live here, not in each style

Single source of truth. Consumers expect "primary color" to mean the same thing regardless of which styling backend they picked. Centralizing values in `core/` guarantees parity. Each style's wiring file is the only thing that differs between flavors.

## Color format

HSL strings (`"hsl(240 10% 3.9%)"`). Same convention shadcn web uses. Compatible with both Unistyles' theme system and a Context-based theme provider.
