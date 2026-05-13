# Architecture: primitive layer

Cross-cutting decision record. Read **before** authoring any component that needs portal / overlay / focus management / keyboard semantics (Tier 2+ in `specs/component-catalog.md`).

## Goal

Define what plays the role of **Radix UI** in Leshi UI's architecture: the headless, accessible, cross-platform primitive layer that our themed components consume. **We mirror shadcn/ui's model 1:1** — same separation of concerns, same distribution shape, same swap-the-primitive-layer flexibility shadcn has between Radix and Base UI.

- **Primitive layer** = behavior, a11y, keyboard, focus, portal, controllable state. **Unstyled. Peer dependency.**
- **Component layer** = visual identity, variants, tokens. **Source-distributed (consumer owns the code).**

This separation is what lets shadcn ship dozens of accessible components in a few hundred lines each — Radix does the work, shadcn paints it.

### shadcn ↔ Leshi UI mapping

| shadcn/ui | Leshi UI |
|---|---|
| Default primitive lib: Radix (`radix-ui` / `@radix-ui/react-*`) | Default primitive lib: **`@rn-primitives/*`** |
| Alternative primitive lib (swap via `components.json` `style`): Base UI (`@base-ui-components/react`) | Alternative primitive lib (future): TBD — any RN-headless lib that emerges (or a fork of `@rn-primitives` we publish ourselves) |
| Default icon lib: `lucide` | Default icon lib: **`@expo/vector-icons`** |
| Alternative icon libs: tabler, hugeicons, phosphor, remixicon, radix | Alternative icon libs (v1): **`lucide-react-native`** |
| Styled component lives in consumer repo (`components/ui/<x>.tsx`) | Styled component lives in consumer repo (`components/ui/<x>.tsx`) |
| Primitive lib + icon lib = npm peer deps in consumer's `package.json` | Primitive lib + icon lib = npm peer deps in consumer's `package.json` |

**The pattern is identical.** Anywhere we deviate from shadcn's exact mechanism, we say so explicitly in this doc.

## Decision

**Adopt `@rn-primitives/*` (MIT, by `roninoss` / RN-Reusables author) as Leshi UI's primitive layer.** Every Leshi UI Tier 2+ component is a Unistyles styling wrapper over the corresponding `@rn-primitives` package.

### Why

| Criterion | Outcome |
| --- | --- |
| Radix-shaped API (Root / Trigger / Portal / Overlay / Content / …) | Matches shadcn 1:1 — minimal cognitive shift for adopters. |
| MIT license | No restrictions. |
| Native deps | **None.** No autolinking, no `pod install` changes for consumers. |
| Styling coupling | Truly headless. Compatible with Unistyles, StyleSheet, NativeWind. |
| Web | Wraps `@radix-ui/react-*` directly under `.web.tsx` — focus trap, scroll lock, ESC, return-focus come **for free**. |
| Native | Hand-rolled but ships `BackHandler`, `accessibilityViewIsModal`, `nativeID` plumbing, `aria-modal`. |
| Catalog coverage | All 13 components on our Tier 2-3 plan exist (`dialog`, `slot`, `portal`, `alert-dialog`, `popover`, `dropdown-menu`, `select`, `tooltip`, `tabs`, `accordion`, `checkbox`, `switch`, `radio-group`). |
| Production signal | ~1M weekly downloads on `@rn-primitives/slot`. Used by React Native Reusables. |
| Maintainer | Same org as NativeWind; active release cadence (monthly). |

### Non-goals

- We do not vendor `@rn-primitives` source into our registry. It is a **peer dependency** of every consumer that installs a primitive-backed item.
- We do not write competing primitives when the upstream covers the case. Custom `core/primitives/` code is reserved for gaps the upstream does not fill (see §Custom primitives below).

## What this replaces

| Today | Tomorrow |
| --- | --- |
| `registry-src/core/primitives/slot/slot.tsx` | `@rn-primitives/slot` (peer dep on every item that ships `asChild`). |
| Archived `_archive/unistyles/primitives/portal/*` | `@rn-primitives/portal` (peer dep). |
| Archived `_archive/unistyles/primitives/overlay/*` | Per-component Overlay export from `@rn-primitives/<component>`. |
| Archived `_archive/unistyles/primitives/focus/*` | Built into `@rn-primitives/dialog` web variant via Radix; native variant has no focus trap (acceptable for v1). |
| Archived `_archive/unistyles/primitives/scroll-lock/*` | Built into web variant via Radix; native is a no-op (RN has no document scroll). |

## Custom primitives (when we still write our own)

Keep `registry-src/core/primitives/` for **cross-component logic that `@rn-primitives` doesn't supply** and that we don't want duplicated:

- Theme-aware helpers (e.g., a hook that returns the current breakpoint from Unistyles `rt`).
- Web-only `useWebUi` hover/focus/active visibility (Phase 2 task already on the roadmap).
- Variants helper (cva-like) if/when we introduce one.

We do **not** rewrite primitives `@rn-primitives` already ships. If the upstream is missing a feature we critically need (e.g., a stronger native focus containment for AlertDialog), the order of preference is:

1. Open an upstream PR / issue.
2. Wrap the upstream primitive locally and add the missing behavior on top.
3. Fork into `core/primitives/` only as a last resort, documented here.

## Manifest convention for npm peer deps

The registry-item schema (`schemas/registry-item.schema.json`) already supports:

- `dependencies: string[]` — npm peer deps the consumer must install.
- `registryDependencies: string[]` — other Leshi UI items the consumer must `npx shadcn add` first.

Convention going forward:

```json
{
  "name": "dialog",
  "type": "registry:ui",
  "registryDependencies": ["tokens"],
  "dependencies": [
    "@rn-primitives/dialog",
    "@rn-primitives/portal",
    "react-native-reanimated"
  ],
  "files": [
    { "source": "ui/dialog.tsx", "path": "components/ui/dialog.tsx", "type": "registry:ui" }
  ]
}
```

`@rn-primitives/portal` is listed explicitly even when transitively required by `@rn-primitives/dialog`, so the consumer sees the full surface in `package.json` and bundlers (Metro/Vite) resolve correctly.

**Pinning policy:** declare peer ranges as `^<latest-minor>`. `@rn-primitives/*` releases its family in lockstep, so consumers see version coherence in their lockfile.

## Migration plan (Slot / Button)

The current Slot lives at `registry-src/core/primitives/slot/slot.tsx` and is imported by `registry-src/styles/unistyles/ui/button.tsx`. Migration steps:

1. **Delete** `registry-src/core/primitives/slot/` and `registry-src/styles/unistyles/items/slot.manifest.json`. The item disappears from the registry.
2. **Rewrite** `button.tsx` to import from `@rn-primitives/slot` instead of the relative path. Behavior is byte-identical (the upstream API matches our hand-rolled one).
3. **Update** `button.manifest.json`:
   - Remove `registryDependencies: ["slot"]` if present.
   - Add `dependencies: ["@rn-primitives/slot"]`.
4. **Bump** Button's docs entry in `specs/component-catalog.md` only if behavior changes (it shouldn't).
5. **Regenerate** `public/v1/` via `bun run build:registry`.
6. **Update** playground app: `apps/playgrounds/unistyles/src/components/ui/button.tsx` and add `@rn-primitives/slot` to the playground's `package.json`.

The same migration recipe applies to any future component whose hand-rolled behavior is now in `@rn-primitives`.

## Per-flavor implications

The Unistyles flavor and the future StyleSheet flavor **both** consume `@rn-primitives`. The primitive layer is style-backend-agnostic by design. Each flavor's `ui/<component>.tsx` only changes how the JSX is **styled**, not how it's **composed**. This is the cleanest possible separation and the main payoff of adopting `@rn-primitives`.

## Future: swapping the primitive layer (mirror shadcn's Radix ↔ Base UI)

shadcn supports swapping its primitive layer between Radix and Base UI via the `style` field in `components.json`. The CLI fetches a different registry variant where the component source imports from the chosen primitive package. The styled component code is otherwise the same; only the import target and the corresponding `dependencies` line in the registry item change.

Leshi UI reserves the same mechanism for the day a second viable RN-headless lib exists (or we publish our own fork of `@rn-primitives` as an alternative):

**Mechanics (deferred — out of scope for v1):**

1. Add a `primitives` (or reuse `style`) field to the consumer's `components.json`. Values: `"rn-primitives"` (default) and `"<future-lib>"`.
2. Each item with a primitive-backed implementation ships **N variants** in the registry, one per primitive lib. Variants live under different URLs:
   ```
   public/v1/styles/unistyles/r/dialog.json                # default = rn-primitives
   public/v1/styles/unistyles/r/dialog.primitive-other.json # alternative
   ```
3. Per-variant source is generated either (a) by hand-writing each variant under `registry-src/styles/unistyles/ui/<x>.<variant>.tsx`, or (b) by an AST transform similar to the icon transform (see `specs/architecture/icon-system.md`). Decision deferred — depends on how mechanical the swap turns out to be.
4. The variant manifest swaps `dependencies` accordingly (`@rn-primitives/dialog` → `<alternative-package>`).

**Not built today, but the architecture is shaped so we can add it without breaking existing items.** Concretely: the registry URL scheme already supports per-item variant suffixes (used for the icon transform), and the manifest format already supports per-item `dependencies` — adding a primitive-layer variant is the same kind of pipeline extension.

## Open questions

None at sign-off. All resolved via earlier user clarification (adopt the model exactly like shadcn does with Radix, migrate Slot, refactor Button, future swap mechanism mirrored from shadcn's `style` field).
