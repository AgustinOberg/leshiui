import * as React from "react"
import type {
  PressableStateCallbackType,
  StyleProp,
} from "react-native"

/**
 * Foundation for the `asChild` pattern: clones a single child and merges the
 * slot's props, refs, styles, and event handlers onto it.
 *
 * @example
 * ```tsx
 * <Button asChild>
 *   <Link href="/foo">Go</Link>
 * </Button>
 * ```
 *
 * See `specs/primitives/slot/slot_implementation_spec.md` for merge rules.
 */
export function Slot<T extends React.ElementType>(
  props: SlotProps<T>,
): React.ReactElement | null {
  const { children, ref: forwardedRef, ...slotProps } = props as SlotProps<T> & {
    ref?: React.Ref<unknown>
  }

  if (!React.isValidElement(children)) {
    if (__DEV__) {
      console.warn(
        "[Slot] `asChild` requires exactly one valid React element child. Received:",
        children,
      )
    }
    return null
  }

  if (isTextChildren(children)) {
    if (__DEV__) {
      console.warn(
        "[Slot] Text / numeric children cannot receive merged props. Wrap them in a component first.",
      )
    }
    return null
  }

  const childProps = (children.props ?? {}) as AnyProps

  if (children.type === React.Fragment) {
    const fragmentChildren = React.Children.toArray(
      childProps.children as React.ReactNode,
    )
    return (
      <>
        {fragmentChildren.map((child, index) =>
          React.isValidElement(child) ? (
            <Slot
              key={child.key ?? index}
              {...(slotProps as AnyProps)}
              ref={forwardedRef}
            >
              {child}
            </Slot>
          ) : (
            child
          ),
        )}
      </>
    )
  }

  const { ref: childRef, ...childOwnProps } = childProps
  const composedRef =
    forwardedRef !== undefined || childRef !== undefined
      ? composeRefs(
          forwardedRef as React.Ref<unknown>,
          childRef as React.Ref<unknown> | undefined,
        )
      : undefined

  return React.cloneElement(children, {
    ...mergeProps(slotProps as AnyProps, childOwnProps),
    ...(composedRef !== undefined ? { ref: composedRef } : {}),
  } as Partial<unknown>)
}

Slot.displayName = "Slot"

/** Props accepted by {@link Slot}. */
export type SlotProps<T extends React.ElementType> =
  React.ComponentPropsWithRef<T> & {
    children: React.ReactNode
  }

type AnyProps = Record<string, unknown>

function setRef<T>(
  ref: React.Ref<T> | undefined,
  value: T | null,
): (() => void) | undefined {
  if (typeof ref === "function") {
    const cleanup = ref(value)
    if (typeof cleanup === "function") {
      return cleanup
    }
    return undefined
  }
  if (ref != null) {
    ;(ref as React.MutableRefObject<T | null>).current = value
    return () => {
      ;(ref as React.MutableRefObject<T | null>).current = null
    }
  }
  return undefined
}

function composeRefs<T>(
  ...refs: Array<React.Ref<T> | undefined>
): React.RefCallback<T> {
  let cleanups: Array<() => void> = []
  return (node) => {
    for (const cleanup of cleanups) cleanup()
    cleanups = []
    if (node == null) {
      for (const ref of refs) {
        if (typeof ref === "function") ref(null)
        else if (ref != null) {
          ;(ref as React.MutableRefObject<T | null>).current = null
        }
      }
      return
    }
    for (const ref of refs) {
      const cleanup = setRef(ref, node)
      if (cleanup) cleanups.push(cleanup)
    }
  }
}

function mergeProps(slotProps: AnyProps, childProps: AnyProps): AnyProps {
  const overrideProps: AnyProps = { ...childProps }

  for (const propName in childProps) {
    const slotValue = slotProps[propName]
    const childValue = childProps[propName]

    if (/^on[A-Z]/.test(propName)) {
      if (typeof slotValue === "function" && typeof childValue === "function") {
        overrideProps[propName] = (...args: unknown[]) => {
          ;(childValue as (...a: unknown[]) => unknown)(...args)
          ;(slotValue as (...a: unknown[]) => unknown)(...args)
        }
      } else if (typeof slotValue === "function") {
        overrideProps[propName] = slotValue
      }
    } else if (propName === "style") {
      overrideProps[propName] = combineStyles(
        slotValue as ComposableStyle,
        childValue as ComposableStyle,
      )
    }
  }

  return { ...slotProps, ...overrideProps }
}

type ComposableStyle =
  | StyleProp<unknown>
  | ((state: PressableStateCallbackType) => StyleProp<unknown>)

function combineStyles(
  slotStyle: ComposableStyle | undefined,
  childStyle: ComposableStyle | undefined,
): ComposableStyle | undefined {
  const slotIsFn = typeof slotStyle === "function"
  const childIsFn = typeof childStyle === "function"

  if (slotIsFn && childIsFn) {
    return (state: PressableStateCallbackType) => [
      (slotStyle as (s: PressableStateCallbackType) => StyleProp<unknown>)(
        state,
      ),
      (childStyle as (s: PressableStateCallbackType) => StyleProp<unknown>)(
        state,
      ),
    ]
  }
  if (slotIsFn) {
    return (state: PressableStateCallbackType) =>
      childStyle !== undefined
        ? [
            (slotStyle as (s: PressableStateCallbackType) => StyleProp<unknown>)(
              state,
            ),
            childStyle as StyleProp<unknown>,
          ]
        : (slotStyle as (s: PressableStateCallbackType) => StyleProp<unknown>)(
            state,
          )
  }
  if (childIsFn) {
    return (state: PressableStateCallbackType) =>
      slotStyle !== undefined
        ? [
            slotStyle as StyleProp<unknown>,
            (childStyle as (s: PressableStateCallbackType) => StyleProp<unknown>)(
              state,
            ),
          ]
        : (childStyle as (s: PressableStateCallbackType) => StyleProp<unknown>)(
            state,
          )
  }
  if (slotStyle !== undefined && childStyle !== undefined) {
    return [slotStyle, childStyle] as StyleProp<unknown>
  }
  return slotStyle ?? childStyle
}

function isTextChildren(children: React.ReactNode): boolean {
  if (typeof children === "string" || typeof children === "number") return true
  if (Array.isArray(children)) {
    return children.every(
      (child) => typeof child === "string" || typeof child === "number",
    )
  }
  return false
}
