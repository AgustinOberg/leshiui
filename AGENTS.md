# AGENTS.md

Canonical instructions for any AI agent working on **Leshi UI**. Claude Code loads this via `@AGENTS.md` from `CLAUDE.md`; other agents (Codex, Cursor, etc.) should read it directly. Read it in full at the start of every session.

## Status

- **Phase 0** (Restructure & Rebrand) — done. See `specs/phase-0-restructure.md`.
- **Phase 1** — TBD; spec not yet drafted. See `ROADMAP.md` for the full milestone list (Phases 1–8).
- Don't start phase work before the active phase has a spec written and signed off.

## Creating a new component

See `specs/component-authoring.md` for the canonical 14-step workflow (shadcn-first design, HeroUI Native cross-check, spec-before-code, playground integration, Chrome verification). The rules in this file are binding; the workflow doc is *how* you apply them.

Claude Code: invoke the `component-authoring` project skill (`.claude/skills/component-authoring/SKILL.md`) before touching code — it loads the compact contract derived from this file and from `specs/component-authoring.md`.

## What this repo is

Leshi UI is a shadcn-style, source-distributed UI component library for React Native (iOS / Android / Web). It is **not** an npm package — it publishes a static **shadcn registry** that consumers install via `npx shadcn@latest add @leshi-ui/<item>`, copying source into their project.

The defining feature is **two interchangeable styling backends**, picked per consumer project (they don't coexist):

- **Unistyles flavor** (`registry-src/styles/unistyles/`) — uses `react-native-unistyles` v3. Current implementation.
- **StyleSheet flavor** (`registry-src/styles/stylesheet/`) — plain `StyleSheet` + Context theming, zero native deps. Skeleton only.

The shared "recipe" (theme contract today; future pure-logic helpers like a `useWebUi` hook or cva-like variants helper when Phase 2/3 needs them) lives in `registry-src/core/`. Only the styling layer differs per flavor.

Hosting: `https://leshi-ui.pages.dev` (Cloudflare Pages, manual deploy). Repo: `https://github.com/AgustinOberg/leshiui`.

## Hard rules (binding)

1. **Mirror shadcn first.** Look at how shadcn/ui implements a component (props, slot composition, naming, file shape) and port that to React Native. Don't invent APIs when shadcn already defines one. Document any platform deviation in TSDoc. Architecturally: the styled component is source-distributed; the primitive layer and icon library are **peer dependencies** the consumer installs — exactly as shadcn relates to Radix and lucide. See `specs/architecture/primitive-layer.md` and `specs/architecture/icon-system.md`.
2. **Minimal dependencies.** No npm deps without explicit user approval. Reimplement small helpers in-tree. **Pre-approved peer deps** (do not re-ask to add these — but always declare in the item manifest's `dependencies` field when imported): `@rn-primitives/*` (default primitive layer, mirroring shadcn↔Radix), `@expo/vector-icons` (default icon library), `lucide-react-native` + `react-native-svg` (alternative icon library), `react-native-reanimated@^3` (animations). Bar otherwise: Unistyles only for that flavor, React/RN as peers. Form integrations (`form-rhf`, `form-tsf`) are opt-in items.
3. **Single-file components.** Self-contained `.tsx` per component (composition + variants + types + exports). Split into hooks or sub-components only when genuinely unreadable. Cross-component behavior comes from the peer `@rn-primitives/*` packages; gap-filling shared logic goes in `registry-src/core/` (create the subdir when first needed).
4. **Strict typing. No `any`.** Mirror shadcn's TS surface.
5. **Performance and accessibility are non-negotiable.** Correct `accessibilityRole` / aria, keyboard support on web, screen reader support on native, no avoidable re-renders.
6. **Reuse via primitives.** Behavior, a11y, and composition come from `@rn-primitives/*` (peer deps). Only fork or extend into `registry-src/core/` when the upstream genuinely doesn't cover the case — see `specs/architecture/primitive-layer.md` §Custom primitives.
7. **TSDoc on all exports.** Document *why* (purpose, lifecycle, platform caveats), not *what*. Components include `@example`.

## Commands

**Package manager: Bun.** Never propose `npm`, `yarn`, or `pnpm` — every script and CI step assumes `bun`. The lockfile is `bun.lock`.

- `bun install` — install deps.
- `bun run lint` — oxlint (linter only).
- `bun run lint:fix` — oxlint with `--fix`.
- `bun run format` — Biome format (write).
- `bun run check` — Biome format + import organization (write) + `oxlint --fix`. Use this as the one-shot local fix command.
- `bun run check:ci` — Biome check (no writes) + oxlint. CI-friendly; exits non-zero on issues.
- `bun run typecheck` — runs `typecheck:node` (tooling) + `typecheck:registry` (registry sources).
- `bun run test` — `node --test --import tsx tests/**/*.test.ts`. Single: `node --test --import tsx tests/<file>.test.ts`. The runner stays on `node` because tests use `node:test`; Bun invokes it unchanged.
- `bun run build:registry` — embeds files into `public/`. **CI fails if the tree is dirty afterwards** — commit regenerated artifacts after touching `registry-src/` or `schemas/`.
- `bun run deploy` / `bun run deploy:preview` — Cloudflare Pages production / preview deploys via Wrangler. Maintainer-only; auth is local to the maintainer's machine.

Always run `bun run lint` and `bun run typecheck` after every change.

## Architecture

```
registry-src/
├── core/                      # flavor-agnostic
│   └── tokens/                # types.ts (Theme contract) + shadcn-default.ts (HSL values + space() helper)
└── styles/
    ├── unistyles/             # current Unistyles flavor
    │   ├── lib/               # unistyles.ts wiring + module augmentation
    │   ├── ui/                # public catalog (single-file components)
    │   └── items/             # per-item manifests (.manifest.json)
    └── stylesheet/            # Phase 3 skeleton (alt flavor, not yet implemented)
```

Future `core/` subdirs (`primitives/`, `variants/`, `web-ui/`) get created when Phase 2/3 work actually introduces code that belongs there — empty placeholder folders are not kept in-tree.

**Two install layers** in the consumer:

1. **Tokens & theme** — `core/tokens/` ships into the consumer's `lib/tokens/{types,shadcn-default}.ts` along with the flavor's wiring file (`lib/unistyles.ts` for the Unistyles flavor). Consumer imports the wiring once at startup before any styled code runs.
2. **UI components** — `styles/<style>/ui/`. Single-file shadcn-style `.tsx`. Behavior comes from peer `@rn-primitives/*`; nothing else is shipped from this repo's source.

**Registry build pipeline:**

- Each item is declared in `registry-src/styles/<style>/items/<name>.manifest.json`.
- Manifest sources default to relative under the style's tree; prefix `core:` to read from `registry-src/core/`.
- `scripts/build-registry.ts` discovers styles dynamically, embeds files, rewrites cross-tree imports to install-relative paths, validates against the registry-item schema, and emits per-style indexes + items.
- Output: `public/v1/registry.json` (top-level index) + `public/v1/styles/<style>/{registry.json,r/*.json}`.

Manifest example:

```json
{
  "name": "button",
  "type": "registry:ui",
  "title": "Button",
  "registryDependencies": ["tokens"],
  "files": [
    { "source": "ui/button.tsx", "path": "components/ui/button.tsx", "type": "registry:ui" },
    { "source": "core:tokens/shadcn-default.ts", "path": "lib/tokens/shadcn-default.ts", "type": "registry:lib" }
  ]
}
```

Full protocol: `specs/registry-protocol.md`. Adding new flavors: `registry-src/styles/README.md`.

## Critical conventions for `registry-src/**`

This code ships verbatim into consumer apps.

- **Unistyles v3 only** in the Unistyles flavor. Use `StyleSheet.create((theme) => ...)` + `styles.useVariants(...)`. The v2 API (`createStyleSheet`, `useStyles`) is forbidden.
- **No path aliases** in installed files — consumers may have different alias configs. Use relative imports between registry files. Cross-tree imports under `registry-src/` are allowed (e.g. `../../../core/tokens/default.js`); the build script rewrites them to install-relative paths.
- **Platform splits via filename**: `*.web.tsx` / `*.native.tsx`; shared types in `*.types.ts`. Avoid `Platform.OS` branching where a filename split works.
- **No DOM-only globals** in shared (non-`.web`) files.
- **File naming:** PascalCase for files exporting a single React component (e.g. `PortalHost.tsx`); kebab-case for utilities, stores, hooks, and catalog files in `ui/`.
- **Installed paths in manifests must be kebab-case.** Source filenames may stay PascalCase; the manifest's `path` lands in the consumer kebab-cased.

## Style and tooling

- **Linter: oxlint** (`.oxlintrc.json`). Mirrors the `react-native-unistyles` config: `correctness: error`, `suspicious: warn`, plugins `react` + `typescript`. `react/react-in-jsx-scope` is off (React 19 JSX transform). No ESLint.
- **Formatter: Biome** (`biome.json`, linter disabled) — 2-space indent, double quotes, trailing commas, semicolons as needed, automatic import organization (`assist.organizeImports`). No Prettier.
- TypeScript strict with two configs: `tsconfig.node.json` (tooling/tests) + `tsconfig.registry.json` (registry sources). `bun run typecheck` runs both.

## Testing

Tests live in `tests/*.test.ts` using Node's built-in `node:test` + `node:assert` via the `tsx` loader. Headless logic only — no React renderer at the root. UI behavior is verified manually in a playground app (the user rebuilds it when needed).

## Commit and PR guidelines

- Concise, imperative subjects scoped per logical step (e.g. `feat(phase-2): port button to stylesheet`). Phase work uses a `phase-N` scope so history is bisectable per phase.
- PR descriptions list the commands run (`lint`, `typecheck`, `test`, `build:registry`) plus relevant context.
- If you touch `registry-src/` or `schemas/`, run `bun run build:registry` and commit the regenerated `public/` artifacts. CI fails on a dirty tree.

## Working with the user

User writes in Argentine Spanish (voseo); reply in Spanish. Code, identifiers, file content, and commit messages stay in English.

Once a spec is signed off, execute fully and fix breakages inline. If a decision isn't in the spec, stop and ask — don't pick a default.

## Reference docs

- `ROADMAP.md` — master milestone index. Read first to know what's active.
- `SPEC.md` — mission, goals/non-goals, architectural rationale, versioning.
- `specs/phase-0-restructure.md` — done; commit map in §18.
- `specs/phase-2-stylesheet-foundations.md` — orphan skeleton (will renumber to Phase 3 when active).
- `specs/component-catalog.md` — tier mapping + per-component `Status` (`ready` / `not-ready`).
- `specs/registry-protocol.md` — manifest format, build pipeline, URL scheme.
- `specs/component-authoring.md` — 14-step workflow for creating components (shadcn-first, HeroUI Native cross-check, spec-before-code).
- `README.md` — consumer-facing install snippets.
