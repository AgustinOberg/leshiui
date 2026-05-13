import { Slot } from "@rn-primitives/slot"
import type * as React from "react"
import { forwardRef, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  Text,
  type TextStyle,
  type View,
  type ViewStyle,
} from "react-native"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

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
  /** @default "default" */
  variant?: ButtonVariant
  /** @default "default" */
  size?: ButtonSize
  /** @default false */
  loading?: boolean
  /** @default false */
  asChild?: boolean
  startContent?: React.ReactNode
  endContent?: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  children?: React.ReactNode
}

const DEFAULT_VARIANT: ButtonVariant = "default"
const DEFAULT_SIZE: ButtonSize = "default"

const styles = StyleSheet.create((theme) => {
  const focusRingStyle =
    Platform.OS === "web"
      ? ({
          outlineStyle: "solid",
          outlineWidth: 3,
          outlineColor: theme.colors.ring,
          outlineOffset: 2,
        } as const)
      : {}

  return {
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: "transparent",
      backgroundColor: theme.colors.primary,
      height: 36,
      paddingHorizontal: 16,
      gap: 8,
      variants: {
        variant: {
          destructive: {
            backgroundColor: theme.colors.destructive,
          },
          outline: {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.input,
          },
          secondary: {
            backgroundColor: theme.colors.secondary,
          },
          ghost: {
            backgroundColor: "transparent",
          },
          link: {
            backgroundColor: "transparent",
            borderColor: "transparent",
          },
        },
        size: {
          xs: {
            height: 24,
            paddingHorizontal: 8,
            gap: 4,
          },
          sm: {
            height: 32,
            paddingHorizontal: 12,
            gap: 6,
          },
          lg: {
            height: 40,
            paddingHorizontal: 24,
            gap: 8,
          },
          icon: {
            height: 36,
            width: 36,
            paddingHorizontal: 0,
          },
          "icon-xs": {
            height: 24,
            width: 24,
            paddingHorizontal: 0,
          },
          "icon-sm": {
            height: 32,
            width: 32,
            paddingHorizontal: 0,
          },
          "icon-lg": {
            height: 40,
            width: 40,
            paddingHorizontal: 0,
          },
        },
        hovered: {
          true: {},
        },
        hasAffix: {
          true: {},
        },
        pressed: {
          true: {
            opacity: 0.9,
          },
        },
        disabled: {
          true: {
            opacity: 0.5,
          },
        },
        loading: {
          true: {
            opacity: 0.7,
          },
        },
        focusVisible: {
          true: focusRingStyle,
        },
      },
      compoundVariants: [
        { variant: "link", styles: { paddingHorizontal: 0 } },
        { hasAffix: true, styles: { paddingHorizontal: 12 } },
        { size: "xs", hasAffix: true, styles: { paddingHorizontal: 6 } },
        { size: "sm", hasAffix: true, styles: { paddingHorizontal: 10 } },
        { size: "lg", hasAffix: true, styles: { paddingHorizontal: 16 } },
        { size: "icon", hasAffix: true, styles: { paddingHorizontal: 0 } },
        { size: "icon-xs", hasAffix: true, styles: { paddingHorizontal: 0 } },
        { size: "icon-sm", hasAffix: true, styles: { paddingHorizontal: 0 } },
        { size: "icon-lg", hasAffix: true, styles: { paddingHorizontal: 0 } },
        {
          variant: "default",
          hovered: true,
          styles: { backgroundColor: theme.colors.primary, opacity: 0.9 },
        },
        {
          variant: "destructive",
          hovered: true,
          styles: { backgroundColor: theme.colors.destructive, opacity: 0.9 },
        },
        {
          variant: "secondary",
          hovered: true,
          styles: { backgroundColor: theme.colors.secondary, opacity: 0.8 },
        },
        {
          variant: "outline",
          hovered: true,
          styles: { backgroundColor: theme.colors.accent },
        },
        {
          variant: "ghost",
          hovered: true,
          styles: { backgroundColor: theme.colors.accent },
        },
        {
          variant: "outline",
          pressed: true,
          styles: { backgroundColor: theme.colors.accent, opacity: 1 },
        },
        {
          variant: "ghost",
          pressed: true,
          styles: { backgroundColor: theme.colors.accent, opacity: 1 },
        },
        {
          variant: "link",
          pressed: true,
          styles: { opacity: 0.7 },
        },
        ...(Platform.OS === "web"
          ? []
          : [
              {
                pressed: true,
                styles: { transform: [{ scale: 0.97 }] },
              },
            ]),
      ],
    },
    label: {
      fontFamily: theme.typography.families.sans,
      fontSize: theme.typography.sizes.sm,
      lineHeight: theme.typography.lineHeights.sm,
      fontWeight: theme.typography.weights.medium,
      color: theme.colors.primaryForeground,
      variants: {
        variant: {
          default: { color: theme.colors.primaryForeground },
          destructive: { color: theme.colors.destructiveForeground },
          outline: { color: theme.colors.foreground },
          secondary: { color: theme.colors.secondaryForeground },
          ghost: { color: theme.colors.foreground },
          link: {
            color: theme.colors.primary,
            textDecorationLine: "underline",
          },
        },
        size: {
          default: {
            fontSize: theme.typography.sizes.sm,
            lineHeight: theme.typography.lineHeights.sm,
          },
          xs: {
            fontSize: theme.typography.sizes.xs,
            lineHeight: theme.typography.lineHeights.xs,
          },
          sm: {
            fontSize: theme.typography.sizes.xs,
            lineHeight: theme.typography.lineHeights.xs,
          },
          lg: {
            fontSize: theme.typography.sizes.md,
            lineHeight: theme.typography.lineHeights.md,
          },
          icon: {
            fontSize: theme.typography.sizes.sm,
            lineHeight: theme.typography.lineHeights.sm,
          },
          "icon-xs": {
            fontSize: theme.typography.sizes.xs,
            lineHeight: theme.typography.lineHeights.xs,
          },
          "icon-sm": {
            fontSize: theme.typography.sizes.xs,
            lineHeight: theme.typography.lineHeights.xs,
          },
          "icon-lg": {
            fontSize: theme.typography.sizes.md,
            lineHeight: theme.typography.lineHeights.md,
          },
        },
      },
    },
  }
})

const HIT_SLOP_PER_SIZE: Record<ButtonSize, number> = {
  xs: 10, // 24 + 2*10 = 44
  "icon-xs": 10,
  sm: 6, // 32 + 2*6 = 44
  "icon-sm": 6,
  default: 4, // 36 + 2*4 = 44
  icon: 4,
  lg: 2, // 40 + 2*2 = 44
  "icon-lg": 2,
}

type ButtonRef = React.ComponentRef<typeof View>

/**
 * Accessible, theme-driven button mirroring shadcn/ui v4.
 *
 * @example
 * <Button variant="destructive" onPress={handleDelete}>Delete</Button>
 *
 * See `specs/components/button/button_implementation_spec.md` for the full
 * behavior contract (variants, sizes, states, asChild, icon slots).
 */
export const Button = forwardRef<ButtonRef, ButtonProps>(function Button(
  {
    variant = DEFAULT_VARIANT,
    size = DEFAULT_SIZE,
    loading = false,
    asChild = false,
    startContent,
    endContent,
    disabled,
    style,
    textStyle,
    children,
    onFocus,
    onBlur,
    onPressIn,
    onPressOut,
    onHoverIn,
    onHoverOut,
    accessibilityRole,
    accessibilityState,
    hitSlop,
    ...rest
  },
  ref,
) {
  const { theme } = useUnistyles()
  const [focusVisible, setFocusVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  const isDisabled = disabled || loading
  const renderAsChild = asChild === true

  if (__DEV__ && renderAsChild) {
    if (loading) {
      console.warn(
        "[Button] `loading` is ignored when `asChild` is true. The cloned child controls its own content.",
      )
    }
    if (startContent !== undefined || endContent !== undefined) {
      console.warn(
        "[Button] `startContent` / `endContent` are ignored when `asChild` is true. Compose them inside the child instead.",
      )
    }
  }

  const hasStartAffix =
    !renderAsChild && (loading || startContent !== undefined)
  const hasEndAffix = !renderAsChild && endContent !== undefined
  const hasAffix = hasStartAffix || hasEndAffix

  styles.useVariants({
    variant: variant === DEFAULT_VARIANT ? undefined : variant,
    size: size === DEFAULT_SIZE ? undefined : size,
    disabled: isDisabled,
    loading: !renderAsChild && loading ? true : undefined,
    hasAffix: hasAffix ? true : undefined,
    pressed: pressed && !isDisabled ? true : undefined,
    hovered: hovered && !isDisabled && Platform.OS === "web" ? true : undefined,
    focusVisible: focusVisible && Platform.OS === "web" ? true : undefined,
  })

  const spinnerColor = useMemo(() => {
    switch (variant) {
      case "destructive":
        return theme.colors.destructiveForeground
      case "outline":
      case "ghost":
        return theme.colors.foreground
      case "secondary":
        return theme.colors.secondaryForeground
      case "link":
        return theme.colors.primary
      default:
        return theme.colors.primaryForeground
    }
  }, [theme, variant])

  const handleFocus: PressableProps["onFocus"] = (event) => {
    if (Platform.OS === "web") setFocusVisible(true)
    onFocus?.(event)
  }
  const handleBlur: PressableProps["onBlur"] = (event) => {
    if (Platform.OS === "web") setFocusVisible(false)
    onBlur?.(event)
  }
  const handlePressIn: PressableProps["onPressIn"] = (event) => {
    if (!isDisabled) setPressed(true)
    onPressIn?.(event)
  }
  const handlePressOut: PressableProps["onPressOut"] = (event) => {
    setPressed(false)
    onPressOut?.(event)
  }
  const handleHoverIn: PressableProps["onHoverIn"] = (event) => {
    if (Platform.OS === "web" && !isDisabled) setHovered(true)
    onHoverIn?.(event)
  }
  const handleHoverOut: PressableProps["onHoverOut"] = (event) => {
    if (Platform.OS === "web") setHovered(false)
    onHoverOut?.(event)
  }

  const computedHitSlop = hitSlop ?? HIT_SLOP_PER_SIZE[size]
  const hasTextChild =
    typeof children === "string" || typeof children === "number"

  const webDataProps =
    Platform.OS === "web"
      ? {
          dataSet: { slot: "button", variant, size },
        }
      : null

  const Comp = renderAsChild ? Slot : Pressable

  if (renderAsChild && __DEV__) {
    const childCount = Array.isArray(children) ? children.length : 1
    if (childCount !== 1) {
      console.warn(
        "[Button] `asChild` expects exactly one element child; received",
        childCount,
      )
    }
  }

  const isBusy = !renderAsChild && loading

  return (
    <Comp
      ref={ref}
      accessibilityRole={accessibilityRole ?? "button"}
      accessibilityState={{
        ...accessibilityState,
        disabled: isDisabled,
        busy: isBusy ? true : accessibilityState?.busy,
      }}
      aria-busy={isBusy || undefined}
      disabled={isDisabled}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
      hitSlop={computedHitSlop}
      style={[styles.container as ViewStyle, style]}
      {...webDataProps}
      {...rest}
    >
      {renderAsChild ? (
        (children as React.ReactElement)
      ) : (
        <>
          {loading ? (
            <ActivityIndicator color={spinnerColor} size="small" />
          ) : startContent !== undefined ? (
            startContent
          ) : null}
          {hasTextChild ? (
            <Text style={[styles.label as TextStyle, textStyle]}>
              {children}
            </Text>
          ) : (
            (children as React.ReactNode)
          )}
          {endContent !== undefined ? endContent : null}
        </>
      )}
    </Comp>
  )
})

Button.displayName = "Button"
