# Roadmap

Master TODO for Leshi UI. Each phase becomes a dedicated spec under `specs/phase-N-<slug>.md` when it goes active. Only one phase is "active" at a time; the rest are pending. Don't start a phase before its spec is written and signed off.

## Phases

| # | Milestone | Status | Spec |
|---|---|---|---|
| 0 | Restructure & rebrand. Multi-style registry, `core/` extraction, build pipeline, docs rewrite. | done | `specs/phase-0-restructure.md` |
| 1 | Registry foundations for Unistyles flavor: theming wiring + a single base component + shared utils. The minimum needed to validate the install path end-to-end before scaling the catalog. | pending | not yet drafted |
| 2 | Base components in Unistyles (`button`, `spinner`, `avatar`, `badge`). Includes AI quality directives (so any agent can replicate the standard), per-component spec + docs, and archiving the rest of the legacy catalog. | pending | not yet drafted |
| 3 | Same base components ported to the StyleSheet flavor. Same APIs, same directives, same docs — different styling backend. Phase 3 pulls in the StyleSheet flavor foundations (theme provider, `useTheme`, `useWebUi`, variants helper) as prerequisites. | pending | existing skeleton at `specs/phase-2-stylesheet-foundations.md` will be renumbered + rescoped to this when active. |
| 4 | Theming interop: transformer that consumes a shadcn `presetID` (or equivalent shadcn theme preset) and emits a matching Leshi UI theme for both flavors. | pending | not yet drafted |
| 5 | Documentation site (consumer-facing docs, per-component pages, install snippets). | pending | not yet drafted |
| 6 | Per-component tests + CI/CD. Each component ships with its test suite; CI runs lint + typecheck + test + build:registry on every PR. | pending | not yet drafted |
| 7 | More components beyond the base set. Tier 2+ from `specs/component-catalog.md`, prioritized by demand. | pending | not yet drafted |
| 8 | AI tooling. Scope TBD — likely agent integrations, codemod helpers, MCP server, or similar. | pending | not yet drafted |

## Working agreement

- Each spec mirrors Phase 0's structure: goal / non-goals / numbered execution plan / progress tracker.
- A phase's spec is locked before execution starts. Surface unresolved questions in the spec's "Open questions" section first.
- When a component reaches "ready" in a phase, flip its row in `specs/component-catalog.md` to `ready`. Status there is the canonical signal.
- Phase numbering is stable once published here. Reordering means rewriting cross-references — avoid unless necessary.
