# core/web-ui/

**Single-hook helper for CSS pseudo-class behavior on RN Web.**

> **Status: Phase 0 placeholder.** Folder reserved. Implementation lands in Phase 1, when the StyleSheet flavor's first components need hover / focus-visible / active states on web. See `specs/phase-1-stylesheet-foundations.md`.

## API contract (planned)

A single hook that returns merged style objects to spread into `style={[...]}`:

```tsx
import { useWebUi } from "@/lib/web-ui"

const styles = useWebUi({
  hover:  { backgroundColor: theme.colors.accent },
  focus:  { borderColor: theme.colors.ring, borderWidth: 2 },
  active: { opacity: 0.9 },
})

<Pressable style={[baseStyle, styles]} />
```

On native, the hook is a no-op (returns an empty style or just the base). On web, it injects a small `<style>` rule keyed by a hashed className and applies the className via `react-native-web`'s style merging path so the browser handles `:hover` / `:focus-visible` / `:active` natively (no JS state listeners, no re-renders).

## Why one hook, not three

The user (project owner) explicitly chose a single entry point over `useWebHover` + `useWebFocusVisible` + `useWebActive`. Rationale: components typically need multiple pseudo-states together; a single hook with an options object reads cleaner at the call site and avoids three import lines per component.

## Why `core/web-ui/` (not `styles/stylesheet/`)

Any future flavor that doesn't have native pseudo-class support (StyleSheet today, hypothetical NativeWind flavor tomorrow, plain styled-components flavor later) needs the same primitive. Keeping it in `core/` lets all such flavors share one implementation. The Unistyles flavor doesn't import it — Unistyles' own web parser handles pseudos.

## Implementation notes (for Phase 1)

- Native (`use-web-ui.native.ts`): return `undefined` or empty object.
- Web (`use-web-ui.web.ts`): hash the input options, look up an existing class or inject a new one, return `{ $$css: true, [className]: className }` (RN Web's CSS-in-JS escape hatch) or equivalent.
- Idempotent injection: keep a module-level `Set<hash>` so the same options never inject the same `<style>` rule twice.
- Cleanup: not required (CSS rules are cheap and class hashing is deterministic).
- Zero dependencies on a styling library — pure DOM manipulation via `document.head`.
