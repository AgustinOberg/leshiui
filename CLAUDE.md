# CLAUDE.md

This file is auto-loaded by Claude Code at the start of every session in this repo. **Read it before doing anything.**

---

## Status — read this first

> **Phase 0 (Restructure & Rebrand) is in progress.** The repo is mid-migration. The working tree still has the legacy `registry-src/shadniwind/` layout in place, with rebrand documentation work landed on top.
>
> **The authoritative plan is `specs/phase-0-restructure.md`.** It contains locked decisions, the final tree, the build script design, and a step-by-step execution plan. **Read it before any further work.**
>
> **Progress is tracked in `specs/phase-0-restructure.md` §18 (Progress tracker).** Update it after every commit so the next session knows where to pick up.
>
> **Memory** (`/Users/agustinoberg/.claude/projects/-Users-agustinoberg-Documents-GitHub-LeshiUI/memory/MEMORY.md`) holds durable context: project intent, the user's coding philosophy, autonomy preferences, and language preference. Claude Code auto-loads it. If you are **not** Claude Code (different agent / fresh AI), read `HANDOFF.md` at repo root for a one-page orientation; it duplicates the essentials.

### Current phase: Phase 0 — Restructure & Rebrand

What's done so far in Phase 0 (commits land in `main`):

- Rebrand prep: `package.json` renamed, `LICENSE` (MIT, 2026, Agustín Oberg), `apps/expo-app/` deleted, `RESEARCH.md` and `TASKS.md` deleted, `apps/docs/README.md` and `apps/expo-app/`-area docs cleaned up, partial doc updates to `SPEC.md` / `CLAUDE.md` / `AGENTS.md` / `README.md`.

What's pending in Phase 0:

- File-system moves (`registry-src/shadniwind/` → `registry-src/styles/unistyles/`).
- Manifest relocation (`registry-src/items/` → `registry-src/styles/unistyles/items/`).
- Skeleton folders for `core/` and `styles/stylesheet/`.
- Token extraction to `core/tokens/`.
- Build script rewrite (multi-style + import rewriting).
- Tests imports update.
- `public/` regeneration with new URL scheme.
- CI workflow update (remove deploy job).
- Doc final rewrites (`SPEC.md`, `README.md`, `CLAUDE.md` polish, new `specs/phase-1-stylesheet-foundations.md` / `specs/component-catalog.md` / `specs/registry-protocol.md`).

See `specs/phase-0-restructure.md` §11 for the numbered execution sequence and §18 for the live progress tracker.

### When Phase 0 is done

Update this Status section to "Phase 1 — StyleSheet flavor foundations" with the new pending list, and link `specs/phase-1-stylesheet-foundations.md`.

---

## What this repo is

**Leshi UI** is a shadcn-style, source-distributed UI component library for React Native (iOS / Android / Web). It was forked from [shadniwind](https://github.com/deicod/shadniwind) and rebranded; legacy `shadniwind` references in the working tree are migration artifacts and will be gone by end of Phase 0.

The library is **not** an npm package. It builds a static **shadcn registry** (JSON files) that consumer apps install via `npx shadcn@latest add @leshi-ui/<item>`, which copies source files into the consumer's project.

The defining feature is **two interchangeable styling backends**:

1. **Unistyles flavor** — current implementation; uses `react-native-unistyles` v3.
2. **StyleSheet flavor** — Phase 1+; plain `StyleSheet` + Context-based theming, zero native dependencies.

The consumer picks one flavor per project via `components.json`'s `style` field; shadcn's `{style}` URL placeholder routes to the right registry payload. They never coexist. Implementation parallels shadcn's Radix-vs-BaseUI swap: shared "recipe" (component logic, hooks, a11y, variants) in a flavor-agnostic core, swappable styling layer.

Hosting: `https://leshi-ui.pages.dev` (Cloudflare Pages, manual deploy for now). Repo: `https://github.com/AgustinOberg/leshiui`.

---

## Coding philosophy (hard rules)

These rules apply to every change in this repo. Not negotiable.

1. **Mirror shadcn first.** Before implementing or modifying a component, look at how shadcn/ui does it — props, slot / composition pattern, naming, file shape. Port that to React Native. Don't invent a new API when a shadcn one exists. Drifting from shadcn's conventions defeats the point of Leshi UI.
2. **Minimal dependencies.** Don't add npm dependencies without explicit approval. Reimplement small helpers in-tree. Bar set by what already exists: Unistyles only for the Unistyles flavor, React/RN as peer deps. Form-library integrations (`form-rhf`, `form-tsf`) are opt-in items whose deps the consumer accepts.
3. **Single-file components by default.** Like shadcn, a component file is self-contained: composition + variants + types + exports in one `.tsx`. Split into hooks or sub-components only when genuinely unreadable. Cross-component logic goes in `primitives/` (today, in `styles/unistyles/primitives/`) or future `core/primitives/`.
4. **Strict typing.** No `any`. Mirror shadcn's TS surface where applicable.
5. **Performance and accessibility are non-negotiable.** Avoid unnecessary re-renders, lean on platform primitives, set correct `accessibilityRole` / aria, keyboard support on web, screen reader support on native.
6. **Reuse via primitives.** Existing primitive set (`portal`, `overlay`, `positioning`, `focus`, `roving-focus`, `scroll-lock`, `press`, `a11y`) is the model. New cross-component logic belongs there, not duplicated.

---

## Common commands

Run from repo root:

- `npm run lint` — Biome lint.
- `npm run check` — Biome lint + format + import organization.
- `npm run typecheck` — runs `typecheck:node` (tooling) + `typecheck:registry` (registry sources).
- `npm test` — `node --test --import tsx tests/**/*.test.ts`. Single test: `node --test --import tsx tests/portal-store.test.ts`.
- `npm run build:registry` — runs `scripts/build-registry.ts`. Reads manifests, embeds files, validates against schema, writes to `public/`. **CI fails if the working tree is dirty afterwards** — commit regenerated artifacts whenever you touch `registry-src/` or `schemas/`.

---

## Architecture today (mid-Phase-0)

Three-layer registry. Install order in a consumer mirrors this order.

1. **Tokens & theme** (`registry-src/shadniwind/lib/` today; will be `registry-src/styles/unistyles/lib/` + `registry-src/core/tokens/` after Phase 0): `tokens.ts` (values + `Theme` type), `unistyles.ts` (calls `StyleSheet.configure`), `unistyles-types.d.ts` (TS module augmentation). Consumer must import `lib/unistyles.ts` once at startup *before* any `StyleSheet.create` runs.
2. **Primitives** (`registry-src/shadniwind/primitives/` today; will be `registry-src/styles/unistyles/primitives/` after Phase 0): `portal`, `overlay`, `positioning`, `focus`, `roving-focus`, `scroll-lock`, `press`, `a11y`. Cross-platform building blocks. Platform splits use `.native.tsx` / `.web.tsx`; shared types in `*.types.ts`.
3. **UI components** (`registry-src/shadniwind/ui/` today; will be `registry-src/styles/unistyles/ui/` after Phase 0): the public catalog. Each component uses Unistyles v3 `StyleSheet.create((theme) => ...)` with variants for `variant` / `size` / state.

### Registry build pipeline (current)

- Each item declared by a manifest at `registry-src/items/<name>.manifest.json` (will move to `registry-src/styles/unistyles/items/` after Phase 0).
- `scripts/build-registry.ts` embeds file contents into JSON and emits to `public/v1/r/<name>.json` and `public/registry.json`.
- Will be rewritten in Phase 0 step 9 to emit `public/v1/styles/<style>/r/<name>.json` and `public/v1/styles/<style>/registry.json`.

---

## Critical conventions for registry source files

These rules apply to anything under `registry-src/**`, because that code ships verbatim into consumer apps.

- **Unistyles v3 only** in the Unistyles flavor. Use `StyleSheet.create((theme) => ...)` and `styles.useVariants(...)`. The v2 API (`createStyleSheet`, `useStyles`) is forbidden.
- **No path aliases inside installed files.** Use relative imports between registry files; consumers may have different alias configs. Imports between registry items must match the installed layout (`lib/...`, `components/ui/...`).
- **Platform splits via filename**, not `Platform.OS` branching where avoidable. Web-only behavior in `*.web.tsx`; native-only in `*.native.tsx`; shared types in `*.types.ts`.
- **No DOM-only or web-only globals** in shared (non-`.web`) files.
- **TSDoc on all exports.** Document the *why* (purpose, lifecycle, platform caveats), not the *what*. Components should include an `@example`. See `SPEC.md` §11.4.
- **File naming:** PascalCase for files that export a single React component (e.g. `PortalHost.tsx`); kebab-case for utilities, stores, and hooks (e.g. `portal-store.ts`). Catalog files in `ui/` are kebab-case.
- **Installed paths in manifests must be kebab-case.** Source filenames may stay PascalCase; the manifest's `path` value transforms to kebab-case for what lands in the consumer's project.

---

## Style and tooling

- **Biome** (`biome.json`): 2-space indent, double quotes, trailing commas, semicolons as needed, automatic import organization. No ESLint or Prettier at the root.
- TypeScript strict, with two configs: `tsconfig.node.json` for tooling/scripts/tests, `tsconfig.registry.json` for registry source. Always run both via `npm run typecheck`.

---

## Testing

Tests in `tests/*.test.ts` use Node's built-in `node:test` + `node:assert` with the `tsx` loader. Headless logic only. No React renderer at the root — UI behavior is verified manually in a playground app (which is going to be rebuilt by the user from scratch in Phase 1).

---

## Reference docs

- `SPEC.md` — high-level overview. **In flux during Phase 0**; the authoritative current plan is in `specs/`.
- `specs/phase-0-restructure.md` — current actionable plan + progress tracker.
- `AGENTS.md` — short contributor guidelines.
- `HANDOFF.md` — one-page handoff for non-Claude-Code agents.
- `README.md` — consumer-facing setup. **Currently mid-rebrand** — install snippets still reference legacy URLs; full rewrite happens in Phase 0 step 12.
- `LICENSE` — MIT.

---

## Memory

Claude Code auto-loads `MEMORY.md` from the per-project memory dir. The current entries:

- `project_leshi_ui.md` — project context.
- `feedback_coding_philosophy.md` — duplicated above for redundancy; memory is canonical.
- `feedback_autonomy.md` — once a spec is signed off, execute fully; fix breakages inline.
- `user_language.md` — user replies in Argentine Spanish; code/docs stay in English.

If memory contradicts this file, **memory wins** (it's curated; this file can drift mid-phase).
