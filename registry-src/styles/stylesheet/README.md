# styles/stylesheet/

**Plain `StyleSheet` + Context-based theming flavor.**

> **Status: Phase 0 skeleton — all subfolders empty.** Phase 2 implements the foundations (theme provider, useTheme hook, web-ui hook, variants helper) and ports Tier 1 components. See `specs/phase-2-stylesheet-foundations.md`.

## Why this flavor

The Unistyles flavor's hard requirements (`react-native-nitro-modules`, `react-native-edge-to-edge`, RN 0.78+ New Architecture, Expo SDK 53+, no Expo Go) lock out a meaningful slice of RN projects. The StyleSheet flavor offers shadcn-quality components with **zero native dependencies** — works in any RN project, including Expo Go and bare RN apps without New Arch.

## Trade-offs vs Unistyles flavor

| | Unistyles flavor | StyleSheet flavor |
|---|---|---|
| Native deps | nitro-modules, edge-to-edge | none |
| Theme runtime | C++ JSI, zero re-render switches | React Context, re-renders on theme change |
| Web pseudo-classes | built-in CSS injection | `core/web-ui` hook |
| Variants | built-in (Unistyles `StyleSheet.create`) | `core/variants` helper |
| Responsive / breakpoints | built-in | not in v1 (TODO recorded in Phase 2 spec) |
| Performance ceiling | higher | "good enough" for most apps |

## Implementation plan (Phase 2)

1. `lib/tokens.ts` — re-export from `core/tokens/shadcn-default.ts` so manifests can ship a single `tokens` item that reads from core.
2. `lib/theme-provider.tsx` — `<ThemeProvider value={...}>{children}</ThemeProvider>` + `useTheme()` hook.
3. `lib/use-color-scheme.ts` — wrap `useColorScheme()` from RN, expose with override capability.
4. Create `core/web-ui/` with the `useWebUi({ hover, focus, active })` hook (web injects CSS, native no-op) and `core/variants/` with the cva-like helper. Both folders are created when this work starts — they don't exist as empty placeholders.
5. Port Tier 1 components (`button`, `input`, `card`, `badge`, `alert`, `separator`, `avatar`, etc.) from `styles/unistyles/ui/` patterns, swapping Unistyles `StyleSheet.create((theme) => ...)` for plain `StyleSheet.create` + `useTheme()` consumption + `useWebUi()` for hover/focus on web.
6. If a Tier 1 component needs shared pure-logic that the upstream `@rn-primitives/*` peer dep doesn't cover, extract it into a new `core/primitives/<name>/` folder (created on demand — see `specs/architecture/primitive-layer.md` §Custom primitives).

Until any of this lands, this folder is intentionally empty so the build script's auto-discovery doesn't emit a phantom registry for an empty flavor.
