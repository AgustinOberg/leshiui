# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

**Leshi UI** is a shadcn-style, source-distributed UI component library for React Native (iOS / Android / Web).

This repository is a **fork of [shadniwind](https://github.com/deicod/shadniwind) being rebranded and re-scoped**. The rename and architectural reshape are in progress, so the working tree still contains many `shadniwind` references (directory names, package name, registry URLs, manifest paths). Treat any `shadniwind` reference outside `node_modules/` as **legacy / pending migration**, not as the project's current identity.

The library is **not** an npm package. It builds a static **shadcn registry** (JSON files) that consumer apps install via `npx shadcn@latest add @leshi-ui/<flavor>/<item>`, which copies source files into the consumer's project.

## Project direction (work in progress)

The defining change vs. shadniwind is **two interchangeable styling backends**:

1. **Unistyles flavor** — what currently exists. Uses `react-native-unistyles` v3 with its native deps (nitro-modules, edge-to-edge, RN 0.78+ New Architecture, Expo SDK 53+). Implemented under `registry-src/shadniwind/`.
2. **StyleSheet flavor** — to be added. Uses plain React Native `StyleSheet` with a Context-based theme provider. Zero native dependencies, works in any RN setup.

A consumer picks **one** flavor per project — they don't coexist. The model mirrors shadcn's Radix-vs-BaseUI swap: shared "recipe" (component logic, hooks, a11y, variants) lives in a flavor-agnostic core; only the styling layer differs.

**Architectural details still under discussion — do not assume a final answer in code:**

- Registry source layout (likely `registry-src/core/` + `registry-src/unistyles/` + `registry-src/stylesheet/` parallel trees).
- Registry naming and split (likely `@leshi-ui/unistyles` and `@leshi-ui/stylesheet` as two registries built from one repo).
- Public hosting URL — current code still points to `deicod.github.io/shadniwind`; will change.
- Theming primitives for the StyleSheet flavor (likely Context + `useTheme()` + a small dependency-free variant helper).
- Migration scope (port all ~60 components to both flavors, or start with Tier 1 in StyleSheet and grow).

If a task touches one of these unresolved questions, **stop and confirm with the user** — do not pick a default.

## Coding philosophy (hard rules)

These rules apply to every change in this repo. They are not negotiable.

1. **Mirror shadcn first.** Before implementing or modifying a component, look at how shadcn/ui does it — props, slot / composition pattern, naming, file shape. Port that to React Native. Do not invent a new API when a shadcn one exists. The point of Leshi UI is shadcn DX in RN; drifting from shadcn's conventions defeats the project.
2. **Minimal dependencies.** Do not add npm dependencies without explicit approval. Prefer reimplementing small helpers in-tree over pulling a package. The bar is set by what already exists: Unistyles only for the Unistyles flavor, React/RN as peer deps. Nothing else by default.
3. **Single-file components by default.** Like shadcn, a component file is self-contained: composition + variants + types + exports in one `.tsx`. Split into hooks or sub-components **only** when the file is genuinely hard to read. Do not pre-split for "cleanliness". Shared logic used by more than one component goes in `primitives/` (today) or the future `core/`.
4. **Strict typing.** No `any`. Types should mirror shadcn's TS surface where applicable.
5. **Performance and accessibility are non-negotiable.** Avoid unnecessary re-renders, lean on platform primitives, set correct `accessibilityRole` / aria, keyboard support on web, screen reader support on native.
6. **Reuse via primitives.** The existing primitive set — `portal`, `overlay`, `positioning`, `focus`, `roving-focus`, `scroll-lock`, `press`, `a11y` — is the model. New cross-component logic belongs there, not duplicated.

## Common commands

Run from the repo root:

- `npm run lint` — Biome lint (run after every change).
- `npm run check` — Biome lint + format + import organization.
- `npm run typecheck` — runs `typecheck:node` (tooling) + `typecheck:registry` (registry sources). The registry uses a separate `tsconfig.registry.json` because its files assume RN / Unistyles types provided by the consumer app.
- `npm test` — `node --test --import tsx tests/**/*.test.ts`. Single test: `node --test --import tsx tests/portal-store.test.ts`.
- `npm run build:registry` — runs `scripts/build-registry.ts`: reads `registry-src/items/*.manifest.json`, embeds files from `registry-src/shadniwind/**`, validates against the shadcn registry schema (Ajv), writes `public/registry.json` and `public/v1/r/*.json`. **CI fails if the working tree is dirty afterwards** — commit regenerated artifacts whenever you touch `registry-src/` or `schemas/`.

The Expo playground app at `apps/expo-app/` has its own `package.json` and runs independently (`npm run ios` / `android` / `web` from inside that directory). It is not part of the root workspace.

## Architecture today (Unistyles flavor)

Three layers, mirroring the install order in a consumer app.

1. **Tokens & theme** (`registry-src/shadniwind/lib/`): `tokens.ts`, `unistyles.ts` (calls `StyleSheet.configure`), `unistyles-types.d.ts`. Installed first; the consumer must import `lib/unistyles.ts` once at startup *before* any `StyleSheet.create` runs.
2. **Primitives** (`registry-src/shadniwind/primitives/`): `portal`, `overlay`, `positioning`, `focus`, `roving-focus`, `scroll-lock`, `press`, `a11y`. Cross-platform building blocks for the UI layer. Platform splits use `.native.tsx` / `.web.tsx`; shared types in `*.types.ts`.
3. **UI components** (`registry-src/shadniwind/ui/`): the public catalog. Each component uses Unistyles v3 `StyleSheet.create((theme) => ...)` with variants for `variant` / `size` / state.

### Registry build pipeline

- Each item is declared by a manifest at `registry-src/items/<name>.manifest.json` with `name`, `type` (`registry:ui`, `registry:lib`, etc.), `registryDependencies`, `dependencies` (npm), and `files[]` mapping `source` (path inside `registry-src/shadniwind/`) → `path` (where it lands in the consumer's tree, e.g. `components/ui/button.tsx`).
- `scripts/build-registry.ts` embeds file contents into JSON and emits to `public/v1/r/<name>.json` and `public/registry.json`, validated against `schemas/` first.
- Versioned URL (legacy, will change): `https://deicod.github.io/shadniwind/v1/r/{name}.json`.

## Critical conventions for registry source files

These rules apply to anything under `registry-src/shadniwind/**` (and any future `registry-src/core|unistyles|stylesheet/**`), because that code ships verbatim into consumer apps.

- **Unistyles v3 only** in the Unistyles flavor. Use `StyleSheet.create((theme) => ...)` and `styles.useVariants(...)`. The v2 API (`createStyleSheet`, `useStyles`) is forbidden.
- **No path aliases inside installed files.** Use relative imports between registry files; consumers may have different alias configs. Imports between registry items must match the installed layout (`lib/...`, `components/ui/...`).
- **Platform splits via filename**, not `Platform.OS` branching where avoidable. Web-only behavior in `*.web.tsx`; native-only in `*.native.tsx`; shared types in `*.types.ts`.
- **No DOM-only or web-only globals** in shared (non-`.web`) files.
- **TSDoc on all exports.** Document the *why* (purpose, lifecycle, platform caveats), not the *what*. Components should include an `@example`. See SPEC.md §11.4.
- **File naming:** PascalCase for files that export a single React component (e.g. `PortalHost.tsx`); kebab-case for utilities, stores, and hooks (e.g. `portal-store.ts`). Catalog files in `ui/` are kebab-case by convention even when exporting a PascalCase component.

## Style and tooling

- **Biome** (`biome.json`) enforces formatting and lint: 2-space indent, double quotes, trailing commas, semicolons as needed, automatic import organization. No ESLint or Prettier at the root.
- TypeScript is strict, with two configs: `tsconfig.node.json` for tooling/scripts/tests, `tsconfig.registry.json` for registry source. Always run both via `npm run typecheck`.

## Testing

Tests in `tests/*.test.ts` use Node's built-in `node:test` + `node:assert` with the `tsx` loader. Headless logic only (portal store, positioning math, overlay state machines) — there is no React renderer at the root. UI behavior is verified manually in `apps/expo-app/`.

## Reference docs in repo

- `README.md` — consumer-facing setup. Currently still describes the shadniwind install flow; rebrand pending.
- `SPEC.md` — full system spec, component catalog (Appendix A), tier / primitive map.
- `AGENTS.md` — short repo guidelines for contributors and agents.
- `TASKS.md`, `RESEARCH.md` — planning notes.
