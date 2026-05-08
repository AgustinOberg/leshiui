# Repository Guidelines

This is **Leshi UI** — a shadcn-style, source-distributed UI component library for React Native + RN Web with two interchangeable styling backends. Hosting at `https://leshi-ui.pages.dev`. Repo at `https://github.com/AgustinOberg/leshiui`.

## Coding philosophy (read this first)

1. **Mirror shadcn first.** Look at how shadcn/ui implements something before writing the RN port. Match its props, naming, and composition patterns. Don't invent a new API when shadcn already defines one.
2. **Minimal dependencies.** Don't add npm deps without explicit approval. Reimplement small helpers in-tree.
3. **Single-file components.** Self-contained `.tsx` per component (composition + variants + types + exports). Split only when the file is genuinely hard to read. Cross-component logic goes in `primitives/` (or, when extracted in Phase 1+, `core/primitives/`).
4. **Strict types, no `any`.**
5. **Performance and accessibility are non-negotiable.** Correct roles / aria, keyboard on web, screen reader on native, no avoidable re-renders.
6. **Reuse via primitives.** New cross-component logic belongs in the primitives layer, not duplicated across components.

## Two styling backends

Leshi UI ships **two interchangeable styling backends**, picked per consumer project (they don't coexist):

- **Unistyles flavor** (`registry-src/styles/unistyles/`) — current implementation; uses `react-native-unistyles` v3.
- **StyleSheet flavor** (`registry-src/styles/stylesheet/`) — Phase 1 work; plain `StyleSheet` + Context-based theme provider, zero native deps. Skeleton in place.

The shared "recipe" (theme contract, eventually pure-logic primitives) lives in `registry-src/core/`. Only styling implementation differs.

## Project structure

- `registry-src/core/` — flavor-agnostic source. Contains `tokens/` (Theme contract + values) today; `primitives/`, `variants/`, `web-ui/` are skeletons for Phase 1+.
- `registry-src/styles/<style>/{lib,primitives,ui,items}/` — per-style source trees. Each style is autonomous; manifests in `items/` reference local files (relative paths) or shared core files (`core:` prefix).
- `public/v1/{registry.json,styles/<style>/{registry.json,r/*.json}}` — generated registry artifacts. Regenerate via `npm run build:registry`.
- `schemas/` — JSON schemas for registry validation.
- `scripts/build-registry.ts` — multi-style discovery + import rewriting + emission.
- `tests/` — Node tests (`*.test.ts`) for headless primitive logic.
- `specs/` — phase plans (`phase-0-restructure.md`, `phase-1-stylesheet-foundations.md`) and reference docs (`component-catalog.md`, `registry-protocol.md`).
- `SPEC.md` — high-level mission + architecture overview.
- `CLAUDE.md` — agent guidance with current Status section.
- `HANDOFF.md` — one-page handoff for new sessions.

## Build, test, and development commands

- `npm install` — install dependencies.
- `npm run lint` — Biome lint.
- `npm run format` — Biome format.
- `npm run check` — Biome lint + format + import organization.
- `npm run typecheck` — `tsc --noEmit` for both `tsconfig.node.json` and `tsconfig.registry.json`.
- `npm run build:registry` — regenerate registry artifacts into `public/`. CI fails if the tree is dirty afterwards, so commit the regenerated output.
- `npm test` — `node --test --import tsx tests/**/*.test.ts`. Single test: `node --test --import tsx tests/<file>.test.ts`.
- Always run `npm run lint` and `npm run typecheck` after every change.

## Coding style and naming

- Biome enforces formatting (2-space indent, double quotes, trailing commas, semicolons as needed, organized imports).
- TypeScript + ES modules. Explicit imports and typed exports.
- File naming: PascalCase for files exporting a single React component (e.g. `PortalHost.tsx`); kebab-case for utilities, stores, and hooks (e.g. `portal-store.ts`). Catalog files in `ui/` are kebab-case.
- **Installed paths in manifests must be kebab-case** (e.g. `lib/portal/portal-host.tsx`). Source filenames may stay PascalCase; the build script rewrites imports to match the install layout.
- **Unistyles flavor:** v3 API only — `StyleSheet.create((theme) => ...)` + `styles.useVariants(...)`. Do not use v2 (`createStyleSheet`, `useStyles`).
- **StyleSheet flavor (Phase 1+):** plain `StyleSheet.create` + Context-based theme provider; variant helper from `core/variants/`; web pseudo-classes via `useWebUi` from `core/web-ui/`.
- Inside registry files: relative imports only (no path aliases). Cross-tree imports under `registry-src/` are allowed (e.g. `../../../core/tokens/default.js`); the build script rewrites them to install-relative paths. Platform splits via `.web.tsx` / `.native.tsx`. No DOM-only globals in shared files.

## Manifest format

Per-item manifest at `registry-src/styles/<style>/items/<name>.manifest.json`:

```json
{
  "name": "button",
  "type": "registry:ui",
  "title": "Button",
  "description": "...",
  "registryDependencies": ["tokens"],
  "files": [
    { "source": "ui/button.tsx", "path": "components/ui/button.tsx", "type": "registry:ui" },
    { "source": "core:tokens/default.ts", "path": "lib/tokens/default.ts", "type": "registry:lib" }
  ]
}
```

`source` is relative to the style's tree by default, or prefixed `core:` to read from `registry-src/core/`. `path` is the install destination in the consumer's project, kebab-case. The build script enforces both.

See `specs/registry-protocol.md` for full details.

## Testing guidelines

- Use the built-in `node:test` runner with `assert` as shown in `tests/`.
- Name tests `*.test.ts` and keep them in `tests/`. They import from `registry-src/styles/unistyles/primitives/...` (today; some primitives may move to `core/primitives/` in Phase 1+).
- Run `npm test` locally before opening a PR.
- The test runner is headless; UI behavior is verified manually in a playground app (the user rebuilds it from scratch when needed).

## Commit and PR guidelines

- Concise, imperative subjects scoped per logical step (e.g., `feat(phase-0): rewrite build script for multi-style`). Phase work commits include a `phase-N` scope so the history is bisectable per phase.
- PR descriptions list the commands run (`lint`, `typecheck`, `test`, `build:registry`) and any relevant context.
- If you modify `registry-src/` or `schemas/`, run `npm run build:registry` and commit the regenerated `public/` artifacts; CI fails if the working tree is dirty after the build.
