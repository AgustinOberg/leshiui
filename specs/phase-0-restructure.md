# Phase 0 — Restructure & Rebrand

> **Status:** Spec under review. Execution begins after sign-off.
> **Scope:** Pure structural / rebrand work. **Zero new component code.** The Unistyles flavor must keep working end-to-end after Phase 0; the StyleSheet flavor is just an empty skeleton ready for Phase 1.

---

## 1. Goal

Convert the working tree from a single-flavor `shadniwind` registry into a **multi-style Leshi UI** registry that:

1. Mirrors shadcn's `style` mechanism — one namespace `@leshi-ui`, the consumer picks the styling backend with the `style` field in `components.json`.
2. Has a clear separation between **flavor-agnostic core** (pure logic, types, tokens) and **per-style trees** (anything that touches styling).
3. Is ready to host a second style (StyleSheet) in Phase 1 without further restructuring, and a third (e.g. NativeWind) by adding one folder.
4. Loses every trace of the legacy `shadniwind` name from the working tree, build script, public artifacts, package metadata, and docs.

Existing Unistyles components must continue to build and validate after the move. Their **content does not change** in Phase 0 — only their **location** and the **manifest paths** that point at them.

---

## 2. Non-goals (explicit)

These are **not** part of Phase 0 and will not be touched, even if related:

- Building any StyleSheet-flavor component (Phase 1+).
- Implementing the `web-pseudos` helpers (Phase 1+; only the empty folder reserves the slot).
- Refactoring existing Unistyles components for any reason — even small "while we're here" cleanups. The diff for each component file should be **path-only**.
- Adding tests, visual regression, a11y automation, or perf benchmarks.
- Building a docs site. `apps/docs/` stays as a flat markdown index.
- A custom CLI. We stay on `npx shadcn@latest` with a custom registry.

If something tempting comes up during execution that fits one of these, it goes in `specs/phase-1-stylesheet-foundations.md` as a TODO. Phase 0 stays surgical.

---

## 3. Locked architectural decisions

These were debated and closed. They are inputs to execution, not open questions.

| # | Decision | Value |
|---|---|---|
| 1 | Project name | **Leshi UI** |
| 2 | Public registry namespace | **`@leshi-ui`** |
| 3 | Hosting URL (configurable in build script) | `https://leshi-ui.pages.dev` |
| 4 | Hosting platform | Cloudflare Pages, manual deploy for now |
| 5 | License | **MIT** |
| 6 | Multi-style mechanism | shadcn `{style}` placeholder. URL = `<base>/v1/styles/{style}/r/{name}.json` |
| 7 | Initial styles | `unistyles` (migrated from existing tree) + `stylesheet` (empty skeleton) |
| 8 | Flavor-agnostic folder | `registry-src/core/` |
| 9 | Per-style folder | `registry-src/styles/<style>/` |
| 10 | Manifests location | Per-style: `registry-src/styles/<style>/items/*.manifest.json` (autocontained) |
| 11 | Component shape | **Single-file shadcn-style per style.** Logic that's truly flavor-agnostic moves to `core/`; styled components stay duplicated across styles. (See §4 for rationale.) |
| 12 | Tokens | Shape (`Theme` type) and values (HSL light + dark) live in `core/tokens/`. Each style ships them via its own wiring file. |
| 13 | Variants helper | `core/variants/` — small dependency-free helper used by styles whose backend doesn't have built-in variants (StyleSheet, future NativeWind). Unistyles uses its own. |
| 14 | Web UI helpers (hover / focus / active) | `core/web-ui/` — single hook `useWebUi({ hover, focus, active, ... })`. Native no-op. Implementation = Phase 1; folder + README are Phase 0. |
| 15 | Build script style discovery | Dynamic — walks `registry-src/styles/*/items/`. |
| 16 | Cross-style validation | Warning, not error. A component can exist in `unistyles` but not in `stylesheet`. |
| 17 | Versioning prefix | `v1` from day one of Leshi UI. |
| 18 | Tests location | Stay in `tests/` at repo root. Imports updated to point at `core/primitives/...`. |
| 19 | Playground (`apps/expo-app/`) | **Deleted.** User will rebuild from scratch in Phase 1. |
| 20 | Docs (`apps/docs/`) | Kept as flat markdown for now; proper docs site is much later. |
| 21 | Spec organization | Root `SPEC.md` = high-level overview. `specs/` folder = phase plans + reference docs. |
| 22 | Fork attribution in README | None. Clean rebrand. |

---

## 4. Why single-file-per-style instead of "component-in-core, style-varies"

The user raised this option ("define the component once in `core/`, only the styling layer varies per style"). It is intentionally **not** what Phase 0 implements. Reasoning:

**What it would buy us:** zero duplication of component logic (props, composition, refs, accessibility wiring) across styles.

**What it would cost:**

1. **Breaks the shadcn promise.** When a consumer runs `npx shadcn add @leshi-ui/button`, they expect to receive **one self-contained `button.tsx`** they can edit freely. With logic in core, they receive either (a) a thin wrapper that imports a headless module from another file (two files for one component, less editable in isolation), or (b) the build pipeline inlines core into the published item — meaning the source has split files but the output reunifies them. That's a non-trivial build-time templating system to maintain.
2. **Leaky abstraction risk.** "Logic" and "styling" are not cleanly separable in interactive components. Hover state, focus rings, disabled visuals, loading spinners all interleave logic with presentation. Forcing a clean cut produces awkward APIs at the seam.
3. **Premature optimization.** We don't have the second style yet. Until we do, we cannot validate which abstractions actually generalize. Forcing them now risks designing for the Unistyles model and breaking when StyleSheet (or NativeWind, or Tamagui) doesn't fit.
4. **Backwards exit is cheap.** If duplication becomes painful later, we can always extract logic to `core/` post-hoc, one component at a time. The opposite direction (extract-then-realize-it-doesn't-fit-then-merge-back) is harder.

**What we DO put in `core/`:** anything that's already flavor-agnostic by nature — pure-logic primitives (portal store, positioning math, focus state machines, roving focus state), token types and values, variants helper, accessibility role mappings, web pseudo-class helpers (Phase 1). Component bodies stay in their style's tree.

This is the same trade shadcn itself makes between `default` and `new-york` styles: same components, mostly duplicated, varying styling and minor structural choices.

---

## 5. Final tree (after Phase 0)

```
LeshiUI/
├── LICENSE                                     # NEW (MIT)
├── README.md                                   # REWRITE
├── SPEC.md                                     # REWRITE — high-level overview
├── CLAUDE.md                                   # REWRITE
├── AGENTS.md                                   # REWRITE
├── package.json                                # done
├── biome.json
├── tsconfig.json | tsconfig.base.json | tsconfig.node.json | tsconfig.registry.json
│
├── apps/
│   └── docs/                                   # kept (flat markdown index)
│
├── public/                                     # REGENERATED with new structure
│   └── v1/
│       ├── registry.json                       # top-level: lists available styles
│       └── styles/
│           ├── unistyles/
│           │   ├── registry.json
│           │   └── r/
│           │       └── *.json                  # one per item
│           └── stylesheet/                     # NOT created in Phase 0 (no items yet)
│
├── registry-src/
│   ├── core/                                   # flavor-agnostic
│   │   ├── primitives/
│   │   │   ├── portal/
│   │   │   │   └── portal-store.ts
│   │   │   ├── positioning/
│   │   │   │   ├── positioning-utils.ts
│   │   │   │   └── types.ts
│   │   │   ├── overlay/
│   │   │   │   └── dismiss-layer-state.ts
│   │   │   ├── focus/                          # whatever pure-logic exists today
│   │   │   ├── roving-focus/
│   │   │   ├── scroll-lock/
│   │   │   ├── press/
│   │   │   └── a11y/
│   │   ├── tokens/
│   │   │   ├── types.ts                        # Theme contract (shape)
│   │   │   └── default.ts                      # light + dark, HSL values
│   │   ├── variants/
│   │   │   └── index.ts                        # cva-like helper
│   │   └── web-ui/
│   │       └── README.md                       # placeholder — Phase 1 implements useWebUi
│   │
│   └── styles/
│       ├── unistyles/                          # migrated from registry-src/shadniwind/
│       │   ├── lib/
│       │   │   ├── unistyles.ts
│       │   │   └── unistyles-types.d.ts
│       │   ├── primitives/                     # styled wrappers around core primitives
│       │   │   ├── portal/                     # PortalProvider.tsx, PortalHost.tsx, Portal.tsx, index.ts
│       │   │   ├── positioning/                # use-positioning.* (web/native)
│       │   │   ├── overlay/                    # index.tsx (uses core dismiss-layer-state)
│       │   │   └── ...
│       │   ├── ui/                             # all 60+ components, untouched in content
│       │   │   ├── button.tsx
│       │   │   └── ...
│       │   └── items/
│       │       └── *.manifest.json             # all manifests, with updated source paths
│       │
│       └── stylesheet/                         # SKELETON — Phase 1 will fill these
│           ├── lib/
│           ├── primitives/
│           ├── ui/
│           ├── items/
│           └── README.md                       # explains Phase 1 plan
│
├── schemas/                                    # untouched
├── scripts/
│   └── build-registry.ts                       # REWRITTEN
├── specs/
│   ├── phase-0-restructure.md                  # this file
│   ├── phase-1-stylesheet-foundations.md       # NEW skeleton
│   ├── component-catalog.md                    # NEW (extracted from old SPEC §A)
│   └── registry-protocol.md                    # NEW (manifest format + build pipeline + URL scheme)
└── tests/
    ├── portal-store.test.ts                    # imports updated to core/primitives/portal/
    ├── positioning-utils.test.ts               # imports updated to core/primitives/positioning/
    └── overlay-dismiss-layer-state.test.ts     # imports updated to core/primitives/overlay/
```

---

## 6. What moves to `core/` in Phase 0

Phase 0 extraction is **deliberately minimal**. The goal is to prove the multi-style mechanism end-to-end with the smallest blast radius, not to refactor 60+ component imports preemptively.

**Phase 0 extracts only tokens.** Everything else stays where it is.

| What | Phase 0 disposition | Rationale |
|---|---|---|
| `lib/tokens.ts` (Theme type + light/dark values + `space()` helper) | Split into `core/tokens/types.ts` (the `Theme` type) and `core/tokens/default.ts` (values + `space()`). Old `lib/tokens.ts` deleted. | Tokens are the cleanest cross-flavor abstraction — every styling backend needs the same colors/radii/spacing. Only two files import them (`unistyles.ts` and `unistyles-types.d.ts`), so the rewrite blast radius is tiny. Justifies adding minimal import-rewriting support to the build script as a foundation for later extractions. |
| `primitives/portal/`, `primitives/overlay/` | Stay whole at `styles/unistyles/primitives/<x>/`. No file-level split. | Two files in these folders import `react-native-unistyles`, which forces them to live in the Unistyles tree. The remaining files (e.g., `portal-store.ts`, `dismiss-layer-state.ts`) are pure logic and conceptually belong in `core/`, but splitting them now means rewriting cross-tree relative imports in 60+ UI components that pull from these primitives. Phase 0 is not the right time. |
| `primitives/{positioning,focus,roving-focus,scroll-lock,press,a11y}/` | Stay whole at `styles/unistyles/primitives/<x>/`. | None of these import Unistyles, so they could move to `core/` cleanly. **They don't move in Phase 0** for the same reason: every UI component that imports them would have its import paths rewritten, which is a large mechanical change that Phase 0 explicitly avoids. |
| `ui/*.tsx` (60+ component files) | Move whole to `styles/unistyles/ui/`. Content unchanged. | All UI files use sibling imports for primitives and `lib/tokens` — those still work because the relative folder structure within `styles/unistyles/` mirrors the old `shadniwind/` layout. |

**Phase 1 (or whenever the StyleSheet flavor demands shared primitives) revisits this.** When that happens, primitives that don't depend on Unistyles get extracted to `core/primitives/<x>/`, the UI components' imports get rewritten by the build script (the same mechanism we're standing up now for tokens), and the StyleSheet flavor consumes the same primitives via the `core:` prefix.

### Tokens — concrete moves

Source files after Phase 0:

| Source path | Content |
|---|---|
| `registry-src/core/tokens/types.ts` | The `Theme` type definition extracted from current `lib/tokens.ts`. |
| `registry-src/core/tokens/default.ts` | The `tokens`, `lightTheme`, `darkTheme` exports + `space()` helper, all values lifted verbatim from current `lib/tokens.ts` (already HSL — verified). |
| `registry-src/styles/unistyles/lib/unistyles.ts` | Updated to import `lightTheme`, `darkTheme` from `../../../core/tokens/default.js`. |
| `registry-src/styles/unistyles/lib/unistyles-types.d.ts` | Updated to import `Theme` from `../../../core/tokens/types.js`. |
| `registry-src/styles/unistyles/lib/tokens.ts` | **Deleted.** Anything that needed those values now imports from core. |

The cross-tree relative imports (`../../../core/tokens/...`) are real source-level paths that TypeScript resolves correctly. They become a problem only at consumer-install time, where the file ends up at a flat path. The build script handles this with import rewriting (§9.1).

---

## 7. Tokens — concrete shape

`registry-src/core/tokens/types.ts`:

```ts
export type ThemeTokens = {
  colors: {
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    destructiveForeground: string
    border: string
    input: string
    ring: string
  }
  radius: { sm: number; md: number; lg: number }
  typography: {
    fontFamilies: { sans: string; mono: string }
    sizes: { xs: number; sm: number; md: number; lg: number; xl: number }
    weights: { normal: string; medium: string; semibold: string; bold: string }
    lineHeights: { tight: number; normal: number; relaxed: number }
  }
  spacing: (n: number) => number
}

export type ThemeName = "light" | "dark"
```

`registry-src/core/tokens/default.ts`:

```ts
import type { ThemeTokens } from "./types"

export const lightTheme: ThemeTokens = {
  colors: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(240 10% 3.9%)",
    // …full set, exact values lifted 1:1 from the existing registry-src/shadniwind/lib/tokens.ts
  },
  radius: { sm: 2, md: 4, lg: 8 },
  // …
}

export const darkTheme: ThemeTokens = {
  // inverted values, same shape
}
```

**Important:** Phase 0 does not redesign tokens. It extracts the existing values from the current `lib/tokens.ts` verbatim (converting any non-HSL formats to HSL strings if necessary) and moves them to `core/tokens/default.ts`. If the current values are already HSL, this is a pure copy.

The Unistyles `StyleSheet.configure(...)` call lives in `styles/unistyles/lib/unistyles.ts` and consumes `lightTheme`/`darkTheme` from core via a relative import. The TS module augmentation (`unistyles-types.d.ts`) stays alongside it.

---

## 8. Manifest format updates

### 8.1 Source path resolution

A manifest's `source` is now resolved with the following rules:

1. **Default** — relative to the style's tree (`registry-src/styles/<style>/`). E.g. `"source": "ui/button.tsx"` → resolves to `registry-src/styles/unistyles/ui/button.tsx`.
2. **Core prefix** — `"source": "core:primitives/portal/portal-store.ts"` → resolves to `registry-src/core/primitives/portal/portal-store.ts`. Anywhere a manifest needs a file from core, it uses this prefix.

The `path` field (where the file lands in the consumer's project) is unchanged.

### 8.2 Example after migration

`registry-src/styles/unistyles/items/portal.manifest.json`:

```json
{
  "name": "portal",
  "type": "registry:lib",
  "title": "Portal",
  "description": "Portal provider and host primitives for overlays.",
  "registryDependencies": ["tokens"],
  "files": [
    { "source": "core:primitives/portal/portal-store.ts", "path": "lib/portal/portal-store.ts", "type": "registry:lib" },
    { "source": "primitives/portal/PortalProvider.tsx",    "path": "lib/portal/portal-provider.tsx", "type": "registry:lib" },
    { "source": "primitives/portal/PortalHost.tsx",        "path": "lib/portal/portal-host.tsx",     "type": "registry:lib" },
    { "source": "primitives/portal/Portal.tsx",            "path": "lib/portal/portal.tsx",          "type": "registry:lib" },
    { "source": "primitives/portal/index.ts",              "path": "lib/portal/index.ts",            "type": "registry:lib" }
  ]
}
```

Note: `path` values may be normalized to kebab-case during this migration (existing manifests have a mix — `PortalProvider.tsx` capitalized). Confirmation needed in §13.

### 8.3 Tokens item

The `tokens` item changes the most because it now bundles core files + style-specific wiring:

`registry-src/styles/unistyles/items/tokens.manifest.json`:

```json
{
  "name": "tokens",
  "type": "registry:lib",
  "title": "Tokens",
  "description": "Semantic tokens and Unistyles theme configuration.",
  "dependencies": [
    "react-native-unistyles@^3.2.0",
    "react-native-nitro-modules@^0.35.2"
  ],
  "files": [
    { "source": "core:tokens/types.ts",       "path": "lib/tokens/types.ts",       "type": "registry:lib" },
    { "source": "core:tokens/default.ts",     "path": "lib/tokens/default.ts",     "type": "registry:lib" },
    { "source": "lib/unistyles.ts",           "path": "lib/unistyles.ts",          "type": "registry:lib" },
    { "source": "lib/unistyles-types.d.ts",   "path": "lib/unistyles-types.d.ts",  "type": "registry:lib" }
  ]
}
```

---

## 9. Build script rewrite

### 9.1 Import rewriting

The build script must rewrite cross-tree relative imports in source files into flat install-relative paths. Algorithm:

1. For each manifest, build a map: `<absolute source path> → <install path>` for every file the manifest declares.
2. For each file's content, find import statements: `import ... from "<path>"` or `export ... from "<path>"`.
3. For each import where `<path>` is relative (starts with `./` or `../`), resolve it to an absolute source path and look up the install path.
4. If the imported source path is not in the manifest's file map, leave the import untouched (it's an external package or out-of-scope file).
5. Otherwise compute the install-relative path from the current file's install path to the target's install path and replace.
6. Imports use `.js` extension by repo convention (ESM); the resolver tries `.js` → `.ts`, `.tsx`, `.d.ts` candidates when looking up source files.

In Phase 0 the only files that exercise this are `unistyles.ts` and `unistyles-types.d.ts` (both cross-tree to `core/tokens/`). All other UI/primitive files have sibling-only imports that are no-ops under the rewrite. The rewriter is small (~80 lines of regex) and pays off the moment any other file moves to core.

### 9.2 Constants

```ts
const REGISTRY_NAME = "leshi-ui"
const REGISTRY_BASE_URL = "https://leshi-ui.pages.dev"   // change here when migrating hosting
const REGISTRY_HOMEPAGE = "https://github.com/AgustinOberg/leshiui"
const REGISTRY_VERSION = "v1"

const ROOT = …
const SOURCE_DIR = path.join(ROOT, "registry-src")
const CORE_DIR   = path.join(SOURCE_DIR, "core")
const STYLES_DIR = path.join(SOURCE_DIR, "styles")
const OUTPUT_DIR = path.join(ROOT, "public")

async function main() {
  const styles = await discoverStyles(STYLES_DIR)             // ['stylesheet', 'unistyles'] (alphabetical)
  const allStylesIndex: Array<{ style: string; itemCount: number }> = []

  for (const style of styles) {
    const items = await readManifests(STYLES_DIR, style)
    if (items.length === 0) continue                          // skeleton style with no items yet — skip output
    const built = await Promise.all(items.map(m => buildItem(style, m)))
    await writeStyleRegistry(style, built)
    allStylesIndex.push({ style, itemCount: built.length })
  }

  await writeTopLevelIndex(allStylesIndex)
  await crossStyleValidation(styles)                          // emits warnings, does not fail the build
}

async function buildItem(style: string, manifest: Manifest): Promise<RegistryItem> {
  const files = await Promise.all(manifest.files.map(f => resolveFile(style, f)))
  return validate({ ...manifest, files })
}

async function resolveFile(style: string, f: ManifestFile): Promise<RegistryFile> {
  const source = f.source.startsWith("core:")
    ? path.join(CORE_DIR, f.source.slice("core:".length))
    : path.join(STYLES_DIR, style, f.source)
  const content = await readFile(source, "utf8")
  return { path: f.path, content, type: f.type, target: f.target }
}
```

Output paths:

- `public/v1/registry.json` — top-level index, lists styles available
- `public/v1/styles/<style>/registry.json` — per-style index
- `public/v1/styles/<style>/r/<name>.json` — per-item file

A style folder with **zero items** produces no output (so the empty `stylesheet/` skeleton in Phase 0 doesn't pollute `public/`).

---

## 10. Consumer `components.json`

Documented in `README.md` after Phase 0:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "unistyles",
  "rsc": false,
  "tsx": true,
  "tailwind": { "config": "", "css": "", "baseColor": "zinc", "cssVariables": false },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "@leshi-ui": "https://leshi-ui.pages.dev/v1/styles/{style}/r/{name}.json"
  }
}
```

Switching to the StyleSheet flavor (once Phase 1 ships components there) = change `"style": "unistyles"` to `"style": "stylesheet"`. Single-field switch.

---

## 11. Step-by-step execution plan

Numbered for review and progress tracking. Steps 1–4 are reversible safety work; 5–9 are the bulk of the diff; 10–12 are validation and cleanup.

1. **Branding constants in build script** — replace `REGISTRY_NAME`, add `REGISTRY_BASE_URL`, set `REGISTRY_HOMEPAGE` placeholder (TODO until repo URL is confirmed).
2. **Add `LICENSE`** (MIT, Agustín Oberg, current year).
3. **Create new folders empty** — `registry-src/core/{primitives,tokens,variants,web-ui}/`, `registry-src/styles/unistyles/{lib,primitives,ui,items}/`, `registry-src/styles/stylesheet/{lib,primitives,ui,items}/`, `specs/`.
4. **Create skeletons** — `registry-src/core/web-ui/README.md`, `registry-src/styles/stylesheet/README.md`, `specs/phase-1-stylesheet-foundations.md`, `specs/component-catalog.md`, `specs/registry-protocol.md`. Each is a short stub explaining what goes there.
5. **Move the Unistyles tree** — `registry-src/shadniwind/lib/*` → `registry-src/styles/unistyles/lib/*`, `registry-src/shadniwind/ui/*` → `registry-src/styles/unistyles/ui/*`, `registry-src/shadniwind/primitives/*` → `registry-src/styles/unistyles/primitives/*` (whole folders, no file-level split). Use `git mv` so history is preserved.
6. **Extract tokens to core** — create `core/tokens/types.ts` (the `Theme` type) + `core/tokens/default.ts` (`tokens`, `lightTheme`, `darkTheme`, `space()`). Update `styles/unistyles/lib/unistyles.ts` and `unistyles-types.d.ts` to import from `../../../core/tokens/...`. Delete `styles/unistyles/lib/tokens.ts`.
7. **Update primitive/UI imports** — none required. Sibling imports inside `primitives/<x>/` and `ui/` keep working because the folder structure inside `styles/unistyles/` mirrors the old `shadniwind/` layout 1:1.
8. **Migrate manifests** — move `registry-src/items/*.manifest.json` to `registry-src/styles/unistyles/items/`. For most items, just relocate (paths still resolve relative to the style root). For the `tokens` manifest, swap to the new shape (§8.3) with `core:` prefixes for the two extracted files. Apply kebab-case to all `path` values.
9. **Rewrite build script** — implement multi-style discovery + emission (§9.2) and the import rewriter (§9.1). Drop `REGISTRY_HOMEPAGE = "https://github.com/deicod/shadniwind"` and any remaining shadniwind references.
10. **Update tests** — fix `tests/*.test.ts` import paths to point at `core/primitives/...`. Run `npm test` to confirm green.
11. **Regenerate `public/`** — delete the entire current `public/` tree, run `npm run build:registry`, commit the new tree.
12. **Run the full check suite** — `npm run lint`, `npm run typecheck`, `npm test`, `npm run build:registry`, then `git status` must be clean.

After execution, commit messages stay narrow ("Phase 0: move Unistyles tree to styles/unistyles/", "Phase 0: extract tokens to core/", etc.) so anything goes wrong, the rollback is bisectable.

---

## 12. Documentation rewrites (in the same Phase 0 PR)

These files are rewritten from scratch (not edited) because the previous content is parcheado:

- `SPEC.md` — short overview: project mission, philosophy, two-style architecture, references to specs/. Old §0 / §11.4 content survives here in distilled form.
- `CLAUDE.md` — agent guidance, points at specs/ for detail. Removes "in-progress fork" language now that the rebrand is complete.
- `AGENTS.md` — short contributor guidelines. Same content as before but pointing at the new tree.
- `README.md` — consumer install instructions for the Unistyles flavor with the new URL and `components.json` shape.
- `specs/phase-1-stylesheet-foundations.md` — placeholder spec listing what Phase 1 will deliver: theme provider, useTheme hook, web-pseudos helpers, variants helper implementation, first Tier 1 components in stylesheet flavor.
- `specs/component-catalog.md` — Tier table from old SPEC §A, unchanged content.
- `specs/registry-protocol.md` — manifest format (with `core:` prefix), build pipeline, URL scheme, validation rules, hosting.

Old `RESEARCH.md` and `TASKS.md` — already deleted.

---

## 13. CI workflow (.github/workflows/ci.yml)

Existing workflow has two jobs: `ci` (lint + typecheck + build + dirty-tree check) and `deploy` (GitHub Pages on push to main). Since hosting is moving to **Cloudflare Pages with manual deploy**:

- **Keep** the `ci` job — still useful for PRs.
- **Remove** the `deploy` job entirely, plus the `permissions: pages: write / id-token: write` lines that were only there to support it.

This is a small but real change. Confirmation in §13.

---

## 14. Acceptance criteria

Phase 0 is done when **all** of these hold:

- [ ] `RESEARCH.md`, `TASKS.md`, `apps/expo-app/` no longer exist in the tree.
- [ ] `LICENSE` (MIT) present at root.
- [ ] No file under `registry-src/` is named or located under a path containing `shadniwind`.
- [ ] `registry-src/core/` contains pure-logic primitives, tokens types/values, variants helper, and a `web-ui/README.md` placeholder.
- [ ] `registry-src/styles/unistyles/` contains the full migrated Unistyles tree (lib, primitives, ui, items).
- [ ] `registry-src/styles/stylesheet/` exists with empty subfolders and a `README.md` placeholder.
- [ ] All manifests live under `registry-src/styles/<style>/items/` and use the new `core:` prefix where appropriate.
- [ ] `scripts/build-registry.ts` is the rewritten multi-style version with `REGISTRY_BASE_URL` constant.
- [ ] `public/` contains `v1/registry.json` and `v1/styles/unistyles/{registry.json,r/*.json}` only. No legacy paths.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes (both `tsconfig.node.json` and `tsconfig.registry.json`).
- [ ] `npm test` passes.
- [ ] `npm run build:registry && git status` shows a clean working tree.
- [ ] CI workflow no longer has a `deploy` job.
- [ ] `SPEC.md`, `CLAUDE.md`, `AGENTS.md`, `README.md` are rewritten and contain zero `shadniwind` references.

---

## 15. Locked answers (previously open questions)

All open questions from the planning round have been answered. Recorded here for traceability:

1. **GitHub repo URL**: `https://github.com/AgustinOberg/leshiui`. Used as `REGISTRY_HOMEPAGE` in the build script.
2. **License**: MIT, copyright `Agustín Oberg`, year `2026`.
3. **Installed path casing**: **kebab-case 100%**. Source filenames stay as they are (e.g. `PortalProvider.tsx` source); the manifest's `path` value is kebab-case (e.g. `lib/portal/portal-provider.tsx`).
4. **Old `lib/tokens.ts`**: **deleted** after extraction. No re-export wrapper.
5. **CI `deploy` job**: **removed**. Cloudflare deploy is manual; no CI integration needed.
6. **`web-pseudos` API**: collapsed to a **single hook** rather than three. Folder renamed `core/web-ui/`, exposing `useWebUi({ hover, focus, active, ... })` that returns merged style objects to spread into `style={[...]}`. Native = no-op. Implementation deferred to Phase 1; only the folder + a README describing the API contract live in Phase 0. (Folder name change reflected in §3, §5, §11, §16.)
7. **NativeWind / future styles in `registry-protocol.md`**: **skip**. Nothing decided about future styles; we'll document a real second style when one exists.

---

## 16. What is NOT done in Phase 0 (Phase 1 preview)

For clarity — these are next, but not now:

- `core/variants/index.ts` — actual cva-like helper implementation. Phase 0 only reserves the file path; the file can either be empty or contain a stub.
- `core/web-ui/*` — actual `useWebUi` hook implementation. Phase 1.
- `registry-src/styles/stylesheet/lib/theme-provider.tsx`, `use-theme.ts` — Phase 1.
- Any component in `registry-src/styles/stylesheet/ui/` — Phase 1+.
- A new `apps/expo-app-unistyles/` or `apps/expo-app-stylesheet/` — when needed, Phase 1.
- Responsive / breakpoints in the StyleSheet flavor — explicitly deferred (TODO recorded in `specs/phase-1-stylesheet-foundations.md`).
- A real docs site under `apps/docs/` — much later.
- Tests for a11y, visual regression, perf — much later.

---

## 18. Progress tracker

**Update this table after every commit.** Order matches §11. The "Commit" column is the short SHA of the commit that completed the step (or "in progress" / "pending" if not yet done).

| # | Step | Status | Commit |
|---|---|---|---|
| 0 | Pre-Phase-0 docs cleanup (deletions, LICENSE, package.json rename, partial doc updates) | done | `8d7e7e0` |
| 1 | Branding constants in build script (`REGISTRY_NAME`, `REGISTRY_BASE_URL`, `REGISTRY_HOMEPAGE`) | pending | — |
| 2 | LICENSE | done | `8d7e7e0` |
| 3 | Create new folders empty (`core/`, `styles/unistyles/`, `styles/stylesheet/`) | done | next commit |
| 4 | Create skeleton READMEs in placeholder folders + Phase 1 spec stubs | done | next commit |
| 5 | Move Unistyles tree (`shadniwind/{lib,ui,primitives}` → `styles/unistyles/{lib,ui,primitives}`) | pending | — |
| 6 | Extract tokens to core (`core/tokens/types.ts`, `core/tokens/default.ts`); update `unistyles.ts` + `unistyles-types.d.ts` imports; delete old `lib/tokens.ts` | pending | — |
| 7 | Update primitive/UI imports — none required; sibling imports survive the move (verify during execution) | pending | — |
| 8 | Migrate manifests to `registry-src/styles/unistyles/items/`; apply kebab-case to `path`; tokens manifest swaps to new shape | pending | — |
| 9 | Rewrite build script (multi-style discovery + import rewriter §9.1) | pending | — |
| 10 | Update tests imports (`registry-src/shadniwind/...` → new paths) | pending | — |
| 11 | Regenerate `public/` (delete old, rebuild, verify reproducibility) | pending | — |
| 12 | Run full check suite (`lint`, `typecheck`, `test`, `build:registry`, clean tree) | pending | — |
| 13 | CI workflow — remove `deploy` job, drop `pages` permissions | pending | — |
| 14 | Doc rewrites (`SPEC.md`, `README.md`, polish `CLAUDE.md`, polish `AGENTS.md`) | pending | — |
| 15 | New spec files (`specs/phase-1-stylesheet-foundations.md`, `specs/component-catalog.md`, `specs/registry-protocol.md`) | pending | — |
| 16 | Final pass: `grep -ri shadniwind` returns zero hits outside `node_modules/` | pending | — |

When all steps are `done`, Phase 0 is complete and `CLAUDE.md` Status section gets updated to point at Phase 1.

## 17. Risks

- **Token shape change** — if the existing `lib/tokens.ts` doesn't use HSL strings, converting them is a non-trivial value transform. Need to inspect during execution. If they're already HSL, zero risk. If not, I pause and confirm the conversion strategy.
- **Cross-tree relative imports** — only `unistyles.ts` and `unistyles-types.d.ts` use them in Phase 0 (both pointing at `core/tokens/`). The build script rewrites them to install-relative paths. If we later extract more files to core (Phase 1+), the same rewriter handles them automatically. If raw `../../../core/...` paths become unmanageable in source, a tsconfig path alias `@core/*` is the next step — not in Phase 0.
- **Manifest schema validation** — the `core:` prefix is our addition. The shadcn registry-item.json schema doesn't know about it; the build script strips the prefix before emitting. So validation passes. But: `schemas/` may have a Leshi-specific manifest schema that would need updating to allow the prefix. Inspect during execution.
