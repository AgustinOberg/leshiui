# SPEC — Leshi UI

High-level project spec. Durable mission, architectural rationale, and versioning policy. For coding rules, commands, and conventions, see `AGENTS.md`. For phase plans, see `specs/`. For the milestone list, see `ROADMAP.md`.

## Mission

A shadcn-style, source-distributed UI component library for React Native (iOS / Android / Web) with **interchangeable styling backends**. The consumer picks one backend per project; component APIs and behavior are identical across backends. The library publishes a static shadcn registry — components install via `npx shadcn@latest add @leshi-ui/<item>` and live as editable source in the consumer's project.

## Goals

1. **shadcn API parity.** Component shapes (props, slot composition, naming, file layout) mirror shadcn/ui. A developer fluent in shadcn web should feel at home in Leshi UI's RN catalog.
2. **Backend-swappable styling.** Today: Unistyles flavor (high-perf, native deps). Soon: StyleSheet flavor (zero native deps, broader compatibility). Architecture must support a third or fourth backend without touching the build pipeline.
3. **Minimal dependencies.** Each registry item ships with the smallest surface that still works. The user owns and edits the installed code.
4. **Performance and accessibility.** Avoid unnecessary re-renders, lean on platform primitives, set proper `accessibilityRole` / aria, keyboard on web, screen reader on native.

## Non-goals

- Pixel-perfect parity with shadcn/ui's web visuals. RN constraints make some choices different; API parity is what matters.
- Expo Go support. The Unistyles flavor has native deps that block it; the StyleSheet flavor will not have this restriction.
- A custom CLI. Consumers use `npx shadcn@latest` directly with the `@leshi-ui` namespace.
- Reinventing what shadcn already documents well — when in doubt, defer to shadcn's conventions.

## Why two backends, not one

Shadcn's web library swaps between Radix and BaseUI behind a unified component surface. Leshi UI mirrors that pattern for RN: the same component recipe (composition, a11y wiring, eventually pure-logic primitives) lives in `registry-src/core/`, with the styling implementation per `registry-src/styles/<style>/`. The consumer's `components.json` `style` field routes shadcn's URL placeholder `{style}` to the matching registry payload — single-field switch.

The two flavors target different audiences:

- **Unistyles** — apps that can opt into RN New Architecture + Expo SDK 53+ and want the JSI-backed theme runtime (zero-rerender theme switches, web pseudo-class injection).
- **StyleSheet** — apps that need broad compatibility (Expo Go, older RN, bare projects without New Arch). Trades the perf ceiling for portability.

A third backend (NativeWind, restyle, styled-components, etc.) is one new subfolder under `styles/<x>/` plus its own `items/` manifests. The build script discovers it dynamically.

## Architectural rationale

**Why `core/` exists.** Anything flavor-agnostic (token contract + values, pure-logic primitives like portal stores, positioning math, focus state machines, the variants helper, a11y role mappings, the web-ui hook) belongs in one place so every flavor consumes the same implementation. Component bodies stay per-flavor because they're where the styling lives.

**Why the build script rewrites imports.** Source files use cross-tree relative paths (`../../../core/tokens/default.js`) during development for normal TypeScript resolution. At publish time, those paths don't make sense in the consumer's project layout, so `scripts/build-registry.ts` rewrites them to install-relative paths (`./tokens/default.js`) using the manifest's declared install destinations. This decouples source layout from install layout.

**Why manifests, not directory conventions.** Each registry item is described by an explicit `.manifest.json`. The build script reads manifests, embeds files, validates against the registry-item schema, and emits per-style indexes. Adding an item = one manifest + source files. Adding a flavor = one folder. No script changes.

**Documentation as a first-class concern.** Because components are source-distributed, in-source docs land in the consumer's editor as hover tooltips. TSDoc on every export, documenting *why* (purpose, lifecycle, platform caveats). Components include `@example`. Platform deviations are noted explicitly ("Web only", "Native fallback uses long-press").

## Tiering and catalog

Components are tiered by complexity, from Tier 1 (simple presentational) to Tier 4 (big feature components like Calendar, Data Table). Tier 1 ships first in any new flavor — it's the minimum viable catalog. Full mapping with required primitives, platform notes, and tiers lives in `specs/component-catalog.md`, which also tracks per-component `Status` (`ready` / `not-ready`).

## Versioning

Path-based: `/v1/...` is the current major version. Breaking changes to URL scheme or manifest format publish to `/v2/...` with `/v1/...` kept alive for a deprecation window. The `REGISTRY_VERSION` constant in `scripts/build-registry.ts` controls the prefix.
