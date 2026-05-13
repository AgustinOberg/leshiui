import { Feather } from "@expo/vector-icons"
import * as DialogPrimitive from "@rn-primitives/dialog"
import type { ComponentProps, ReactNode } from "react"
import { forwardRef, useMemo, useState } from "react"
import {
  Platform,
  Pressable,
  type StyleProp,
  Text,
  type TextStyle,
  View,
  type ViewStyle,
} from "react-native"
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  Keyframe,
} from "react-native-reanimated"
import { useUnistyles } from "react-native-unistyles"

const SM_BREAKPOINT = 640
const MAX_CONTENT_WIDTH = 512
const CONTENT_GUTTER = 32
const CLOSE_ICON_SIZE = 16
const OVERLAY_ENTER_MS = 200
const OVERLAY_EXIT_MS = 150
const CONTENT_ENTER_MS = 200
const CONTENT_EXIT_MS = 150

const AnimatedOverlayPrimitive = Animated.createAnimatedComponent(
  DialogPrimitive.Overlay,
)
const AnimatedContentPrimitive = Animated.createAnimatedComponent(
  DialogPrimitive.Content,
)

// Mirrors HeroUI Native's dialog content keyframes (subtle scale 0.96 → 1
// with eased fade). Source: heroui-inc/heroui-native
// src/helpers/internal/hooks/use-popup-dialog-content-animation.ts
const CONTENT_ENTERING = new Keyframe({
  0: { transform: [{ scale: 0.96 }], opacity: 0 },
  100: {
    transform: [{ scale: 1 }],
    opacity: 1,
    easing: Easing.out(Easing.ease),
  },
}).duration(CONTENT_ENTER_MS)

const CONTENT_EXITING = new Keyframe({
  0: { transform: [{ scale: 1 }], opacity: 1 },
  100: {
    transform: [{ scale: 0.96 }],
    opacity: 0,
    easing: Easing.in(Easing.ease),
  },
}).duration(CONTENT_EXIT_MS)

/**
 * Modal dialog mirroring shadcn/ui v4. Thin Unistyles wrapper over
 * `@rn-primitives/dialog`: web variant delegates to Radix (focus trap, scroll
 * lock, ESC, return-focus); native variant ships `accessibilityViewIsModal` +
 * Android `BackHandler`.
 *
 * Styles are computed inline from `useUnistyles().theme` (not via
 * `StyleSheet.create`). Reason: Radix on web bypasses React Native Web's
 * style processor, and Unistyles' compiled style objects don't flatten into
 * the plain CSS shape Radix forwards to react-dom — passing them through
 * silently drops styling. Plain object literals work.
 *
 * Open/close transitions match HeroUI Native's dialog (see
 * `use-popup-dialog-content-animation.ts` in heroui-inc/heroui-native):
 * `FadeIn(200) / FadeOut(150)` on the overlay; a `Keyframe` on the content
 * that scales `0.96 → 1` with `Easing.out(Easing.ease)` on enter and
 * `1 → 0.96` with `Easing.in(Easing.ease)` on exit. Spring/zoom presets
 * were considered and rejected — Keyframe is the visual the user signed off.
 *
 * Overlay and centered wrapper use `position: "fixed"` on web so the modal
 * stays viewport-locked even when the page underneath is scrolled; native
 * keeps `position: "absolute"` because the portal is already root-mounted.
 *
 * @example
 * <Dialog>
 *   <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Title</DialogTitle>
 *       <DialogDescription>Description</DialogDescription>
 *     </DialogHeader>
 *     <DialogFooter showCloseButton />
 *   </DialogContent>
 * </Dialog>
 *
 * See `specs/components/dialog/dialog_implementation_spec.md`.
 */
export const Dialog = DialogPrimitive.Root
export const DialogTrigger = DialogPrimitive.Trigger
export const DialogPortal = DialogPrimitive.Portal
export const DialogClose = DialogPrimitive.Close

function mergeStyle<T extends object>(
  base: T,
  override: StyleProp<T> | undefined,
): T {
  if (override == null) return base
  if (Array.isArray(override)) {
    return Object.assign(
      {},
      base,
      ...override.filter((s) => s != null && s !== false),
    )
  }
  return Object.assign({}, base, override)
}

export type DialogOverlayProps = ComponentProps<
  typeof DialogPrimitive.Overlay
> & {
  style?: StyleProp<ViewStyle>
}

export const DialogOverlay = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(function DialogOverlay({ style, ...props }, ref) {
  const overlayStyle = useMemo<ViewStyle>(
    () => ({
      // Web uses `fixed` so the overlay tracks the viewport when the page
      // scrolls; native uses `absolute` inside the portal (root-mounted, so
      // already viewport-sized).
      position:
        Platform.OS === "web" ? ("fixed" as ViewStyle["position"]) : "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    }),
    [],
  )
  return (
    <AnimatedOverlayPrimitive
      ref={ref}
      entering={FadeIn.duration(OVERLAY_ENTER_MS)}
      exiting={FadeOut.duration(OVERLAY_EXIT_MS)}
      style={mergeStyle(overlayStyle, style)}
      {...props}
    />
  )
})

export type DialogContentProps = ComponentProps<
  typeof DialogPrimitive.Content
> & {
  /** @default true */
  showCloseButton?: boolean
  style?: StyleProp<ViewStyle>
  children?: ReactNode
  /**
   * Pass-through props for the auto-mounted overlay. Exists specifically to
   * surface native-only knobs (e.g. `closeOnPress`) that can't be reached via
   * `Content` events. On web, prefer `onInteractOutside` /
   * `onPointerDownOutside` on this component to intercept the dismiss.
   */
  overlayProps?: DialogOverlayProps
}

export const DialogContent = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(function DialogContent(
  { children, style, showCloseButton = true, overlayProps, ...props },
  ref,
) {
  const { rt, theme } = useUnistyles()
  const maxWidth = Math.min(rt.screen.width - CONTENT_GUTTER, MAX_CONTENT_WIDTH)
  const maxHeight = rt.screen.height - CONTENT_GUTTER

  const centerWrapperStyle = useMemo<ViewStyle>(
    () => ({
      // Same `fixed` rationale as the overlay: stay glued to the viewport on
      // web regardless of underlying page scroll.
      position:
        Platform.OS === "web" ? ("fixed" as ViewStyle["position"]) : "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }),
    [],
  )

  const contentStyle = useMemo<ViewStyle>(
    () => ({
      position: "relative",
      width: "100%",
      maxWidth,
      maxHeight,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing[6],
      gap: theme.spacing[4],
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
      ...(Platform.OS === "web" ? { outlineWidth: 0 } : null),
    }),
    [maxWidth, maxHeight, theme],
  )

  return (
    <DialogPortal>
      <DialogOverlay {...overlayProps} />
      <View
        style={centerWrapperStyle}
        // pointerEvents handled via style on RN 0.83+; older RN allows prop.
        // We keep it as a prop for broader compat (deprecation warning only).
        pointerEvents="box-none"
      >
        <AnimatedContentPrimitive
          ref={ref}
          entering={CONTENT_ENTERING}
          exiting={CONTENT_EXITING}
          style={mergeStyle(contentStyle, style)}
          {...props}
        >
          {children}
          {showCloseButton ? (
            <DialogContentCloseButton
              color={theme.colors.foreground}
              ringColor={theme.colors.ring}
            />
          ) : null}
        </AnimatedContentPrimitive>
      </View>
    </DialogPortal>
  )
})

function DialogContentCloseButton({
  color,
  ringColor,
}: {
  color: string
  ringColor: string
}) {
  const [focusVisible, setFocusVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  const buttonStyle: ViewStyle = {
    position: "absolute",
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 2,
    opacity: hovered ? 1 : 0.7,
    ...(focusVisible && Platform.OS === "web"
      ? {
          outlineStyle: "solid",
          outlineWidth: 2,
          outlineColor: ringColor,
          outlineOffset: 2,
        }
      : null),
  }

  return (
    <DialogPrimitive.Close asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onFocus={() => Platform.OS === "web" && setFocusVisible(true)}
        onBlur={() => Platform.OS === "web" && setFocusVisible(false)}
        onHoverIn={() => Platform.OS === "web" && setHovered(true)}
        onHoverOut={() => Platform.OS === "web" && setHovered(false)}
        style={buttonStyle}
      >
        <Feather name="x" size={CLOSE_ICON_SIZE} color={color} />
      </Pressable>
    </DialogPrimitive.Close>
  )
}

export type DialogHeaderProps = {
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}

export function DialogHeader({ style, children }: DialogHeaderProps) {
  const { rt } = useUnistyles()
  const isCompact = rt.screen.width < SM_BREAKPOINT

  return (
    <View
      style={[
        {
          flexDirection: "column",
          gap: 8,
          alignItems: isCompact ? "center" : "flex-start",
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

export type DialogFooterProps = {
  /** @default false */
  showCloseButton?: boolean
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}

export function DialogFooter({
  style,
  children,
  showCloseButton = false,
}: DialogFooterProps) {
  const { rt } = useUnistyles()
  const isCompact = rt.screen.width < SM_BREAKPOINT

  return (
    <View
      style={[
        {
          gap: 8,
          flexDirection: isCompact ? "column-reverse" : "row",
          justifyContent: isCompact ? "flex-start" : "flex-end",
          alignItems: "stretch",
        },
        style,
      ]}
    >
      {children}
      {showCloseButton ? <DialogFooterCloseButton /> : null}
    </View>
  )
}

function DialogFooterCloseButton() {
  const { theme } = useUnistyles()
  return (
    <DialogPrimitive.Close asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={{
          paddingHorizontal: theme.spacing[4],
          paddingVertical: theme.spacing[2],
          borderRadius: theme.radius.md,
          borderWidth: 1,
          borderColor: theme.colors.input,
          backgroundColor: theme.colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontFamily: theme.typography.families.sans,
            fontSize: theme.typography.sizes.sm,
            lineHeight: theme.typography.lineHeights.sm,
            fontWeight: theme.typography.weights.medium,
            color: theme.colors.foreground,
          }}
        >
          Close
        </Text>
      </Pressable>
    </DialogPrimitive.Close>
  )
}

export type DialogTitleProps = ComponentProps<typeof DialogPrimitive.Title> & {
  style?: StyleProp<TextStyle>
}

export const DialogTitle = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(function DialogTitle({ style, ...props }, ref) {
  const { theme } = useUnistyles()
  const titleStyle: TextStyle = {
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.lg,
    lineHeight: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.foreground,
  }
  return (
    <DialogPrimitive.Title
      ref={ref}
      style={mergeStyle(titleStyle, style)}
      {...props}
    />
  )
})

export type DialogDescriptionProps = ComponentProps<
  typeof DialogPrimitive.Description
> & {
  style?: StyleProp<TextStyle>
}

export const DialogDescription = forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  DialogDescriptionProps
>(function DialogDescription({ style, ...props }, ref) {
  const { theme } = useUnistyles()
  const descStyle: TextStyle = {
    fontFamily: theme.typography.families.sans,
    fontSize: theme.typography.sizes.sm,
    lineHeight: theme.typography.lineHeights.md,
    color: theme.colors.mutedForeground,
  }
  return (
    <DialogPrimitive.Description
      ref={ref}
      style={mergeStyle(descStyle, style)}
      {...props}
    />
  )
})
