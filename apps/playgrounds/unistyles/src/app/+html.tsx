import { ScrollViewStyleReset } from "expo-router/html"
import type { PropsWithChildren } from "react"
import { useServerUnistyles } from "react-native-unistyles"

// Initialize Unistyles before any StyleSheet.create runs during static
// rendering. Without this import, server-rendered routes throw "no theme
// has been selected yet" because the SSR bootstrap bypasses index.js.
import "../lib/unistyles"

/**
 * Root HTML wrapper.
 *
 * The playground uses `expo.web.output = "single"` (SPA mode), so this file
 * runs only for the initial document shell — there's no per-route SSR. Even
 * so, Expo Router's bootstrap doesn't load `index.js` before it hydrates the
 * root, so we import `../lib/unistyles` here too. That way
 * `StyleSheet.configure` is called before the React tree mounts.
 *
 * `useServerUnistyles({ includeRNWStyles: true })` keeps the RN Web base
 * stylesheet ordered before Unistyles classes; with SPA output Expo no longer
 * appends its own duplicate stylesheet after Unistyles, so component styles
 * (backgrounds, flex direction, etc.) win.
 */
export default function Root({ children }: PropsWithChildren) {
  const serverUnistyles = useServerUnistyles({ includeRNWStyles: true })

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
