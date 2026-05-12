# CLAUDE.md

This file is auto-loaded by Claude Code at the start of every session in this repo. **Read it before doing anything.**

---

## Status — read this first

> **Phase 0 (Restructure & Rebrand) is complete.** The full structural rebrand landed across 7 commits on `main`: rename, LICENSE, deletions, folder skeletons, tree move, token extraction to `core/`, build script rewrite (multi-style discovery + import rewriting), manifest migration with kebab-case + `core:` prefix, public registry regenerated, CI deploy job removed, all docs rewritten. Validation: `lint`, `typecheck`, `test` (28/28), `build:registry` (idempotent — clean tree after rerun) all green. See `specs/phase-0-restructure.md` §18 for the per-step commit map.
>
> **Next: Phase 1 — StyleSheet flavor foundations.** The skeleton spec lives at `specs/phase-1-stylesheet-foundations.md` with a pre-flight checklist + open questions to surface before execution starts. Don't start Phase 1 work without first running through that checklist with the user.
>
> **Memory** (`/Users/agustinoberg/.claude/projects/-Users-agustinoberg-Documents-GitHub-LeshiUI/memory/MEMORY.md`) holds durable context: project intent, the user's coding philosophy, autonomy preferences, and language preference. Claude Code auto-loads it. If you are **not** Claude Code (different agent / fresh AI), read `HANDOFF.md` at repo root for a one-page orientation; it duplicates the essentials.

---

## What this repo is

**Leshi UI** is a shadcn-style, source-distributed UI component library for React Native (iOS / Android / Web).

The library is **not** an npm package. It builds a static **shadcn registry** (JSON files) that consumer apps install via `npx shadcn@latest add @leshi-ui/<item>`, which copies source files into the consumer's project.

The defining feature is **two interchangeable styling backends**:

1. **Unistyles flavor** — current implementation; uses `react-native-unistyles` v3.
2. **StyleSheet flavor** — Phase 1+; plain `StyleSheet` + Context-based theming, zero native dependencies.

The consumer picks one flavor per project via `components.json`'s `style` field; shadcn's `{style}` URL placeholder routes to the right registry payload. They never coexist. Implementation parallels shadcn's Radix-vs-BaseUI swap: a shared "recipe" (component logic, hooks, a11y wiring) in `registry-src/core/`, with the styling layer per `registry-src/styles/<style>/`.

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
- `npm run deploy` — builds + pushes `public/` to Cloudflare Pages production (`leshi-ui.pages.dev`) via Wrangler. Auth is local to the maintainer's machine. `npm run deploy:preview` deploys to a one-off preview URL instead.

---

## Architecture

Source layout:

```
registry-src/
├── core/                       # flavor-agnostic
│   ├── primitives/             # (Phase 1+: pure-logic primitive extraction)
│   ├── tokens/                 # types.ts (Theme contract) + default.ts (HSL values + space() helper)
│   ├── variants/               # (Phase 1+: cva-like helper)
│   └── web-ui/                 # (Phase 1+: useWebUi hook for hover / focus / active on RN Web)
└── styles/
    ├── unistyles/              # current Unistyles flavor
    │   ├── lib/                # unistyles.ts wiring + module augmentation
    │   ├── primitives/         # portal, overlay, positioning, focus, roving-focus, scroll-lock, press, a11y
    │   ├── ui/                 # public catalog (60+ components)
    │   └── items/              # per-item manifests (.manifest.json)
    └── stylesheet/             # Phase 1 skeleton
```

Three install layers mirror the install order in a consumer:

1. **Tokens & theme** — `core/tokens/` ships into the consumer's `lib/tokens/{types,default}.ts` along with the flavor's wiring file (`lib/unistyles.ts` for the Unistyles flavor). Consumer imports `lib/unistyles` once at startup before any `StyleSheet.create`.
2. **Primitives** — `styles/<style>/primitives/`. Cross-platform building blocks; platform splits via `.web.tsx` / `.native.tsx`; shared types in `*.types.ts`.
3. **UI components** — `styles/<style>/ui/`. Single-file shadcn-style `.tsx` per component. The Unistyles flavor uses `StyleSheet.create((theme) => ...)` with variants.

### Registry build pipeline

- Each item is declared by a manifest at `registry-src/styles/<style>/items/<name>.manifest.json`.
- Manifest sources default to relative under `registry-src/styles/<style>/`. Prefix with `core:` to address files in `registry-src/core/`.
- `scripts/build-registry.ts` discovers styles dynamically (walks `registry-src/styles/*/`), reads manifests, embeds files, rewrites cross-tree imports to install-relative paths, validates against the shadcn registry-item schema, and emits per-style indexes + items.
- Output: `public/v1/registry.json` (top-level index) + `public/v1/styles/<style>/{registry.json,r/*.json}`.
- See `specs/registry-protocol.md` for the full protocol; see `scripts/build-registry.ts` for implementation.

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

- `SPEC.md` — high-level mission, architecture, coding philosophy.
- `specs/phase-0-restructure.md` — current actionable plan + progress tracker.
- `specs/phase-1-stylesheet-foundations.md` — Phase 1 skeleton (StyleSheet flavor).
- `specs/component-catalog.md` — Tier mapping + per-component required primitives.
- `specs/registry-protocol.md` — manifest format, build pipeline, URL scheme.
- `AGENTS.md` — short contributor guidelines.
- `HANDOFF.md` — one-page handoff for non-Claude-Code agents.
- `README.md` — consumer-facing setup with the new registry URL.
- `LICENSE` — MIT, © 2026 Agustín Oberg.

---

## Memory

Claude Code auto-loads `MEMORY.md` from the per-project memory dir. The current entries:

- `project_leshi_ui.md` — project context.
- `feedback_coding_philosophy.md` — duplicated above for redundancy; memory is canonical.
- `feedback_autonomy.md` — once a spec is signed off, execute fully; fix breakages inline.
- `user_language.md` — user replies in Argentine Spanish; code/docs stay in English.

If memory contradicts this file, **memory wins** (it's curated; this file can drift mid-phase).
