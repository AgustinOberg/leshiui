# styles/

**Per-flavor source trees.** Each subfolder is one styling backend.

A consumer picks one flavor in their `components.json` via the `style` field. The shadcn CLI substitutes `{style}` into the registry URL pattern to fetch flavor-specific items.

## Adding a new flavor

1. Create `styles/<flavor>/` with subfolders `lib/`, `primitives/`, `ui/`, `items/`.
2. Implement the flavor's theme wiring in `lib/` consuming from `core/tokens/`.
3. Implement primitives and components in `primitives/` and `ui/`.
4. Add per-item manifests in `items/`. Manifest sources can reference style-local files (default) or shared core files via the `core:` prefix.
5. Run `npm run build:registry`. The build script auto-discovers the new flavor — no script changes needed.
6. Output lands at `public/v1/styles/<flavor>/{registry.json,r/*.json}`.

## Current flavors

- **`unistyles/`** — uses `react-native-unistyles` v3. Implementation migrated from the legacy `shadniwind/` tree in Phase 0.
- **`stylesheet/`** — plain `StyleSheet` + Context-based theming. Skeleton in Phase 0; built out in Phase 1.

## Flavors are autonomous

Each flavor's `items/` directory is the source of truth for what that flavor publishes. A flavor can ship a strict subset of components — cross-style validation is a warning, not an error — so the StyleSheet flavor is free to start with Tier 1 and grow without blocking the Unistyles flavor's catalog.

When adding new components in one flavor, **don't preemptively port them to other flavors**. Keep diffs narrow.
