# Leshi UI

shadcn-style, source-distributed UI components for React Native (iOS / Android / Web) with interchangeable styling backends.

You don't `npm install` Leshi UI — you copy the components into your project. The shadcn CLI fetches each item's source from a static registry and writes it into your `lib/` and `components/ui/` directories. You own the code.

> **Status.** The Unistyles flavor is published. The StyleSheet flavor (no native dependencies) is in active development; install snippets below show how to opt into Unistyles today.

## Why Leshi UI

- **shadcn API parity.** Same prop shapes, slot composition, and naming conventions as shadcn/ui — minimal mental switch from web to RN.
- **Universal apps.** One codebase ships to iOS, Android, and Web (via `react-native-web`). Components handle platform nuances (hover on web, press on native) internally.
- **Source-owned.** Like shadcn/ui, you copy components into your project. Customize, refactor, delete what you don't need — there's no library override to fight.
- **Backend-swappable styling.** Pick a styling backend per project via shadcn's `style` field. Today: **Unistyles** (high-perf JSI, native deps). Soon: **StyleSheet** (plain RN `StyleSheet` + Context, zero native deps).

## Hard requirements (Unistyles flavor)

- React Native 0.78+ with the New Architecture enabled.
- Expo SDK 53+ using a development build or prebuild flow. **Expo Go is not supported.**
- Dependencies installed automatically with the `tokens` item:
  - `react-native-unistyles >= 3.2.0`
  - `react-native-nitro-modules >= 0.35.2`
- Optional: `react-native-edge-to-edge >= 1.8.1` if your app uses its plugin or runtime behavior.

The StyleSheet flavor (when shipped) will drop the nitro-modules / New Architecture / Expo SDK 53 requirements.

## One codebase, any platform

```bash
npx expo run:ios       # iOS simulator / device
npx expo run:android   # Android emulator / device
npx expo start --web   # browser
```

Leshi UI components handle hover / focus on web and press / long-press on native internally. You write `<View>` and `<Text>` once.

## Getting started

Follow these steps to initialize a new project with the Unistyles flavor.

### 1. Create the project

Because the Unistyles flavor depends on `react-native-nitro-modules`, you must use a development build (Expo Go is not supported):

```bash
npx create-expo-app@latest my-app
cd my-app
npx expo run:ios   # or run:android
```

### 2. Configure `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "unistyles",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "",
    "baseColor": "zinc",
    "cssVariables": false
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "@leshi-ui": "https://leshi-ui.pages.dev/v1/styles/{style}/r/{name}.json"
  }
}
```

The `{style}` placeholder is substituted from the `style` field above. To switch styling backend later, change `"style": "unistyles"` to `"style": "stylesheet"` (once the StyleSheet flavor publishes its first items).

You can register the namespace via CLI instead of editing manually:

```bash
npx shadcn@latest registry add "@leshi-ui=https://leshi-ui.pages.dev/v1/styles/{style}/r/{name}.json"
```

### 3. Install tokens

The `tokens` item ships the theme contract, default light/dark themes, and the Unistyles wiring. It is the first thing every Leshi UI consumer installs.

```bash
npx shadcn@latest add @leshi-ui/tokens
```

This adds `react-native-unistyles` and `react-native-nitro-modules` to your dependencies and creates:

- `lib/tokens/types.ts` — the `Theme` contract and `ThemeName` type.
- `lib/tokens/default.ts` — `lightTheme`, `darkTheme`, the `tokens` constant, and the `space()` helper.
- `lib/unistyles.ts` — calls `StyleSheet.configure` with both themes.
- `lib/unistyles-types.d.ts` — Unistyles module augmentation.

### 4. Add the Unistyles Babel plugin

Leshi UI components use the Unistyles v3 authoring model (`StyleSheet.create((theme) => ...)`, variants, runtime theme access). Add the Unistyles Babel plugin so files in your app, `components/`, and `lib/` are processed.

Use app-scoped absolute paths in `autoProcessPaths`. Do **not** pass bare folder names like `"components"` — the Unistyles plugin matches with `filename.includes(...)` and can accidentally process files in `node_modules`.

**`babel.config.js`:**

```js
const path = require("node:path")

module.exports = function (api) {
  api.cache(true)

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "react-native-unistyles/plugin",
        {
          root: "app",
          autoProcessPaths: [
            path.join(__dirname, "components"),
            path.join(__dirname, "lib"),
          ],
        },
      ],
    ],
  }
}
```

If you already have a Babel config, merge the Unistyles plugin in instead of replacing your existing plugins. If your app keeps Unistyles-authored files in other local directories, add them with `path.join(__dirname, "...")` too.

### 5. Initialize Unistyles

Unistyles must initialize **before** Expo Router or your app modules import any component that calls `StyleSheet.create`.

**`package.json`:**

```json
{
  "main": "index.ts"
}
```

**`index.ts`:**

```tsx
import "./lib/unistyles"
import "expo-router/entry"
```

If you use Expo static web output, also add a root HTML file so Unistyles initializes during static rendering and emits its SSR CSS / hydration payload on the server render.

**`app/+html.tsx`:**

```tsx
import { ScrollViewStyleReset } from "expo-router/html"
import type { PropsWithChildren } from "react"
import { useServerUnistyles } from "react-native-unistyles"

import "../lib/unistyles"

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
```

Expo Router already handles the React Native Web stylesheet during export, so pass `includeRNWStyles: false` and let `useServerUnistyles` inject only the Unistyles SSR tags.

For bare React Native, just import `./lib/unistyles` once at the top of `App.tsx`.

### 6. Set up the overlay system (if you use overlays)

Components that float above content — Dialog, Popover, Tooltip, Drawer, Sheet — depend on the portal primitive. Registry dependencies will install the portal files automatically when you install one of those components, but you still need to wire `PortalProvider` and `PortalHost` once.

```bash
npx shadcn@latest add @leshi-ui/portal
```

Wrap your app root:

```tsx
import { Slot } from "expo-router"

import { PortalHost, PortalProvider } from "@/lib/portal"

export default function RootLayout() {
  return (
    <PortalProvider>
      <Slot />
      <PortalHost />
    </PortalProvider>
  )
}
```

### 7. Add components

```bash
npx shadcn@latest add @leshi-ui/button
```

```tsx
import { Button } from "@/components/ui/button"

export function HomeScreen() {
  return <Button onPress={() => console.log("Pressed!")}>Hello World</Button>
}
```

## Switching styling backend

Once the StyleSheet flavor ships, switching is a single field in `components.json`:

```diff
-  "style": "unistyles",
+  "style": "stylesheet",
```

Then re-add the items you use:

```bash
npx shadcn@latest add @leshi-ui/tokens @leshi-ui/button
```

The component imports in your app code don't change — only the underlying styling implementation does.

## Deploying the registry (maintainers)

This repo uses **Bun** as its package manager and script runner. Install Bun first via [bun.sh](https://bun.sh) (or `curl -fsSL https://bun.sh/install | bash`). The lockfile is `bun.lock`.

The registry is hosted on Cloudflare Pages at `leshi-ui.pages.dev`. Deploys are manual via Wrangler:

```bash
bun install                # one-time + when deps change
bun run deploy             # build registry + deploy to production (main branch)
bun run deploy:preview     # build + deploy to a preview URL (no production replacement)
```

`wrangler` is bundled as a devDependency and authenticates against the maintainer's Cloudflare account on their local machine (no CI secret required). Each deploy captures the current git commit hash automatically — you can inspect or roll back from the Cloudflare dashboard.

## Project status and architecture

- `SPEC.md` — high-level mission, architecture overview, coding philosophy.
- `specs/registry-protocol.md` — registry URL scheme, manifest format, build pipeline.
- `specs/component-catalog.md` — Tier mapping + per-component required primitives.
- `specs/phase-0-restructure.md` — current execution plan and progress tracker.
- `LICENSE` — MIT.

## Contributing

See `AGENTS.md` for repo conventions, commands, and the contributor workflow.
