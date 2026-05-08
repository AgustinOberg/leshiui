# styles/stylesheet/

**Plain `StyleSheet` + Context-based theming flavor.**

> **Status: Phase 0 skeleton — all subfolders empty.** Phase 1 implements the foundations (theme provider, useTheme hook, web-ui hook, variants helper) and ports Tier 1 components. See `specs/phase-1-stylesheet-foundations.md`.

## Why this flavor

The Unistyles flavor's hard requirements (`react-native-nitro-modules`, `react-native-edge-to-edge`, RN 0.78+ New Architecture, Expo SDK 53+, no Expo Go) lock out a meaningful slice of RN projects. The StyleSheet flavor offers shadcn-quality components with **zero native dependencies** — works in any RN project, including Expo Go and bare RN apps without New Arch.

## Trade-offs vs Unistyles flavor

| | Unistyles flavor | StyleSheet flavor |
|---|---|---|
| Native deps | nitro-modules, edge-to-edge | none |
| Theme runtime | C++ JSI, zero re-render switches | React Context, re-renders on theme change |
| Web pseudo-classes | built-in CSS injection | `core/web-ui` hook |
| Variants | built-in (Unistyles `StyleSheet.create`) | `core/variants` helper |
| Responsive / breakpoints | built-in | not in v1 (TODO recorded in Phase 1 spec) |
| Performance ceiling | higher | "good enough" for most apps |

## Implementation plan (Phase 1)

1. `lib/tokens.ts` — re-export from `core/tokens/default.ts` so manifests can ship a single `tokens` item that reads from core.
2. `lib/theme-provider.tsx` — `<ThemeProvider value={...}>{children}</ThemeProvider>` + `useTheme()` hook.
3. `lib/use-color-scheme.ts` — wrap `useColorScheme()` from RN, expose with override capability.
4. Port Tier 1 components (`button`, `input`, `card`, `badge`, `alert`, `separator`, `avatar`, etc.) from `styles/unistyles/ui/` patterns, swapping Unistyles `StyleSheet.create((theme) => ...)` for plain `StyleSheet.create` + `useTheme()` consumption + `useWebUi()` for hover/focus on web.
5. Reuse pure-logic primitives from `core/primitives/` (extracting them as needed; see `core/primitives/README.md` for the candidate list).

Until any of this lands, this folder is intentionally empty so the build script's auto-discovery doesn't emit a phantom registry for an empty flavor.
