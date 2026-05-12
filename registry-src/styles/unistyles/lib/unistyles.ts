import { StyleSheet } from "react-native-unistyles"

// Default palette is shadcn-default. To swap palettes, change this import to
// another theme file (e.g. `./tokens/shadcn-rose.js`) — the rest of the file
// stays the same.
import { darkTheme, lightTheme } from "../../../core/tokens/shadcn-default.js"

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
