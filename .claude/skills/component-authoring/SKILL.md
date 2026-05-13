---
name: component-authoring
description: "Trigger: create component, add component, port component, new Leshi UI component, crear componente. Apply the shadcn-first 14-step workflow with @rn-primitives + IconSlot."
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Activation Contract

Use when authoring or porting any Leshi UI component into `registry-src/styles/<flavor>/ui/`. Skip for tooling, registry scripts, or doc-only edits.

## Hard Rules

- Read `specs/component-authoring.md` in full before code — binding.
- **shadcn/ui** is the bible for exports, props, composition, visuals. **HeroUI Native** is a mobile-UX consultant only — never import its API.
- Use `@rn-primitives/<x>` for portal / overlay / focus trap / keyboard / controllable state. Do NOT hand-roll behavior the primitive ships.
- Icons go through `<IconSlot lucide="…" expoVectorIcons="Set:name" size={N} />`. Every `<IconSlot>` must declare every supported library prop — build fails otherwise.
- One `.tsx` per component per flavor. Platform splits via `.web.tsx` / `.native.tsx`, not `Platform.OS` branching.
- Tokens only — no hex, no magic dimensions. Strict TS, no `any`. Unistyles v3 only (`StyleSheet.create((theme) => …)` + `useVariants`). Never declare a `default` key inside a `variants` map.
- No path aliases inside `registry-src/` — relative imports only.
- Pre-approved peer deps (declare in manifest `dependencies` when imported, never re-ask): `@rn-primitives/*`, `@expo/vector-icons`, `lucide-react-native` (+ `react-native-svg`), `react-native-reanimated@^3`. Anything else needs dev approval at step 4.
- Never trust `_archive/unistyles/` blindly — reference only.
- Manifest `path` values must be kebab-case even when source files are PascalCase.
- Reply to the dev in Argentine Spanish (voseo). Code, identifiers, commits stay in English.

## Decision Gates

| Situation | Action |
|---|---|
| shadcn ships the component | Mirror exports + props 1:1 |
| shadcn does not ship it | Fall back to HeroUI Native / well-regarded reference; document in spec |
| Behavior is portal / overlay / focus / keyboard | Import from `@rn-primitives/<x>` |
| Logic is flavor-agnostic + cross-component | Place in `registry-src/core/primitives/` or `core/variants/` |
| New theme token needed | List with rationale in spec; add to `core/tokens/` |
| Non-pre-approved npm dep needed | `AskUserQuestion` at step 4; never silently add |
| Question already answered by shadcn source or `AGENTS.md` | Resolve yourself; do not ask the dev |

## Execution Steps

Follow `specs/component-authoring.md` §"The workflow (14 steps)":

1. Read shadcn docs + source.
2. Cross-check HeroUI Native.
3. Lock interface: exports, props, `@rn-primitives` package, icon glyphs.
4. Surface only architecturally-binding open questions via `AskUserQuestion`.
5. Write `specs/components/<name>/<name>_implementation_spec.md` from the template.
6. Apply code-quality requirements; invoke `dx-expert`, `vercel-composition-patterns`, `vercel-react-best-practices`, `simplify` as relevant.
7. Self-validate spec; resolve every open question.
8. Ask the dev in Spanish for sign-off: *"¿Sigo con la implementación?"*. Stop and wait.
9. Implement `registry-src/styles/<flavor>/ui/<name>.tsx` + manifest + any new `core/` primitives/tokens. Run `bun run lint`, `bun run typecheck`, `bun run build:registry` continuously.
10. Ask the dev to start the playground; wait for URL.
11. For each playground under `apps/playgrounds/<flavor>/`: copy component into `src/components/ui/<slug>.tsx`, create demo at `src/app/components/<slug>.tsx`, register in `src/app/index.tsx` (`slug` union + `COMPONENTS` entry).
12. Open the playground in Chrome (`mcp__claude-in-chrome__tabs_context_mcp` → `navigate`).
13. Verify visual parity with shadcn, every state (default / hover web / focus / active / disabled / loading / error), a11y tree, keyboard tab, clean console.
14. Mark `ready` in `specs/component-catalog.md`. Re-run `bun run lint && bun run typecheck && bun run build:registry && bun run test`. Commit regenerated `public/`. Ask: *"¿Falta algo o lo marco como listo?"*

## Output Contract

Every authoring session must produce:

- `specs/components/<name>/<name>_implementation_spec.md`.
- `registry-src/styles/<flavor>/ui/<name>.tsx` per active flavor (today only `unistyles`).
- `registry-src/styles/<flavor>/items/<name>.manifest.json` with complete `registryDependencies` + npm `dependencies`.
- Playground integration (copy + demo screen + index entry) per active flavor.
- Regenerated `public/v1/**` artifacts committed (CI fails on dirty tree).
- `specs/component-catalog.md` updated to `ready`.

## References

- `specs/component-authoring.md` — canonical 14-step workflow + spec template + anti-patterns.
- `AGENTS.md` — binding hard rules.
- `specs/architecture/primitive-layer.md` — `@rn-primitives` peer-dep model.
- `specs/architecture/icon-system.md` — `<IconSlot>` placeholder + per-library variants.
- `specs/registry-protocol.md` — manifest format + build pipeline.
- `specs/component-catalog.md` — tier mapping + per-component status.
