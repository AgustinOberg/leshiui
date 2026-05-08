# Repository Guidelines

This is **Leshi UI** — a shadcn-style, source-distributed UI component library for React Native + RN Web. The repo is a fork of [shadniwind](https://github.com/deicod/shadniwind); the rebrand and dual-backend (Unistyles + StyleSheet) work are in progress, so legacy `shadniwind` references in the tree are expected and will be migrated incrementally.

## Coding philosophy (read this first)

1. **Mirror shadcn first.** Look at how shadcn/ui implements something before writing the RN port. Match its props, naming, and composition patterns. Don't invent a new API when a shadcn one already exists.
2. **Minimal dependencies.** Don't add npm deps without explicit approval. Reimplement small helpers in-tree.
3. **Single-file components.** Self-contained `.tsx` per component (composition + variants + types + exports). Split only when the file is genuinely hard to read. Cross-component logic goes in `primitives/` (or the future `core/`).
4. **Strict types, no `any`.**
5. **Performance and accessibility are non-negotiable.** Correct roles / aria, keyboard on web, screen reader on native, no avoidable re-renders.
6. **Reuse via primitives.** New cross-component logic belongs in the primitives layer, not duplicated across components.

## Project direction (in progress)

Leshi UI ships **two interchangeable styling backends**, picked per consumer project (they don't coexist):

- **Unistyles flavor** — current code path; uses `react-native-unistyles` v3.
- **StyleSheet flavor** — to be added; plain `StyleSheet` + Context-based theme provider, zero native deps.

The shared "recipe" (component logic, hooks, a11y, variants) is flavor-agnostic; only styling differs. Several architectural details (registry layout, hosting URL, naming, theming for the StyleSheet flavor, migration scope) are still open — confirm with the user before locking them into code.

## Project structure

- `registry-src/shadniwind/` — current registry source (Unistyles flavor). Will be reorganized into `registry-src/core/` + `registry-src/unistyles/` + `registry-src/stylesheet/` as the dual-backend work lands.
- `registry-src/items/*.manifest.json` — registry items and file mappings.
- `public/` — generated registry artifacts (GitHub Pages). Regenerate via `npm run build:registry`.
- `schemas/` — JSON schemas for registry validation.
- `scripts/build-registry.ts` — builds `public/` from `registry-src/`.
- `tests/` — Node tests (`*.test.ts`) for headless primitive logic.
- `apps/expo-app/` — playground app for manual UI verification (separate `package.json`).
- `SPEC.md`, `TASKS.md`, `RESEARCH.md` — planning notes.

## Build, test, and development commands

- `npm install` — install dependencies.
- `npm run lint` — Biome lint.
- `npm run format` — Biome format.
- `npm run check` — Biome lint + format + import organization.
- `npm run typecheck` — `tsc --noEmit` for both `tsconfig.node.json` and `tsconfig.registry.json`.
- `npm run build:registry` — generate registry artifacts into `public/`. CI fails if the tree is dirty afterwards, so commit regenerated output.
- `npm test` — `node --test --import tsx tests/**/*.test.ts`. Single test: `node --test --import tsx tests/<file>.test.ts`.
- Always run `npm run lint` and `npm run typecheck` after every change.

## Coding style and naming

- Biome enforces formatting (2-space indent, double quotes, trailing commas, semicolons as needed, organized imports).
- TypeScript + ES modules. Explicit imports and typed exports.
- React components in PascalCase (`PortalHost.tsx`); utilities, stores, and hooks in kebab-case (`portal-store.ts`). Catalog files in `ui/` are kebab-case by convention.
- **Unistyles flavor:** v3 API only — `StyleSheet.create((theme) => ...)` + `styles.useVariants(...)`. Do not use v2 (`createStyleSheet`, `useStyles`).
- **StyleSheet flavor (planned):** plain `StyleSheet.create` + Context-based theme provider. Variant helper to be defined dependency-free.
- Inside registry files: relative imports only (no path aliases), platform splits via `.web.tsx` / `.native.tsx`, no DOM-only globals in shared files.

## Testing guidelines

- Use the built-in `node:test` runner with `assert` as shown in `tests/`.
- Name tests `*.test.ts` and keep them in `tests/`.
- Run `npm test` locally before opening a PR.
- The test runner is headless; UI behavior is verified manually in `apps/expo-app/`.

## Commit and PR guidelines

- Concise, imperative subjects.
- PR descriptions list the commands run (`lint`, `typecheck`, `test`) and any relevant context.
- If you modify `registry-src/` or `schemas/`, run `npm run build:registry` and commit the regenerated `public/` artifacts; CI fails if the working tree is dirty after the build.
