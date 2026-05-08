# Registry Protocol

Reference doc for how Leshi UI's static shadcn registry is built, organized, and consumed. Every contributor and every agent making changes to manifests, the build script, or the published artifacts should match what's described here.

## URL scheme

Public registry hosting: `https://leshi-ui.pages.dev` (Cloudflare Pages, manual deploy from `public/`).

| Path | Purpose |
|---|---|
| `/v1/registry.json` | Top-level index. Lists styles available (`unistyles`, `stylesheet`) and item counts. |
| `/v1/styles/<style>/registry.json` | Per-style index. Lists every item published for that style. |
| `/v1/styles/<style>/r/<name>.json` | Single item payload — the file the shadcn CLI fetches and installs. |

Consumer `components.json`:

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

The shadcn CLI substitutes `{style}` from the consumer's `style` field and `{name}` from the requested item name. Switching styles = change one field.

## Manifests

Source: `registry-src/styles/<style>/items/<name>.manifest.json`. One manifest per item per style. A flavor can ship a strict subset of components — manifest absence in a style means that item is not published for that style (warning, not error).

### Schema (Leshi UI dialect)

```json
{
  "name": "string",
  "type": "registry:lib | registry:ui | registry:component | registry:hook | registry:theme | …",
  "title": "string",
  "description": "string",
  "registryDependencies": ["other-item-name"],
  "dependencies": ["npm-package@^semver"],
  "devDependencies": ["npm-package@^semver"],
  "files": [
    {
      "source": "<style-relative path> | core:<core-relative path>",
      "path": "<install path inside consumer project>",
      "type": "registry:lib | registry:ui | …",
      "target": "<optional explicit target>"
    }
  ],
  "categories": ["string"],
  "meta": { "key": "value" },
  "docs": "string"
}
```

### Source path resolution

Each `files[].source` is resolved by the build script:

- **Default** — relative to the style's tree (`registry-src/styles/<style>/`). E.g. `"source": "ui/button.tsx"` resolves to `registry-src/styles/unistyles/ui/button.tsx` for the unistyles style.
- **`core:` prefix** — relative to `registry-src/core/`. E.g. `"source": "core:tokens/default.ts"` resolves to `registry-src/core/tokens/default.ts`. Used when a style's item ships a file shared with other styles.

The published JSON never exposes the prefix — it gets stripped during embedding. Consumers see only the final file content and install path.

### Install path conventions

- Always **kebab-case** (`lib/portal/portal-provider.tsx`, not `PortalProvider.tsx`).
- Source filenames may stay PascalCase for components (`PortalProvider.tsx` source); the manifest's `path` field rewrites to kebab-case for the install location.
- Standard locations:
  - `lib/*` — tokens, hooks, primitives, utility modules.
  - `components/ui/*` — public UI components.

## Build pipeline

`scripts/build-registry.ts` is the source of truth. Its job:

1. **Discover styles** — walk `registry-src/styles/*/`. Each non-empty subfolder is a style.
2. **Read manifests** — for each style, read every `items/*.manifest.json`.
3. **Resolve files** — for each manifest's `files[]`, read content from disk using the source-path resolution rules above.
4. **Rewrite imports** — for each file's content, find local imports (relative paths or cross-tree paths under `registry-src/`), look up the imported source's install path in the same manifest's `files[]` map, replace with install-relative paths. External package imports (e.g. `react-native-unistyles`) are untouched.
5. **Validate** — run each item through Ajv against the shadcn registry-item schema (`schemas/registry-item.schema.json`).
6. **Emit** — write `public/v1/styles/<style>/r/<name>.json` and `public/v1/styles/<style>/registry.json`. After all styles, write `public/v1/registry.json` as the top-level index.
7. **Cross-style validation** — for each item name, check which styles publish it. Print warnings for items missing in some styles. Don't fail.
8. **Reproducibility** — the script is deterministic; running twice yields byte-identical output. CI fails if the working tree is dirty after build.

### Build script constants

```ts
const REGISTRY_NAME = "leshi-ui"
const REGISTRY_BASE_URL = "https://leshi-ui.pages.dev"   // edit when migrating hosting
const REGISTRY_HOMEPAGE = "https://github.com/AgustinOberg/leshiui"
const REGISTRY_VERSION = "v1"
```

These live at the top of `scripts/build-registry.ts` for easy auditing.

### Empty-flavor handling

A `styles/<flavor>/` directory with zero manifests in `items/` produces no output (so a Phase 0 stylesheet/ skeleton with no items doesn't pollute `public/`).

## Schemas

`schemas/registry-item.schema.json` — JSON Schema (draft-07) for a single registry-item payload. Imported from shadcn upstream and pinned. Updates require manual sync.

`schemas/registry.schema.json` — JSON Schema for the registry index files (`registry.json`).

When extending the manifest format with Leshi UI dialect features (e.g., the `core:` source prefix), the schemas don't need to change because the prefix is stripped before validation.

## Versioning

Path-based: `/v1/...` everywhere. When a breaking change to the URL scheme or manifest format is required, publish to `/v2/...` while keeping `/v1/...` alive for some deprecation window. The `REGISTRY_VERSION` constant in the build script controls the prefix.

## Cross-style invariants

- An item name (e.g. `button`) means the same component across styles. Its public API (props, exports) should be identical between styles; only the styling layer differs.
- A consumer who installs `@leshi-ui/button` with `style: "unistyles"` and later switches to `style: "stylesheet"` should be able to do `npx shadcn add @leshi-ui/button` again and have the import paths in their existing app code keep working.
- Items can have flavor-specific `dependencies` (e.g., `unistyles` flavor's `tokens` item depends on `react-native-unistyles`; `stylesheet` flavor's `tokens` does not). Consumers see the right deps per their chosen style.

## When adding a new style (future)

1. Create `registry-src/styles/<new-style>/{lib,primitives,ui,items}/`.
2. Implement the flavor's theme wiring and at least one item to validate the build.
3. Run `npm run build:registry` — the script auto-discovers the new style.
4. Output appears at `public/v1/styles/<new-style>/...`.
5. Document the new style and its trade-offs in `styles/<new-style>/README.md` and update consumer `components.json` examples in `README.md`.

No build script changes required for new styles — discovery is dynamic.
