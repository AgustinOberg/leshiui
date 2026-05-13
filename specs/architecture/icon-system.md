# Architecture: icon system

Cross-cutting decision record. Read **before** authoring any component that renders an icon (Dialog close, Select chevron, Checkbox check, etc.).

## Goal

Let consumers pick their icon library **at install time** the same way shadcn/ui does with its `iconLibrary` config — without runtime indirection. The author writes one source of truth; the registry build emits the per-library variant the consumer chose.

## Decision

**Mirror shadcn's approach: scaffold-time AST rewrite via `ts-morph`.**

- Component authors render a placeholder `<IconSlot lucide="X" expoVectorIcons="Feather:x" />`.
- A new transformer in `scripts/build-registry.ts` (or a sibling step) rewrites the placeholder per `iconLibrary` variant **at registry-build time**, emitting one file per variant under the per-style registry.
- The consumer's `components.json` declares `iconLibrary`; the Leshi CLI install path serves the matching variant.
- Output in the consumer's repo is a **direct import** of the chosen library — zero runtime overhead, zero context providers, fully grep-able source.

### Why scaffold-time over runtime

| Option | Pros | Cons |
| --- | --- | --- |
| Scaffold-time AST (chosen) | Zero runtime cost · grep-able output · matches shadcn philosophy · per-component bundle has only one icon library | More build-script complexity. |
| Runtime `IconProvider` + `useIcon()` | Swap at runtime; theming-friendly | Adds indirection layer, hits Hard Rule #3 (single-file feel), every render pays context lookup, opaque to readers. |
| One library hardcoded | Simplest | No flexibility, forces ecosystem choice on every adopter. |

shadcn picked scaffold-time and the model has proven itself. We do the same.

## Supported libraries (v1)

| `iconLibrary` value | Package | Why |
| --- | --- | --- |
| `expo-vector-icons` (default) | `@expo/vector-icons@^15` | Default for Expo-aligned audience. No `react-native-svg` peer. Font-based; one font per set ships in bundle. |
| `lucide` | `lucide-react-native@^0.5xx` | True per-icon tree-shake via SVG. Visual parity with shadcn web (lucide is the same glyph set). Requires `react-native-svg` peer. |

Adding more (`tabler`, `hugeicons`, `phosphor`, `remixicon`, `heroicons`) is a follow-up: extend the libraries table, add a placeholder prop, ship a glyph-mapping row per icon. Out of scope for v1.

**Default:** `expo-vector-icons`. Rationale: Leshi UI's primary target is Expo/Expo-Router consumers, and `@expo/vector-icons` is already in every default Expo template.

## `<IconSlot>` placeholder syntax

`IconSlot` is a **source-only** JSX element. It never reaches the consumer's bundle — the transform replaces it.

```tsx
import { IconSlot } from "../../../core/icons/icon-slot.js"

// Usage in a component (Dialog close button):
<IconSlot
  lucide="X"
  expoVectorIcons="Feather:x"
  size={16}
  color="currentColor"
  accessibilityLabel="Close"
/>
```

Props:

- `lucide?: string` — exported icon name in `lucide-react-native` (e.g., `"X"`, `"ChevronDown"`).
- `expoVectorIcons?: string` — `"<Set>:<name>"` format (e.g., `"Feather:x"`, `"Ionicons:close"`).
- `size?: number` — pixel size. Forwarded to all variants.
- `color?: string` — color or `"currentColor"` (mapped per library — see §Color handling).
- `accessibilityLabel?: string` — forwarded to the rendered icon's `accessibilityLabel` (web `aria-label`).
- `style?: StyleProp<TextStyle | ViewStyle>` — forwarded.

The runtime `core/icons/icon-slot.tsx` exports a no-op fallback component so the source typechecks in `bun run typecheck:registry` and in editors. **Authors never import it into a consumer-shipped path — the transform always rewrites it.** A build-time assertion confirms no `IconSlot` survives into emitted registry files.

## Transform behavior

Given the source above, the per-library outputs are:

```tsx
// iconLibrary: "expo-vector-icons"
import Feather from "@expo/vector-icons/Feather"
// ...
<Feather name="x" size={16} color="currentColor" accessibilityLabel="Close" />

// iconLibrary: "lucide"
import { X } from "lucide-react-native"
// ...
<X size={16} color="currentColor" aria-label="Close" />
```

Transform steps (per file, per library variant):

1. Find `<IconSlot ...>` JSX elements.
2. Read the per-library prop (e.g., `lucide="X"`).
3. Build the canonical import for that library and add it (deduping if already present).
4. Replace the JSX with the library's call template (Component tag + correct prop names).
5. Remove the `IconSlot` import if no occurrences remain.
6. Fail the build if the prop for the targeted library is missing — every `IconSlot` must declare all supported libraries.

Implemented as a `ts-morph` pass inside `scripts/build-registry.ts`. The script emits one set of files per icon library, served under distinct registry URLs.

## Registry URL scheme

The shadcn registry resolves items by `name`. To select an icon variant, we append a query suffix or a sub-namespace:

```
public/v1/styles/unistyles/r/dialog.json                      # default = expo-vector-icons
public/v1/styles/unistyles/r/dialog.icon-lucide.json          # lucide variant
```

The Leshi CLI (or shadcn CLI when configured to point at our registry) reads `iconLibrary` from `components.json` and picks the right item URL. **For v1, default-only is acceptable**: ship `expo-vector-icons` as the only emitted variant and add `lucide` once the transformer lands.

## Color handling

- `@expo/vector-icons` font icons accept `color: string` directly (no `currentColor` support — `currentColor` is a CSS keyword). The transformer translates `color="currentColor"` to a resolution via `useUnistyles().theme.colors.foreground` at the consumer site, **or** the author passes an explicit theme token.
- `lucide-react-native` accepts `color: string` (any RN color). `"currentColor"` works on web only; on native we resolve at the call site.

Recommendation for component authors: prefer passing an explicit `color={theme.colors.<token>}` from the surrounding Unistyles block over relying on `"currentColor"`. The transform leaves theme-resolved colors alone.

## Manifest impact

Items that render icons add their icon library as an npm peer dep:

```json
{
  "dependencies": ["@expo/vector-icons"]
}
```

When the lucide variant lands, the variant manifest swaps the dep:

```json
{
  "dependencies": ["lucide-react-native", "react-native-svg"]
}
```

(`react-native-svg` is required by `lucide-react-native`.)

## What we don't ship

- **No icon registry items.** We don't republish lucide / Feather. Consumers install the upstream icon library themselves; the CLI tells them so during install.
- **No icon previewer.** Out of scope.
- **No runtime icon registry.** Reaffirming: there is no `IconProvider`, no `useIcon()`.

## Open questions

None at sign-off.
