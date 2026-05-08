# SPEC — Leshi UI

High-level project specification. Active execution plans live in `specs/`; this document captures the durable mission, principles, and architecture.

## Mission

A shadcn-style, source-distributed UI component library for React Native (iOS / Android / Web) with **interchangeable styling backends**. The consumer picks one styling backend per project; component APIs and behavior are identical across backends. The library publishes a static shadcn registry — components install via `npx shadcn@latest add @leshi-ui/<item>` and live as editable source in the consumer's project.

## Goals

1. **shadcn API parity.** Component shapes (props, slot composition, naming, file layout) mirror shadcn/ui. A developer fluent in shadcn web should feel at home in Leshi UI's RN catalog.
2. **Backend-swappable styling.** Today: Unistyles flavor (high-perf, native deps). Soon: StyleSheet flavor (zero native deps, broader compatibility). Architecture must support a third or fourth backend without touching the build pipeline.
3. **Minimal dependencies.** Each registry item ships with the smallest surface that still works. The user owns and edits the installed code.
4. **Performance and accessibility.** Avoid unnecessary re-renders, lean on platform primitives, set proper `accessibilityRole` / aria, keyboard support on web, screen reader support on native.

## Non-goals

- Pixel-perfect parity with shadcn/ui's web visual design (RN constraints make some choices different; what matters is API parity).
- Expo Go support (Unistyles flavor has native deps that block it; StyleSheet flavor will not have this restriction).
- A custom CLI. Consumers use `npx shadcn@latest` directly with a custom registry namespace.
- Reinventing what shadcn already documents well — when in doubt, defer to shadcn's conventions.

## Architecture

### Source layout

```
registry-src/
├── core/                           # flavor-agnostic source
│   ├── primitives/                 # pure-logic primitives (extraction pending Phase 1+)
│   ├── tokens/                     # Theme contract + default light/dark values (HSL)
│   ├── variants/                   # cva-like helper (Phase 1+)
│   └── web-ui/                     # `useWebUi` for hover / focus / active on RN Web (Phase 1+)
└── styles/
    ├── unistyles/                  # Unistyles flavor (current)
    │   ├── lib/                    # unistyles.ts wiring + module augmentation
    │   ├── primitives/             # styled primitives — portal, overlay, focus, etc.
    │   ├── ui/                     # public catalog (button, dialog, card, ...)
    │   └── items/                  # per-item manifests
    └── stylesheet/                 # StyleSheet flavor (skeleton; Phase 1)
        └── …
```

A new styling backend is one new subfolder under `styles/<x>/` plus its own `items/` manifests. The build script discovers it dynamically.

### Three install layers

Within any flavor, components fall into three layers that mirror the install order in a consumer app:

1. **Tokens & theme** — installed first. The consumer must import the flavor's wiring file at startup before any styled code runs.
2. **Primitives** — cross-platform building blocks (portal, overlay, positioning, focus, roving-focus, scroll-lock, press, a11y). Most components depend on at least one. Platform splits use `.web.tsx` / `.native.tsx`; shared types in `*.types.ts`.
3. **UI components** — the public catalog. Each is a single-file shadcn-style `.tsx` with composition + variants + types + exports in one place.

### Registry distribution

- Hosting: `https://leshi-ui.pages.dev` (Cloudflare Pages, manual deploy from `public/`).
- URL pattern: `<base>/v1/styles/{style}/r/{name}.json` — shadcn CLI substitutes both placeholders.
- Top-level index: `<base>/v1/registry.json` lists styles + per-style item counts and registry URLs.
- Per-style index: `<base>/v1/styles/{style}/registry.json`.
- See `specs/registry-protocol.md` for manifest format, build pipeline behavior, validation rules, and cross-style invariants.

## Coding philosophy (binding)

These principles apply to every change. They are project-defining, not stylistic preferences.

1. **Mirror shadcn first.** Look at how shadcn implements a component and port that shape to RN. Don't invent new APIs when shadcn already defines one. Document any platform deviation in TSDoc.
2. **Minimal dependencies.** No npm dependencies beyond Unistyles (Unistyles flavor only) and React/RN peer deps without explicit user approval. Reimplement small helpers in-tree. Optional integration items (e.g. `form-rhf`, `form-tsf`) carry their own deps and are opt-in.
3. **Single-file components by default.** Like shadcn, a component file is self-contained: composition + variants + types + exports in one `.tsx`. Split into hooks or sub-components only when the file becomes genuinely hard to read. Cross-component logic goes in `primitives/` (or future `core/primitives/`).
4. **Strict typing.** No `any`. Mirror shadcn's TS surface where applicable.
5. **Performance and accessibility are non-negotiable.** Avoid unnecessary re-renders, lean on platform primitives, set correct `accessibilityRole` / aria, keyboard support on web, screen reader support on native.
6. **Reuse via primitives.** New cross-component logic belongs in the primitive layer, not duplicated.

## Documentation in source

Documentation is a first-class concern. Since components are source-distributed, in-source docs land in the consumer's editor as hover tooltips.

- **TSDoc on all exports.** Every exported type, interface, function, hook, and component carries `/** ... */`.
- **Why, not what.** Explain purpose, recommended placement, lifecycle behaviors, platform caveats. Don't repeat what well-named identifiers already say.
- **Examples.** Components and complex hooks include `@example` blocks.
- **Magic numbers & non-obvious logic.** Inline comments explain rationale.
- **Edge cases.** Note known platform limitations explicitly (e.g., "Web only", "Native fallback uses long-press").

## Tiering and component catalog

Components are tiered by complexity, from Tier 1 (simple presentational) to Tier 4 (big feature components like Calendar, Data Table). Tier 1 ships first in any new flavor — it's the minimum viable catalog. The full mapping with required primitives, platform notes, and tiers lives in `specs/component-catalog.md`.

## Versioning

Path-based: `/v1/...` is the current major version. Breaking changes to URL scheme or manifest format publish to `/v2/...` with `/v1/...` kept alive for a deprecation window. The `REGISTRY_VERSION` constant in `scripts/build-registry.ts` controls the prefix.

## Reference docs

- `CLAUDE.md` — agent guidance with a current-state Status section.
- `HANDOFF.md` — one-page orientation for new sessions or fresh AIs.
- `AGENTS.md` — short contributor guidelines + commands.
- `README.md` — consumer-facing setup and install snippets.
- `LICENSE` — MIT, © 2026 Agustín Oberg.
- `specs/phase-0-restructure.md` — Phase 0 plan + progress tracker.
- `specs/phase-1-stylesheet-foundations.md` — Phase 1 placeholder.
- `specs/component-catalog.md` — Tier mapping + required primitives.
- `specs/registry-protocol.md` — manifest format, build pipeline, URL scheme.
