# Phase 0 — Restructure & Rebrand

> **Status: complete.** All 17 tracker rows landed across 7 commits on `main`. This doc is preserved as the historical record of Phase 0's locked decisions, deliverables, and commit map. Full execution detail is in git history (each row in §3 maps to a commit).

## Goal

Convert the working tree from a single-flavor `shadniwind` registry into a **multi-style Leshi UI** registry that:

1. Mirrors shadcn's `style` mechanism — one namespace `@leshi-ui`, the consumer picks the styling backend via `components.json`'s `style` field.
2. Cleanly separates **flavor-agnostic core** (pure logic, types, tokens) from **per-style trees** (anything that touches styling).
3. Is ready to host a second style (StyleSheet) in Phase 2 without further restructuring, and a third (NativeWind, etc.) by adding one folder.
4. Loses every trace of the legacy `shadniwind` name from the working tree, build script, public artifacts, package metadata, and docs.

Existing Unistyles components had to keep building and validating after the move — their **content didn't change**, only **location** and the **manifest paths** that point at them.

## Locked architectural decisions

These were debated and closed during Phase 0 planning. They still shape the current layout — change any of them deliberately.

| # | Decision | Value |
|---|---|---|
| 1 | Project name | **Leshi UI** |
| 2 | Public registry namespace | **`@leshi-ui`** |
| 3 | Hosting URL | `https://leshi-ui.pages.dev` (Cloudflare Pages, manual deploy) |
| 4 | License | MIT, © 2026 Agustín Oberg |
| 5 | Multi-style mechanism | shadcn `{style}` placeholder. URL = `<base>/v1/styles/{style}/r/{name}.json` |
| 6 | Initial styles | `unistyles` (migrated) + `stylesheet` (empty skeleton) |
| 7 | Flavor-agnostic folder | `registry-src/core/` |
| 8 | Per-style folder | `registry-src/styles/<style>/` |
| 9 | Manifests location | Per-style: `registry-src/styles/<style>/items/*.manifest.json` (autocontained) |
| 10 | Component shape | **Single-file shadcn-style per style.** Truly flavor-agnostic logic moves to `core/`; styled components stay duplicated across styles. |
| 11 | Tokens | Shape (`Theme` type) and values (HSL light + dark) live in `core/tokens/`. Each style ships them via its own wiring file. |
| 12 | Variants helper | `core/variants/` — small dependency-free helper used by styles whose backend doesn't have built-in variants. Unistyles uses its own. |
| 13 | Web UI helpers | `core/web-ui/` — single hook `useWebUi({ hover, focus, active, ... })`. Native no-op. Implementation deferred to Phase 2. |
| 14 | Build script style discovery | Dynamic — walks `registry-src/styles/*/items/`. |
| 15 | Cross-style validation | Warning, not error. A component can exist in `unistyles` but not in `stylesheet`. |
| 16 | Versioning prefix | `v1` from day one of Leshi UI. |
| 17 | Tests location | `tests/` at repo root. |
| 18 | Installed path casing | **kebab-case 100%.** Source filenames may stay PascalCase; manifest `path` lands kebab-cased. |
| 19 | Spec organization | Root `SPEC.md` = high-level overview. `specs/` folder = phase plans + reference docs. |

### Why single-file-per-style (not "component-in-core, style-varies")

This was explicitly considered and rejected. Putting component logic in `core/` and varying only the styling would break the shadcn promise (one self-contained `button.tsx` per install), force a leaky logic/styling split (hover state, focus rings, disabled visuals, spinners interleave both), and prematurely commit to abstractions before the second flavor exists to validate them. Backwards exit (extract to core later when duplication hurts) is cheap; the opposite direction isn't. Shadcn itself makes the same trade between `default` and `new-york` styles.

## Progress tracker

| # | Step | Status | Commit |
|---|---|---|---|
| 0 | Pre-Phase-0 docs cleanup (deletions, LICENSE, package.json rename, partial doc updates) | done | `8d7e7e0` |
| 1 | Branding constants in build script (`REGISTRY_NAME`, `REGISTRY_BASE_URL`, `REGISTRY_HOMEPAGE`) | done | `e676f4b` |
| 2 | LICENSE (MIT, © 2026 Agustín Oberg) | done | `8d7e7e0` |
| 3 | Create new folders empty (`core/`, `styles/unistyles/`, `styles/stylesheet/`) | done | `a820a18` |
| 4 | Create skeleton READMEs in placeholder folders + Phase 2 spec stubs | done | `a820a18` |
| 5 | Move Unistyles tree via `git mv` so history survives | done | `e904ff5` |
| 6 | Extract tokens to core; update `unistyles.ts` + `unistyles-types.d.ts` imports; delete old `lib/tokens.ts` | done | `8bcaa62` |
| 7 | Update primitive/UI imports — none required; sibling imports survived the move | done | `e904ff5` |
| 8 | Migrate manifests to `registry-src/styles/unistyles/items/`; kebab-case paths; tokens manifest uses `core:` prefix | done | `e676f4b` |
| 9 | Rewrite build script (multi-style discovery + import rewriter) | done | `e676f4b` |
| 10 | Update tests imports (`registry-src/shadniwind/...` → `registry-src/styles/unistyles/...`) | done | `e904ff5` |
| 11 | Regenerate `public/` under `v1/styles/<style>/...` | done | `e676f4b` |
| 12 | Full check suite (`lint`, `typecheck`, `test`, `build:registry`, clean tree) | done | `44b90f2` |
| 13 | CI workflow — remove `deploy` job, drop `pages` permissions, add explicit test step | done | `44b90f2` |
| 14 | Doc rewrites (`SPEC.md`, `README.md`, polish `CLAUDE.md`, `AGENTS.md`) | done | `44b90f2` |
| 15 | New spec files (`specs/phase-2-stylesheet-foundations.md`, `component-catalog.md`, `registry-protocol.md`) | done | `a820a18` |
| 16 | Final pass: `grep -ri shadniwind` outside `node_modules/` returns only intentional historical references | done | `44b90f2` |

For detailed step-by-step execution rationale, manifest examples, and build-script design, see the commits referenced above.
