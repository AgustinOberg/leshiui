import { StyleSheet } from "react-native-unistyles"

import { darkTheme, lightTheme } from "./tokens/default"

/**
 * Unistyles initialization.
 *
 * Configures `react-native-unistyles` with the light and dark themes from
 * `core/tokens/`. Both themes share the same shape (`Theme` from
 * `core/tokens/types.ts`) so swapping themes at runtime is type-safe.
 *
 * IMPORTANT: import this module exactly once from the consumer's app entry
 * point BEFORE any component or stylesheet is imported. Failure to do so
 * results in Unistyles errors or unstyled content.
 *
 * For Expo Router, use a custom `index.ts` entry file and import this module
 * there. If using Expo static web rendering, also import it from
 * `app/+html.tsx` and render `useServerUnistyles()` inside that file's
 * `<head>`.
 */
StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  settings: {
    adaptiveThemes: true,
  },
})
