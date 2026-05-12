import { ScrollViewStyleReset } from "expo-router/html"
import type { PropsWithChildren } from "react"
import { useServerUnistyles } from "react-native-unistyles"

// Initialize Unistyles before any StyleSheet.create runs during static
// rendering. Without this import, server-rendered routes throw "no theme
// has been selected yet" because the SSR bootstrap bypasses index.js.
import "../lib/unistyles"

/**
 * Root HTML wrapper for Expo Router's static web output.
 *
 * Inlined into the rendered `<head>`:
 *
 * - `<ScrollViewStyleReset />` resets the body so RN ScrollView measurements
 *   match the web's default.
 * - `useServerUnistyles({ includeRNWStyles: false })` emits the Unistyles
 *   SSR style tags and hydration payload. `includeRNWStyles: false` tells
 *   Unistyles not to duplicate the React Native Web stylesheet, which Expo
 *   Router already injects during export.
 */
export default function Root({ children }: PropsWithChildren) {
  const serverUnistyles = useServerUnistyles({ includeRNWStyles: false })

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
        {serverUnistyles}
      </head>
      <body>{children}</body>
    </html>
  )
}
