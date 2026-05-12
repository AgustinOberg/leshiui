# Slot — implementation spec

## Goal

A flavor-agnostic, dependency-free `Slot` primitive that enables the **`asChild` pattern** across every Leshi UI component. Mirrors Radix UI's `<Slot>` (web) and the rn-primitives port (RN), adapted to our conventions: single file, no path aliases, no npm deps, no `className` (we don't ship Tailwind).

`Slot` is the foundation for `<Button asChild><Link>…</Link></Button>` and any future component that wants to "be" its child while keeping the component's styling/behaviour.

## References

- Radix Slot (web): https://www.radix-ui.com/primitives/docs/utilities/slot
- rn-primitives Slot: https://github.com/roninoss/rn-primitives/tree/main/packages/slot — main reference. Source: `packages/slot/src/slot.tsx`.

## Decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Location | `registry-src/core/primitives/slot/slot.tsx` | Flavor-agnostic. Bootstraps `core/primitives/`. |
| Install path | `lib/primitives/slot.tsx` | Mirrors token install convention (`lib/tokens/…`). |
| API surface | Single generic `Slot` component | Drop rn-primitives' deprecated `Slot.Pressable` / `Slot.View` / `Slot.Text` / `Slot.Image` variants — generic suffices and matches Radix's current API. |
| `className` handling | Omitted | We don't ship Tailwind. Can be added later if a CSS-based flavor needs it. |
| Fragment children | Supported (recursive) | Same as rn-primitives — if child is `<>…</>`, recurse over its children. |
| Text-only children | Rejected (console warn + render `null`) | Cloning a string is invalid; same guard as rn-primitives. |
| Ref composition | `composeRefs` callback-ref pattern with cleanup | React 19 cleanup callbacks supported. |
| Style merging | Function-aware (`PressableStateCallbackType` aware) | Pressable's `style` can be a function `(state) => StyleProp`. We must merge two functions, one function + one static, or two statics. |
| Event handler merging | `child` runs first, then `slot` | rn-primitives convention — child's handler wins on stopPropagation-style scenarios, slot still observes. |
| Other prop merging | Child overrides | Standard Radix behaviour: child's explicit props win over slot's defaults. |
| Platform splits | None | Cross-platform pure React, no DOM-only globals. Same file for iOS / Android / Web. |
| New tokens | None | No styling. |
| npm deps | None | React + RN peer deps only. |

## API

```ts
import * as React from "react"

export type SlotProps<T extends React.ElementType> =
  React.ComponentPropsWithRef<T> & {
    children: React.ReactNode
  }

export const Slot: <T extends React.ElementType>(
  props: SlotProps<T>
) => React.ReactElement | null
```

Usage:

```tsx
function Button({ asChild, children, ...props }: ButtonProps) {
  const Comp: React.ElementType = asChild ? Slot : Pressable
  return <Comp {...props}>{children}</Comp>
}

// Consumer:
<Button asChild>
  <Link href="/foo">Go</Link>
</Button>
```

## Implementation outline

Single file `slot.tsx` exporting:

- `Slot` — main component.
- (internal) `mergeProps` — merges slot + child props.
  - Event handlers (`/^on[A-Z]/`) → composed (child first, slot second).
  - `style` → `combineStyles` (function-aware).
  - Everything else → child overrides slot.
- (internal) `combineStyles` — handles function / static permutations.
- (internal) `composeRefs<T>` — callback ref distributor with cleanup.
- (internal) `setRef<T>` — sets a single ref (function or object), returns cleanup.
- (internal) `isTextChildren` — guard.

Flow inside `Slot`:

1. Destructure `{ children, ref: forwardedRef, ...slotProps }`.
2. If `!React.isValidElement(children)` → console.warn + `return null`.
3. If `isTextChildren(children)` → console.warn + `return null`.
4. If `children.type === React.Fragment` → recurse over `children.props.children`.
5. Otherwise `React.cloneElement(children, { ...mergeProps(slotProps, childProps), ref: composeRefs(forwardedRef, childRef) })`.

Tests (Node `node:test` headless): merge precedence, ref composition, event composition, fragment recursion, text-rejection guard. Pure logic — no renderer needed.

## a11y

`Slot` itself is invisible. Accessibility props pass through via `mergeProps` (child wins on explicit role/label, slot fills defaults).

## Anti-patterns

- ❌ Adding `className` merging "just in case".
- ❌ Re-exporting deprecated `Slot.Pressable` / `Slot.View` / `Slot.Text` / `Slot.Image` aliases.
- ❌ Using `any` outside the documented `AnyProps = Record<string, unknown>` internal type.
- ❌ Mutating `children.props` instead of cloning.

## Registry manifest

`registry-src/styles/<flavor>/items/slot.manifest.json`:

```json
{
  "name": "slot",
  "type": "registry:lib",
  "title": "Slot",
  "description": "asChild primitive — clones a single child and merges props, refs, styles, and event handlers.",
  "files": [
    {
      "source": "core:primitives/slot/slot.tsx",
      "path": "lib/primitives/slot.tsx",
      "type": "registry:lib"
    }
  ]
}
```

(Identical for every flavor — `unistyles`, future `stylesheet`, etc., since the file is flavor-agnostic and sourced from `core:`.)

## Open questions

None — sign off and implement.
