# Dialog — implementation spec

## Goal

A shadcn-perfect, accessible, theme-driven `Dialog` for React Native (iOS / Android / Web). Thin Unistyles wrapper over `@rn-primitives/dialog` that ports the **10-part shadcn v4 surface** verbatim: composable parts, controllable state via `open` / `onOpenChange`, focus trap + scroll lock on web (free from Radix), `accessibilityViewIsModal` + `BackHandler` on native, fade + zoom animation on open/close, and a built-in close button driven by Leshi UI's icon system.

Establishes the canonical recipe for every Tier 2+ overlay component (AlertDialog, Popover, Sheet, Drawer, Select, …): **`@rn-primitives` does the behavior, we paint it.**

## References

- shadcn docs: https://ui.shadcn.com/docs/components/dialog
- shadcn source (`new-york-v4`): https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/dialog.tsx
- HeroUI Modal (mobile UX consultant): https://www.heroui.com/docs/components/modal — confirms centered modal as the default mobile pattern (no swipe-to-dismiss; that's `Drawer`/`Sheet` territory).
- Primitive layer: `specs/architecture/primitive-layer.md`.
- Icon system: `specs/architecture/icon-system.md`.
- `@rn-primitives/dialog` source: https://github.com/roninoss/rn-primitives/tree/main/packages/dialog
- Reanimated v3 entering/exiting: https://docs.swmansion.com/react-native-reanimated/docs/layout-animations/entering-exiting-animations

## Decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Visual baseline | shadcn `new-york-v4` | Industry standard. |
| Primitive layer | `@rn-primitives/dialog` + `@rn-primitives/portal` | See `primitive-layer.md`. |
| Composition | Compound (10 parts): `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogClose`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` | shadcn v4 parity (every export). |
| State control | `open` / `defaultOpen` / `onOpenChange` on root | Delegated to `@rn-primitives/dialog`. |
| Modal/non-modal | `modal?: boolean` (default `true`) on root | shadcn / Radix parity. Forwarded to the primitive. |
| `size` variant | **None** (deviation removed) | shadcn doesn't have one. The archive added `sm/lg/fullscreen` without a shadcn analogue. Consumers override `style` instead. Sheet/Drawer cover the bottom-anchored cases. |
| `showCloseButton` on `DialogContent` | `boolean`, default `true` | shadcn v4 parity. Renders an absolute-positioned X via `<IconSlot lucide="X" expoVectorIcons="Feather:x" size={16} />` in the top-right. |
| `overlayProps` on `DialogContent` | Optional `DialogOverlayProps` pass-through to the auto-mounted overlay | **Deviation from shadcn (justified).** shadcn assumes the consumer composes `<DialogPortal><DialogOverlay /><DialogContent />` manually when they need overlay control; our `DialogContent` auto-mounts the overlay (same shape as shadcn's `DialogContent`), so a native-only knob like `closeOnPress` would be unreachable. `overlayProps` is the minimum surface that keeps the auto-mount ergonomic AND lets consumers disable native overlay dismiss (`overlayProps={{ closeOnPress: false }}`). On web, the equivalent is `onInteractOutside={(e) => e.preventDefault()}` directly on `DialogContent` — Radix dispatches the dismiss event there, not on the overlay. |
| `showCloseButton` on `DialogFooter` | `boolean`, default `false` | shadcn v4 parity. Renders `<DialogClose asChild><Button variant="outline">Close</Button></DialogClose>`. |
| Animations | Reanimated v3 `FadeIn(200) / FadeOut(150)` on overlay; Reanimated `Keyframe` on content — scale `0.96 → 1` opacity `0 → 1` with `Easing.out(Easing.ease)` on enter (200ms), reversed with `Easing.in(Easing.ease)` on exit (150ms) | Matches HeroUI Native's dialog exactly (`heroui-inc/heroui-native` → `src/helpers/internal/hooks/use-popup-dialog-content-animation.ts`). The user signed off on HeroUI's curve over the shadcn `zoom-in-95` spring approximation; the visual is "snappier and smaller" than a springified ZoomIn. shadcn web uses tailwind `animate-in fade-in-0 zoom-in-95` + `data-[state=closed]:animate-out`; the HeroUI Keyframe is the cross-platform equivalent. |
| Overlay color | Hardcoded `rgba(0, 0, 0, 0.5)` | Matches shadcn `bg-black/50`. shadcn doesn't tokenize this; we don't either. |
| Centered content | `position: absolute, top: 50%, left: 50%, transform: translate(-50%, -50%)` (web) / centered flex container (native) | shadcn web uses translate; on native we use flex (no transform percentages on native). Behavior identical. |
| Width sizing | `width: 100%, maxWidth: Math.min(screenWidth - 32, 512)` | shadcn `w-full max-w-[calc(100%-2rem)] sm:max-w-lg`. We read `rt.screen.width` from Unistyles runtime once per render. |
| Padding | `theme.spacing[6]` (24px) | shadcn `p-6`. |
| Radius | `theme.radius.lg` (12px) | shadcn `rounded-lg`. |
| Border | `1px solid theme.colors.border` | shadcn `border`. |
| Background | `theme.colors.background` | shadcn `bg-background`. |
| Shadow | `shadowColor: theme.colors.foreground`, `shadowOpacity: 0.15`, `shadowRadius: 10`, `elevation: 4` | shadcn `shadow-lg` analogue (RN doesn't ship Tailwind's exact stack). |
| Title style | `fontSize: theme.typography.sizes.lg` (18), `lineHeight: 18` (i.e. `leading-none`), `fontWeight: theme.typography.weights.semibold` | shadcn `text-lg leading-none font-semibold`. Note: `lineHeight === fontSize` produces `leading-none`. |
| Description style | `fontSize: theme.typography.sizes.sm` (14), `color: theme.colors.mutedForeground`, `lineHeight: theme.typography.lineHeights.md` (24) | shadcn `text-sm text-muted-foreground`. |
| `DialogHeader` layout | `flexDirection: 'column', gap: theme.spacing[2]`, text-align center on compact / left on wide | shadcn `flex flex-col gap-2 text-center sm:text-left`. Compact = `rt.screen.width < 640`. |
| `DialogFooter` layout | Compact: `flexDirection: 'column-reverse', gap: theme.spacing[2]`; Wide: `flexDirection: 'row', justifyContent: 'flex-end', gap: theme.spacing[2]` | shadcn `flex flex-col-reverse gap-2 sm:flex-row sm:justify-end`. Same compact rule. |
| Close button position | Absolute top-right, `top: theme.spacing[4]`, `right: theme.spacing[4]`, size `16` | shadcn `absolute top-4 right-4` with `size-4` icon. |
| Close button states | `opacity: 0.7` default; web `:hover` → `opacity: 1`; focus ring (web) via `outlineStyle/outlineWidth/outlineColor: theme.colors.ring` | shadcn `opacity-70 hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2`. |
| Data attributes (web) | `dataSet: { slot: "dialog" }` etc. on every part | shadcn `data-slot="dialog-*"` for E2E selectors. |
| `accessibilityViewIsModal` | `true` on native `DialogContent` when `modal === true` | RN's modal containment for screen readers. Already wired by `@rn-primitives` but reasserted. |
| Title/description IDs | Generated via `useId()` and wired to `aria-labelledby` / `aria-describedby` on content | `@rn-primitives/dialog` plumbs this automatically. Authors get a11y for free if they include `DialogTitle` + `DialogDescription`. |

## API

```ts
import type { ComponentProps, ComponentRef, ReactNode } from "react"
import type { StyleProp, TextStyle, ViewStyle } from "react-native"
import type * as DialogPrimitive from "@rn-primitives/dialog"

export type DialogProps = ComponentProps<typeof DialogPrimitive.Root>
export const Dialog: (props: DialogProps) => JSX.Element

export type DialogTriggerProps = ComponentProps<typeof DialogPrimitive.Trigger>
export const DialogTrigger: React.ForwardRefExoticComponent<DialogTriggerProps>

export type DialogPortalProps = ComponentProps<typeof DialogPrimitive.Portal>
export const DialogPortal: (props: DialogPortalProps) => JSX.Element

export type DialogOverlayProps = ComponentProps<typeof DialogPrimitive.Overlay> & {
  style?: StyleProp<ViewStyle>
}
export const DialogOverlay: React.ForwardRefExoticComponent<DialogOverlayProps>

export type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  /** @default true */
  showCloseButton?: boolean
  style?: StyleProp<ViewStyle>
  children?: ReactNode
  /** Pass-through props for the auto-mounted overlay (RN deviation — see decisions table). */
  overlayProps?: DialogOverlayProps
}
export const DialogContent: React.ForwardRefExoticComponent<DialogContentProps>

export type DialogCloseProps = ComponentProps<typeof DialogPrimitive.Close>
export const DialogClose: React.ForwardRefExoticComponent<DialogCloseProps>

export type DialogHeaderProps = {
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}
export const DialogHeader: (props: DialogHeaderProps) => JSX.Element

export type DialogFooterProps = {
  /** @default false */
  showCloseButton?: boolean
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}
export const DialogFooter: (props: DialogFooterProps) => JSX.Element

export type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title> & {
  style?: StyleProp<TextStyle>
}
export const DialogTitle: React.ForwardRefExoticComponent<DialogTitleProps>

export type DialogDescriptionProps = ComponentProps<typeof DialogPrimitive.Description> & {
  style?: StyleProp<TextStyle>
}
export const DialogDescription: React.ForwardRefExoticComponent<DialogDescriptionProps>
```

## States

| Part | State | Visual |
| --- | --- | --- |
| Overlay | open | fades in (200ms) over `rgba(0,0,0,0.5)`. |
| Overlay | closed | fades out (200ms). |
| Content | open | fades in + scales 0.95 → 1.0 (200ms). |
| Content | closed | fades out + scales 1.0 → 0.95 (200ms). |
| Close button | default | `opacity 0.7`. |
| Close button | hover (web) | `opacity 1`. |
| Close button | focus-visible (web) | 2px solid ring `theme.colors.ring`, offset 2px. |
| Close button | disabled | `pointerEvents: 'none'` (web) + `accessibilityState.disabled`. |

## Theme contract changes

**None.** Every visual constant maps to an existing token in `core/tokens/shadcn-default.ts`. The overlay `rgba(0,0,0,0.5)` is intentionally untokenized to mirror shadcn's untokenized `bg-black/50`.

## Primitives & dependencies

- **Registry deps** (`registryDependencies`): `tokens`.
- **npm peer deps** (`dependencies`):
  - `@rn-primitives/dialog` — primitive layer.
  - `@rn-primitives/portal` — explicit (transitive but exposed so the consumer's `package.json` is honest).
  - `react-native-reanimated@^3` — animations.
  - `@expo/vector-icons` (default variant) **or** `lucide-react-native` + `react-native-svg` (lucide variant).

The consumer must also mount `<PortalHost />` (from `@rn-primitives/portal`) once high in their app tree. We document this in the registry item description and in the playground README, mirroring how Radix consumers mount `<Portal>` at the app root.

## Platform splits

**None at the Leshi UI layer.** `@rn-primitives/dialog` already ships `dialog.web.tsx` (Radix-wrapped) and `dialog.tsx` (native hand-roll). Our Unistyles wrapper is a single `.tsx` that imports from `@rn-primitives/dialog`; Metro/RN resolves the right variant per platform.

The one platform conditional we keep in our file: focus-visible ring styles only emitted under `Platform.OS === "web"`, because RN native ignores `outline*` keys and an `outlineColor: theme.colors.ring` value at native runtime is dead weight.

## a11y

Delegated to `@rn-primitives/dialog`. Verified contract:

- **Web (via Radix):** `role="dialog"`, `aria-modal="true"` when modal, focus trap, return-focus on close, `aria-labelledby` ← `DialogTitle` id, `aria-describedby` ← `DialogDescription` id, ESC dismisses, click-outside dismisses (unless `modal && !onPointerDownOutside.preventDefault`).
- **Native:** `accessibilityViewIsModal={true}` on content, Android `BackHandler` dismisses, `nativeID` plumbed to title/description for screen readers. No focus trap on native (RN limitation; acceptable for v1 — most native apps rely on modal containment via `accessibilityViewIsModal`).
- **Authoring guideline:** every `DialogContent` should contain a `DialogTitle` (visually visible or wrapped in a visually-hidden `<View>` if the design doesn't need a header). The primitive logs a dev-time warning if missing.

## Animations

Authoring approach (in `dialog.tsx`):

```tsx
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  Keyframe,
} from "react-native-reanimated"

const AnimatedOverlay = Animated.createAnimatedComponent(DialogPrimitive.Overlay)
const AnimatedContent = Animated.createAnimatedComponent(DialogPrimitive.Content)

const CONTENT_ENTERING = new Keyframe({
  0:   { transform: [{ scale: 0.96 }], opacity: 0 },
  100: { transform: [{ scale: 1 }],    opacity: 1, easing: Easing.out(Easing.ease) },
}).duration(200)

const CONTENT_EXITING = new Keyframe({
  0:   { transform: [{ scale: 1 }],    opacity: 1 },
  100: { transform: [{ scale: 0.96 }], opacity: 0, easing: Easing.in(Easing.ease) },
}).duration(150)

// inside DialogContent:
<AnimatedOverlay entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} ... />
<AnimatedContent entering={CONTENT_ENTERING} exiting={CONTENT_EXITING} ... />
```

- The keyframes are a verbatim port of HeroUI Native (`src/helpers/internal/hooks/use-popup-dialog-content-animation.ts`, `DEFAULT_ENTERING_ANIMATION` / `DEFAULT_EXITING_ANIMATION`). HeroUI's `usePopupDialogContentAnimation` also implements progress-driven drag-to-dismiss; that piece is **out of scope for the initial Dialog port** (it belongs to a Sheet/BottomSheet primitive). The visual aspect — scale 0.96 → 1 with eased fade — is what we copy.
- We use Reanimated `entering` / `exiting` layout animations (not `useSharedValue`) because they run on the UI thread, support exit choreography out of the box, and don't require us to manage mounted state — Reanimated keeps the node mounted through the exit animation automatically.
- On web, Reanimated v3 ships a web build that interops with `react-native-web`. Verified compatible with our Expo Router playgrounds.
- We **do not** use `LayoutAnimation` (legacy, buggy on web) or the stock `Animated` API (no built-in `exiting` lifecycle, would need manual orchestration).
- We **do not** use `ZoomIn.springify()` / `ZoomOut`. They were proposed in an earlier revision but rejected — a springified ZoomIn produces a bouncier "pop" than HeroUI's clean eased keyframe and was visibly heavier in playground testing.

## Responsive sizing

Read from Unistyles runtime once per render:

```tsx
const { rt } = useUnistyles()
const isCompact = rt.screen.width < 640
const maxWidth = Math.min(rt.screen.width - 32, 512)
```

Drives:

- `DialogContent.style.maxWidth` (always).
- `DialogHeader.style.textAlign` → `"center"` when compact else `"left"`.
- `DialogFooter.style.flexDirection` → `"column-reverse"` when compact else `"row"`.

This is the canonical recipe for shadcn `sm:` breakpoint behavior in Leshi UI until we ship a real breakpoint primitive in `core/`.

## Playground demo

`apps/playgrounds/unistyles/src/app/components/dialog.tsx` renders the following sections:

- **Default** — `DialogTrigger` → `DialogContent` with `DialogHeader` (Title + Description) + `DialogFooter` with default + cancel buttons. Default `showCloseButton: true` shows the X.
- **No close button** — `<DialogContent showCloseButton={false}>` to verify the deviation works.
- **Long content** — verify scroll inside content + overlay covers correctly. Includes a `ScrollView`.
- **Controlled** — external state via `useState` + `open` / `onOpenChange`.
- **Non-modal** — `<Dialog modal={false}>` to verify background is interactive.
- **Footer with showCloseButton** — `<DialogFooter showCloseButton>` to verify the auto-rendered Close button.
- **Edge: missing DialogTitle** — verify the dev warning fires.
- **Dark theme** — toggle via `UnistylesRuntime.setTheme("dark")`, screenshot side-by-side with light.

## Manifest

```json
{
  "name": "dialog",
  "type": "registry:ui",
  "title": "Dialog",
  "description": "A modal dialog with portal, focus trap (web), scroll lock (web), fade + zoom animation, and a built-in close button.",
  "registryDependencies": ["tokens"],
  "dependencies": [
    "@rn-primitives/dialog",
    "@rn-primitives/portal",
    "react-native-reanimated",
    "@expo/vector-icons"
  ],
  "files": [
    {
      "source": "ui/dialog.tsx",
      "path": "components/ui/dialog.tsx",
      "type": "registry:ui"
    }
  ]
}
```

## Prerequisites & sequencing

This spec depends on two prior architectural specs being signed off **first**:

1. `specs/architecture/primitive-layer.md` — adopt `@rn-primitives`, migrate Slot/Button, manifest convention for npm peers.
2. `specs/architecture/icon-system.md` — `<IconSlot>` placeholder + ts-morph transform (only the **default `expo-vector-icons` variant** is strictly required to ship Dialog; the lucide variant can land in a follow-up).

If we choose to ship Dialog **before** the full icon transform exists, the v1 of Dialog hardcodes `<Feather name="x" size={16} />` directly. The migration to `<IconSlot>` is a 1-line rewrite per occurrence and the transform fills in the rest.

## Open questions

None at sign-off.
