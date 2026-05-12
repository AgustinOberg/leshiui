# Button — implementation spec

## Goal

A shadcn-perfect, accessible, theme-driven `Button` for React Native (iOS / Android / Web). Refactor of the current `registry-src/styles/unistyles/ui/button.tsx` to:

- Reach pixel-level parity with shadcn/ui v4 (New York) where it matters (variants, sizes, focus ring, hover, disabled).
- Adopt the `asChild` pattern via the shared `Slot` primitive (see `specs/primitives/slot/slot_implementation_spec.md`).
- Drop the current `Animated`-driven scale machinery (with its `as any` casts) in favour of `Pressable`'s built-in state-driven styling — instant feedback on press, no extra dependency.
- Keep the ergonomic conveniences that fit RN better than shadcn web (`loading` prop with `accessibilityState.busy`).
- Establish the canonical recipe future flavors (`stylesheet`, …) will copy.

## References

- shadcn docs: https://ui.shadcn.com/docs/components/button
- shadcn source (`new-york-v4`): https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/ui/button.tsx
- HeroUI Native button: https://heroui.com/docs/native/components/button — used as **mobile UX consultant only** (scale-on-press confirmed as good UX; nothing else borrowed).
- Current implementation: `registry-src/styles/unistyles/ui/button.tsx` (to be rewritten).
- Slot spec: `specs/primitives/slot/slot_implementation_spec.md`.

## Decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Variants | `default` · `destructive` · `outline` · `secondary` · `ghost` · `link` | shadcn parity (6). |
| Sizes | `default` · `xs` · `sm` · `lg` · `icon` · `icon-xs` · `icon-sm` · `icon-lg` (8) | shadcn v4 parity. |
| Heights (visual) | `xs` 24 · `sm` 32 · `default` 36 · `lg` 40 (px) | shadcn `h-6 / h-8 / h-9 / h-10`. |
| Icon sizes | `icon-xs` 24×24 · `icon-sm` 32×32 · `icon` 36×36 · `icon-lg` 40×40 | shadcn `size-6 / size-8 / size-9 / size-10`. |
| Horizontal padding | `xs` 8 · `sm` 12 · `default` 16 · `lg` 24 | shadcn `px-2 / px-3 / px-4 / px-6`. |
| Native tap target | Augmented via `hitSlop` so total touch area ≥ 44 px on iOS / Android | HIG / Material guidelines. Visual stays shadcn-perfect; `hitSlop` is invisible. |
| Border radius | `theme.radius.md` (matches `rounded-md`) | Tokens. |
| Font sizes | `xs` → `theme.typography.sizes.xs`, `sm` → `xs`, `default` → `sm`, `lg` → `md` | shadcn label scaling. |
| Default font weight | `theme.typography.weights.medium` (matches `font-medium`) | shadcn. |
| Press feedback (native) | `transform: scale(0.97)` + `opacity 0.95` while pressed, **instant** (no `Animated`) | UX preference (touch-tactile, HeroUI Native default). No animation = no `Animated` machinery, no `as any` casts. |
| Press feedback (web) | `opacity 0.9` while pressed, **no scale** | shadcn web doesn't scale. |
| Hover (web only) | Variant-specific hover bg (e.g. `default` → primary @ 90 %, `outline` → accent) | shadcn `hover:bg-…`. |
| Focus ring (web only) | 3 px solid `theme.colors.ring`, offset 2 px, visible only on keyboard focus | shadcn v4 `focus-visible:ring-[3px]`. |
| Disabled | `opacity 0.5` + `pointerEvents: none` (web) + `accessibilityState.disabled` | shadcn `disabled:opacity-50 disabled:pointer-events-none`. |
| Loading | New prop `loading?: boolean`. Renders `<ActivityIndicator>` inline (before text), disables interaction, sets `accessibilityState.busy: true`. Spinner colour matches the variant's text colour. | Pragmatic RN convenience. shadcn web expects manual composition, but `accessibilityState.busy` is RN-only and worth automating. |
| `asChild` | Boolean prop; when true, renders via shared `Slot` primitive instead of `Pressable` | shadcn signature. Enables `<Button asChild><Link href="/foo">Go</Link></Button>` with `expo-router`. |
| Auto text wrap | Only when `asChild = false`. String / number children get wrapped in `<Text style={label}>`. When `asChild = true`, children render verbatim. | Matches RN ergonomics without breaking `asChild`. |
| `data-*` attributes | `data-slot="button"`, `data-variant`, `data-size` on web only | shadcn parity (useful for E2E selectors + custom CSS overrides on web). Added via `Platform.OS === "web"` guarded spread. |
| Text colour per variant | tokens (`primaryForeground` / `destructiveForeground` / `foreground` / `secondaryForeground` / `foreground` / `primary` underlined for `link`) | shadcn parity. |
| `compoundVariants` | `link` → `paddingHorizontal: 0`; `outline + pressed` & `ghost + pressed` → `backgroundColor: accent`; `link + pressed` → `opacity: 0.7` | shadcn parity. |
| New tokens | None | All required tokens (`primary`, `destructive`, `accent`, `input`, `ring`, `secondary`, `secondaryForeground`, `primaryForeground`, `destructiveForeground`, `foreground`, `mutedForeground`) already exist in `core/tokens/shadcn-default.ts`. |
| Theme contract | Unchanged | No additions. |

## API

```ts
import type { PressableProps } from "react-native"
import type { StyleProp, TextStyle, ViewStyle } from "react-native"

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"

export type ButtonSize =
  | "default"
  | "xs"
  | "sm"
  | "lg"
  | "icon"
  | "icon-xs"
  | "icon-sm"
  | "icon-lg"

export type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  variant?: ButtonVariant   // default: "default"
  size?: ButtonSize         // default: "default"
  loading?: boolean         // default: false
  asChild?: boolean         // default: false
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

export const Button: React.ForwardRefExoticComponent<
  ButtonProps & React.RefAttributes<View>
>
```

## Variants & states matrix

| State | default | destructive | outline | secondary | ghost | link |
| --- | --- | --- | --- | --- | --- | --- |
| Resting bg | `colors.primary` | `colors.destructive` | `colors.background` (1 px border `colors.input`) | `colors.secondary` | transparent | transparent |
| Hover bg (web) | `colors.primary` @ 90 % | `colors.destructive` @ 90 % | `colors.accent` | `colors.secondary` @ 80 % | `colors.accent` | (underline only, via text) |
| Pressed (web) | opacity 0.9 | opacity 0.9 | bg `colors.accent` | opacity 0.9 | bg `colors.accent` | opacity 0.7 |
| Pressed (native) | + `scale(0.97)` + opacity 0.95 | same | same (no opacity bump) | same | same | same |
| Focus visible (web) | 3 px `colors.ring` ring offset 2 | same | same | same | same | same |
| Disabled | opacity 0.5 + `pointerEvents: none` (web) | same | same | same | same | same |
| Loading | opacity 0.7 + spinner + `busy: true` | same | same | same | same | same |
| Text colour | `primaryForeground` | `destructiveForeground` | `foreground` | `secondaryForeground` | `foreground` | `primary`, underlined |

Web-only states (`hover`, `focusVisible`) are gated by `Platform.OS === "web"` checks in the event handlers; on native those events never fire so the corresponding `useVariants` flags stay `undefined`.

## Internal layout

```
Pressable (or Slot when asChild)
├── ActivityIndicator (visible when loading, before text, marginRight 8 if hasText)
└── Text (only when children is string/number AND !asChild)
    | children (any ReactNode otherwise, passed through verbatim)
```

When `asChild = true`, the entire merged style + event handlers + accessibility props pass to the cloned child via `Slot`; the child renders alone (no auto-`Text`, no `ActivityIndicator` — caller is composing their own structure, and `loading` is ignored when `asChild` is true; emit a `__DEV__` console.warn if both are set).

## Implementation notes

- **No `Animated` / `Reanimated`.** Pressed scale on native is achieved via `Pressable`'s implicit re-render on `onPressIn` / `onPressOut` flipping a state boolean, fed into `styles.useVariants({ pressed })`, which emits the `transform: [{ scale: 0.97 }]` only on native. Instant — no spring needed.
- **No `as any` casts.** The current file has two (`passthroughAnimatedPropExplicitValues`, `transform` cast). Both go away when `Animated` is removed.
- **No `flatStyle` / `transform` merging.** We never touch the `style` prop's `transform`; the variant emits its own `transform`, RN composes the arrays naturally.
- **Hover on web.** `Pressable` on `react-native-web` fires `onHoverIn` / `onHoverOut`. Set a `hovered` boolean state, fed into a `hovered` variant flag (web-only).
- **`compoundVariants`** stay declarative inside `StyleSheet.create((theme) => ({ container: { variants: …, compoundVariants: […] } }))`.
- **`data-*` attributes** are appended via a `Platform.OS === "web"` conditional spread on the `Pressable` props.

## Primitives & dependencies

- **Registry deps**: `tokens`, `slot`.
- **npm deps added**: none.

## Platform splits

None at the file level. Web-only behaviour (hover, focus ring, `data-*`, opacity-only press) is gated inline via `Platform.OS === "web"` because the divergences are tiny and intertwined with shared state.

## a11y

- `accessibilityRole` defaults to `"button"`, overridable.
- `accessibilityState` = `{ disabled: isDisabled, busy: loading }`.
- `icon` / `icon-*` sizes: TSDoc reminds consumers to pass `accessibilityLabel`.
- Web: keyboard focus works natively via `Pressable` on web; focus ring renders only when `:focus-visible` (we track `focusVisible` state, set on `onFocus` only when `Platform.OS === "web"`).

## Playground demo

Update `apps/playgrounds/unistyles/src/app/components/button.tsx` with:

- **Variants** — one row, all 6.
- **Sizes** — two rows: text sizes (`xs / sm / default / lg`) + icon sizes (`icon-xs / icon-sm / icon / icon-lg`).
- **States** — enabled / disabled / loading (across multiple variants).
- **Hover & focus (web)** — instructions to hover & Tab through.
- **Press feedback** — long-press demo (note "native scales, web fades").
- **asChild** — `<Button asChild><Link href="/">Home</Link></Button>` showing it inherits Button styling. Use `expo-router` `Link`.

Also update `apps/playgrounds/unistyles/src/app/index.tsx` description if anything new is worth surfacing.

## Verification checklist (step 13)

- [ ] All 6 variants × 8 sizes render correctly at default theme.
- [ ] Hover changes bg only on web; not on native.
- [ ] Tab on web shows 3 px ring at offset 2.
- [ ] Pressed on native scales 0.97 + slight opacity dim; pressed on web fades to 0.9 (or accent bg for outline/ghost; opacity 0.7 for link).
- [ ] Disabled: 50 % opacity, no interaction.
- [ ] Loading: spinner appears, button blocks taps, `accessibilityState.busy` true.
- [ ] `asChild` clones into `Link`: navigates AND visually styled as button.
- [ ] Long string children wrap correctly.
- [ ] Icon-only renders square; `accessibilityLabel` warning surfaces in dev if missing (stretch goal — can be deferred).
- [ ] Console clean (no warnings, no errors).
- [ ] `bun run lint && bun run typecheck && bun run build:registry` all green.

## Anti-patterns we're removing

- `Animated.createAnimatedComponent(Pressable)` + `passthroughAnimatedPropExplicitValues` workaround.
- `as any` casts on press passthrough and transform.
- Manual `flatStyle.transform` extraction and re-concatenation.

## Open questions

None — ready for sign-off.

---

## Addendum 1 — Icon slots (`startContent` / `endContent`)

### Why a deviation from shadcn

shadcn handles icons by composition (`<Button>text <Icon /></Button>`) and Tailwind selectors (`[&_svg]:size-4`, `has-[>svg]:px-3`) to auto-size icons and shrink horizontal padding when an SVG child is present. **Those selectors don't exist in React Native**, so the shadcn-strict pattern would force consumers to (a) manually style their own `<Text>` to match the button label and (b) lose the auto-padding-shrink. HeroUI Native's `startContent` / `endContent` is the idiomatic RN alternative.

### Decisions

| Decision | Choice | Why |
| --- | --- | --- |
| API | `startContent?: ReactNode` + `endContent?: ReactNode` | HeroUI Native naming; well-known in RN ecosystem. |
| Loading interaction | Spinner replaces `startContent`; `endContent` stays visible | shadcn + HeroUI behaviour; preserves visual rhythm. |
| Padding shrink | New `hasAffix` boolean variant + 4 compound variants (`xs` 8→6, `sm` 12→10, `default` 16→12, `lg` 24→16) | shadcn `has-[>svg]:px-*` parity. |
| Icon sizing | Consumer's responsibility (icons are arbitrary `ReactNode`) | We don't wrap icons in a sizer. TSDoc recommends 16 px (12 px on `xs`). Trying to auto-size would couple Button to a specific icon library. |
| Icon coloring | Consumer's responsibility | Same reason as sizing. Demo passes `theme.colors.primaryForeground` etc. by hand. A future helper hook (`useButtonForeground(variant)`) could expose the right color if this becomes painful. |
| `asChild` interaction | `startContent` / `endContent` are **ignored** when `asChild = true` | The caller composes their own structure. `__DEV__` warning if both are set. |

### Render order

```
[ spinner | startContent ]  →  [ text or children ]  →  [ endContent ]
```

When `loading = true`, the first slot becomes the spinner regardless of whether `startContent` was set.

### Tokens / deps

None added. All existing.

### Updated playground demo

Three new sections under `apps/playgrounds/unistyles/src/app/components/button.tsx`:

- **Icons (startContent / endContent)** — common cases (mail, arrow-right, trash + chevron, download).
- **Icons + sizes** — same icon across `xs / sm / default / lg` to show padding shrink.
- **Loading + endContent** — confirms the spinner-replaces-start behaviour and the persistent end content.

