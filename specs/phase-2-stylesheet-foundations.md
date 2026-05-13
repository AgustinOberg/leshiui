# Phase 2 — StyleSheet Flavor Foundations

> **Status: Skeleton — not yet active.** This spec is reserved for Phase 2 work. Phase 0 is complete; Phase 1 (see `specs/phase-1-*.md`) must complete first. Editing this file is fine; locking it as the active spec only happens after Phase 1 is signed off.

## Goal

Stand up the second styling backend — plain React Native `StyleSheet` + Context-based theming — to the point where Tier 1 components (button, input, card, etc.) are usable in the StyleSheet flavor and verified end-to-end in a playground app.

## Scope

In:

- `styles/stylesheet/lib/`: theme provider, `useTheme` hook, color scheme integration, tokens re-export from core.
- `core/web-ui/`: implement the planned `useWebUi({ hover, focus, active })` hook (web injects CSS, native no-op).
- `core/variants/`: implement the cva-like helper.
- Port the **Tier 1 catalog** (per `specs/component-catalog.md` Appendix B) to `styles/stylesheet/ui/`, with manifests in `styles/stylesheet/items/`.
- Possibly: extract one or two flavor-agnostic primitives to `core/primitives/` if Tier 1 components reuse them across flavors (e.g., `press`, `a11y`).
- Add a stylesheet playground app under `apps/playgrounds/stylesheet/` (mirroring the existing `apps/playgrounds/unistyles/`). User leads this.
- Update consumer docs to show the `style: "stylesheet"` install path.

Out:

- Tier 2+ components in StyleSheet flavor (Phase 3+).
- Refactoring all Unistyles primitives to core (only do it if a Tier 1 stylesheet component actually needs it).
- Visual regression tests, a11y automation, perf benchmarks (Phase 4+).
- A real docs site (much later).
- Responsive / breakpoints in StyleSheet flavor (deferred — TODO recorded here, not in v1).

## Open questions for Phase 2 (to answer before execution)

These are not blocking Phase 1; surface them before starting Phase 2:

1. **Theme switching API.** Manual prop on `ThemeProvider`, automatic via `useColorScheme()`, or both with prop overriding hook? Recommendation: both — `<ThemeProvider value={theme}>` accepts `light` / `dark` / `"auto"`, and `"auto"` reads `useColorScheme()`.
2. **Color scheme listener performance.** Re-render-on-theme-change is unavoidable in Context; the question is granularity. Use a single `<ThemeProvider>` at root or a `useThemeValue(selector)` pattern with a subscription store? Recommendation: simple Context for v1; revisit if profiling shows a problem.
3. **Variants helper memoization.** Stable references matter for `Pressable`'s `style` callback (which can re-run on every press). Memoize on input identity or use an LRU cache?
4. **Tier 1 catalog scope.** Per `specs/component-catalog.md` Appendix B, Tier 1 is button + input + textarea + card + badge + alert + separator + avatar + skeleton + spinner + progress + empty + aspect-ratio + kbd + typography. ~15 components. All in v1 of Phase 2, or split into 2a / 2b?
5. **Playground strategy.** One app with a switch (env var picks `style`), or two parallel apps `apps/playgrounds/unistyles/` + `apps/playgrounds/stylesheet/`? Current state has only the Unistyles playground; user had originally preferred two parallel apps.
6. **Form integrations (`form-rhf`, `form-tsf`).** Port to StyleSheet in Phase 2 or leave as Unistyles-only and revisit later? Both keep the consumer's choice of form library a separate decision.

## Pre-flight (must hold before starting Phase 2)

- [ ] Phase 1 progress tracker all rows marked done.
- [ ] `grep -ri shadniwind` returns zero hits outside `node_modules/`.
- [ ] Build script can already auto-discover a non-empty `styles/stylesheet/items/` folder and emit `public/v1/styles/stylesheet/...`.
- [ ] `npx shadcn@latest add @leshi-ui/tokens` against `https://leshi-ui.pages.dev/v1/styles/unistyles/r/tokens.json` works in a fresh test consumer (manual smoke test).

When all pre-flight items hold, this spec gets fleshed out with concrete tasks and a progress tracker.
