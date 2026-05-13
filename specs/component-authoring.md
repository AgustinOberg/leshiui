# Component authoring workflow

Canonical process for any AI agent (Claude Code, Codex, Cursor, …) creating a new component in Leshi UI. Read this in full **before** touching code. `AGENTS.md` codifies the binding rules; this document codifies *how* you apply them.

---

## Mental model

### Mission

Each Leshi UI component is a **shadcn-style, source-distributed, theme-driven React Native component** that:

- **Looks and behaves like shadcn/ui by default.** shadcn is the industry standard; deviating from its visual or API surface adds adoption friction. Treat shadcn as the bible.
- **Compiles into every supported style backend.** The same component spec produces one implementation per flavor under `registry-src/styles/<flavor>/ui/<name>.tsx`. Today: `unistyles`. Soon: `stylesheet`. The **props API is byte-identical across flavors**; only the styling implementation differs.
- **Works on iOS, Android, and Web.** Platform variations go in `.web.tsx` / `.native.tsx`, never `Platform.OS` branching when a filename split works.
- **Is theme-driven, never hardcoded.** Every color, radius, spacing, font, line-height, and weight comes from `core/tokens/`. No raw hex, no magic dimension values that should scale with the theme.
- **Is accessible and performant by default.** Correct `accessibilityRole` / aria, keyboard support on web, screen reader support on native, no avoidable re-renders.

### Two design references

When deciding what a component looks like and how its props are shaped, consult **both** references, in order:

1. **shadcn/ui** — the bible. Visual design + props API + composition. Read the docs page (`https://ui.shadcn.com/docs/components/<name>`) and the source (`https://github.com/shadcn-ui/ui`). If shadcn has a live demo, open it in Chrome (via `mcp__claude-in-chrome__*`) to see actual behavior.
2. **HeroUI Native** — mobile UX consultant. Docs: `https://heroui.com/docs/native`. LLM map: `https://heroui.com/native/llms.txt`. shadcn is web-first; some components feel off on touch. Use HeroUI Native to inform UX decisions (gesture targets, sheet/drawer ergonomics, haptics) but **never import its API surface** — we keep shadcn's props.

**Tie-breaking rule:** prefer **shadcn for the code interface** (exports, props, composition) and the **better UX** for runtime behavior. Any deviation from shadcn's interface must be documented in the spec and explicitly approved by the dev.

If shadcn doesn't have the component (some are RN-specific), fall back to HeroUI Native or another well-regarded reference, and document the choice in the spec.

### Style-backend independence

Components must not leak Unistyles-specific abstractions into their public API. Inside the body you use whatever the active flavor provides (`StyleSheet.create((theme) => ...)` + `useVariants` for Unistyles). But:

- **Props the consumer sees** are identical across flavors.
- **Shared logic** (variant maps, state machines, positioning math, focus traps) that doesn't depend on a styling system **belongs in `registry-src/core/primitives/` or `registry-src/core/variants/`** and is imported by each flavor file. Neither folder exists today — create it the moment you have a real file to put inside, never as an empty placeholder.
- **Theme tokens** live in `registry-src/core/tokens/` and are imported the same way by every flavor.

### Single source of truth per flavor

One `.tsx` per component per flavor. Composition + variants + types + exports live in that single file. Split into hooks or sub-components only when the file becomes genuinely unreadable. Cross-component logic goes into `core/primitives/`.

### Architectural building blocks (read before designing the API)

Leshi UI mirrors **shadcn/ui's distribution and dependency model 1:1**: the styled component is source-distributed, every other moving part is a peer dependency the consumer installs. Two architectural docs are binding for every component:

- **`specs/architecture/primitive-layer.md`** — what plays the role of Radix. Default: **`@rn-primitives/*`** (peer dep model, same shape as shadcn↔Radix). When your component needs portal / overlay / focus trap / keyboard / controllable open state, import from `@rn-primitives/<x>` and add it to the manifest's `dependencies` field. **Do not hand-roll behavior `@rn-primitives` already ships.** A future Phase will add the ability to swap primitive libs (mirroring shadcn's Radix ↔ Base UI swap via `components.json` `style`) — design your component so the primitive import is the only line that would change.

- **`specs/architecture/icon-system.md`** — what plays the role of lucide. Default: **`@expo/vector-icons`** (Feather set for most glyphs). When your component renders an icon, use the `<IconSlot lucide="<Name>" expoVectorIcons="<Set>:<name>" size={N} />` placeholder; the registry build emits per-library variants. Authoring rule: every `<IconSlot>` must declare every supported library prop — build fails otherwise.

**Pre-approved peer dependencies** (already cleared with the maintainer; do not re-ask in step 4 to add these — but always list them in the manifest's `dependencies` when you import them):

- `@rn-primitives/*` — primitive layer (any package in the family).
- `@expo/vector-icons` — default icon library.
- `lucide-react-native` (+ `react-native-svg` peer) — alternative icon library.
- `react-native-reanimated@^3` — animations.

Anything else still requires explicit user approval per AGENTS.md Hard Rule #2.

**Where custom `core/primitives/` code still belongs:** theme-aware helpers (e.g., reading the current breakpoint from Unistyles `rt`), `useWebUi` hover/focus/active visibility, cva-like variant helper, gap-fillers that `@rn-primitives` doesn't ship (rare). Never re-implement a primitive the upstream already covers.

---

## The workflow (14 steps)

### 1 · Read shadcn

Read the shadcn docs page and source. Pay attention to:

- **Exported components** (compound pattern: e.g., `Dialog`, `DialogTrigger`, `DialogContent`).
- **Props** — names, types, defaults, optionality.
- **Variants** — `variant`, `size`, etc., and what they look like.
- **Composition** — how parts fit together, what context they share.
- **States** — default, hover, focus, active/pressed, disabled, loading, error.
- **a11y** — `role`, `aria-*` on web → `accessibilityRole`, `accessibilityState` on RN.

If a visual is unclear, open the shadcn live demo in Chrome via `mcp__claude-in-chrome__navigate` and take a screenshot.

### 2 · Cross-check with HeroUI Native

Look at the same component on HeroUI Native. Compare:

- **Mobile UX** — gesture targets, hit-slop, haptics, bottom-sheet vs centered modal, swipe-to-dismiss, …
- **Code quality** — composition, primitive extraction, platform splits.
- **Decision** — which UX wins? Note it in the spec with rationale.

If HeroUI Native doesn't ship the component, fall back to shadcn entirely.

### 3 · Lock the code interface

Default to **shadcn's exports and props**. The industry standard wins unless we have a strong, explicit reason to diverge. Any divergence must be documented in the spec and approved in step 8.

Identify the **`@rn-primitives` package** that backs this component (if any). Verify the upstream API matches what shadcn / Radix exposes — they almost always do, since `@rn-primitives` is shaped after Radix. Note any gaps (e.g., native side missing focus trap) and decide in the spec whether to ship anyway, wrap, or fork into `core/primitives/`.

Identify the **icon glyphs** the component needs. Map each glyph to the supported icon libraries (today: `lucide` name + `@expo/vector-icons` `Set:name`). Include the mapping in the spec.

### 4 · Surface open questions

Use `AskUserQuestion` (Claude Code) to surface decisions you genuinely cannot make on your own.

**Valid asks:**

- "shadcn uses a centered modal; HeroUI uses a bottom sheet on mobile. Which UX wins?"
- "This component would benefit from `<lib>` (~3kB). OK to add as a peer dep, or reimplement in-tree?"
- "We don't have a `warning` color token. Add one or reuse `destructive`?"

**Invalid asks — never ask these:**

- Anything answered by shadcn's source.
- Anything covered by an `AGENTS.md` hard rule.
- Anything cosmetic with no architectural impact.
- Things you can resolve by reading code or running a command.

### 5 · Write the implementation spec

Create `specs/components/<name>/<name>_implementation_spec.md` using the template below. The spec must contain every decision needed to implement the component without re-asking the dev.

### 6 · Code-quality requirements

Beyond the `AGENTS.md` hard rules:

- **Composition over prop bloat.** If the API needs more than 2-3 variant axes, use a compound component pattern (e.g., `<Card><CardHeader/>…</Card>`).
- **No new npm dependencies** without explicit step-4 approval. Reimplement small helpers in-tree. When a dep is approved, the spec must list it with rationale so the dev owns the decision.
- **Performance.** Memoize where it helps (heavy children, context values), avoid re-rendering all consumers on parent state changes, no inline object/array literals in props that change every render of long lists. Don't pre-optimize; do remove obvious foot-guns.
- **Theme-driven.** Every visual constant comes from the theme.
- **Cross-platform.** Renders correctly on iOS, Android, and Web. Web-only features (focus ring) gated; native-only features (haptics) gated.

**Skills to invoke (Claude Code):**

- `dx-expert` — RN Expo DX (SRP, hooks, composition, polish). Use proactively when implementing logic.
- `vercel-composition-patterns` — composition at scale (compound components, render props, context). Use when designing the API surface.
- `vercel-react-best-practices` — React performance patterns (memoization, rendering, bundle). Use when in doubt on a perf decision.
- `simplify` — run after the first pass to remove dead weight.

### 7 · Self-validate the spec

Before showing the spec to the dev, re-read it and check:

- Every prop has a name, type, default, and optionality.
- Every state (default / hover / focus / active / disabled / loading / error) is defined with explicit token references.
- The variant matrix is exhaustive.
- Platform splits are identified.
- Registry dependencies (`tokens`, primitives, …) are listed.
- Theme contract additions (new tokens) are explicit and justified.
- The playground demo plan is included (which sections to render).
- Every "open question" has been resolved — if anything is fuzzy, fix it in the spec, **not in a question to the dev**.

The spec must be implementable as-is by another agent.

### 8 · Ask the dev to approve the spec

Reply in Spanish (Argentine, voseo — per `CLAUDE.md`/`AGENTS.md`). Summarize the key decisions, highlight any deviation from shadcn, and explicitly ask: *"¿Sigo con la implementación?"*

Do not proceed without explicit go-ahead.

### 9 · Implement

When approved, write:

- `registry-src/styles/<flavor>/ui/<name>.tsx` (per active flavor — today, `unistyles`). Import behavior from `@rn-primitives/<x>` where applicable; render icons via `<IconSlot ...>` placeholder. Never re-implement portal / overlay / focus trap / keyboard semantics if the primitive already ships them.
- `registry-src/styles/<flavor>/items/<name>.manifest.json` (paths kebab-case, `registryDependencies` complete, `dependencies` listing every npm peer the consumer must install — including transitive primitives like `@rn-primitives/portal` for honesty, and the chosen icon library).
- Any new **gap-filling** primitives under `registry-src/core/primitives/` per the spec (only when `@rn-primitives` doesn't ship the behavior).
- Any new theme tokens in `registry-src/core/tokens/` if the spec calls for them.

Run continuously while editing:

- `bun run lint`
- `bun run typecheck`
- `bun run build:registry` (every time you touch a manifest or registry source)

**Zero TypeScript errors, zero lint errors, zero hardcoded theme values.** The bar is shadcn-perfect.

### 10 · Ask the dev to start the playground

Reply in Spanish: ask the dev to run the playground (`bun run web` inside `apps/playgrounds/<flavor>/`) and reply with the URL when it's up. Wait for "levantado" (or similar) before proceeding.

### 11 · Integrate into every playground

For **each** playground under `apps/playgrounds/<flavor>/` (today only `unistyles`; later also `stylesheet`):

1. **Copy** the new component from `registry-src/styles/<flavor>/ui/<name>.tsx` into `apps/playgrounds/<flavor>/src/components/ui/<name>.tsx`. Same for any new primitives or tokens.
2. **Create a demo screen** at `apps/playgrounds/<flavor>/src/app/components/<slug>.tsx` using `PlaygroundScreen`, `Section`, `Row` helpers. Showcase: every variant, every size, every state, edge cases (long text, custom children, accessibility props).
3. **Register** the component in `apps/playgrounds/<flavor>/src/app/index.tsx` — add the slug to the `slug` union type, add the entry to `COMPONENTS`.

### 12 · Open the playground in Chrome

When the dev gives you the URL, load `mcp__claude-in-chrome__tabs_context_mcp` first (per the Chrome MCP guidance) and then `mcp__claude-in-chrome__navigate` to the demo page. Use `mcp__claude-in-chrome__resize_window` if you need to test mobile breakpoints.

### 13 · Test visually + a11y

Using the Chrome MCP tools:

- **Visual:** matches shadcn within reasonable RN constraints. Take a screenshot; compare side-by-side with shadcn's demo. Test the default theme first (it should look almost identical to shadcn) and then any approved UX deviations.
- **States:** hover (web), focus ring (web Tab), active/pressed, disabled, loading. Each renders correctly.
- **Edge cases:** long text, custom children, RTL if applicable, dark theme.
- **a11y:** inspect the accessibility tree, verify roles and labels. Tab through with keyboard on web.
- **Console:** `mcp__claude-in-chrome__read_console_messages` — must be clean. No warnings, no errors.

If anything is off, fix it without asking and loop back to step 9.

### 14 · Wrap up

- Update `specs/component-catalog.md` to mark the component `ready`.
- Re-run `bun run lint && bun run typecheck && bun run build:registry && bun run test`.
- Commit the regenerated `public/` artifacts (CI fails on a dirty tree).
- Ask the dev in Spanish: *"¿Falta algo o lo marco como listo?"*

---

## Implementation spec template

Create at `specs/components/<name>/<name>_implementation_spec.md`:

```markdown
# <Component> — implementation spec

## Goal
One-paragraph summary: what the component does, who uses it, why it exists.

## References
- shadcn docs: <url>
- shadcn source: <url>
- HeroUI Native: <url or "N/A">
- Other: <if any>

## Decisions
| Decision | Choice | Why |
| --- | --- | --- |
| Visual baseline | shadcn `New York` | industry standard |
| Mobile UX | HeroUI bottom sheet at `<sm` | shadcn modal awkward on touch |
| Composition | compound (`Card`, `CardHeader`, …) | shadcn pattern |
| Variant axes | `variant`, `size` | shadcn parity |
| …  | …  | …  |

## API
\`\`\`ts
export type ComponentProps = {
  variant?: "default" | "outline" | ...
  size?: "sm" | "default" | "lg"
  // ...
}
export const Component: React.ForwardRefExoticComponent<...>
\`\`\`

## Variants & states
- `variant`: `default | outline | …` — token references for each.
- `size`: `sm | default | lg` — dimensions in tokens.
- States: default / hover (web) / focus / active / disabled / loading / error → token references.

## Theme contract changes
- New tokens needed? List with rationale.
- Or: "None."

## Primitives & dependencies
- Registry deps: `tokens`, `<primitive>`, …
- npm deps added: list with rationale, or "None."

## Platform splits
- `.web.tsx` / `.native.tsx` if needed, and why.

## a11y
- Role, state, label conventions, keyboard map.

## Playground demo
- Sections to render: Variants / Sizes / States / Edge cases / …

## Open questions
- Resolved before sign-off. If anything is here at sign-off time, stop and ask.
```

---

## Playground integration recipe (quick reference)

```
apps/playgrounds/<flavor>/
└── src/
    ├── app/
    │   ├── index.tsx                     ← add COMPONENTS entry + slug
    │   └── components/<slug>.tsx         ← new demo screen
    ├── components/
    │   ├── ui/<slug>.tsx                 ← copy from registry-src
    │   └── playground/
    │       ├── screen.tsx
    │       ├── section.tsx
    │       └── row.tsx
    └── lib/
        ├── tokens/
        └── <primitive>/                  ← copy from registry-src if new
```

Demo screen template:

```tsx
import { Component } from "@/components/ui/<slug>"
import { PlaygroundScreen } from "@/components/playground/screen"
import { Section } from "@/components/playground/section"
import { Row } from "@/components/playground/row"

export default function ComponentDemoScreen() {
  return (
    <PlaygroundScreen title="Component" description="…">
      <Section title="Variants"><Row>…</Row></Section>
      <Section title="Sizes"><Row>…</Row></Section>
      <Section title="States"><Row>…</Row></Section>
      <Section title="Edge cases"><Row>…</Row></Section>
    </PlaygroundScreen>
  )
}
```

---

## Comments

**Default: write none.** Self-explanatory code beats commented code. If the reader has a question, the answer lives in the spec, not in a code comment.

Rules:

- **TSDoc on public exports only** — `ButtonVariant`, `ButtonSize`, `ButtonProps`, `Button`, etc. Keep it minimal: 1-2 lines + an `@example` if useful. Pointer to the spec for full contract. Don't restate prop names you already typed.
- **Zero inline narration.** No "this does X" comments. The code already does X — naming, types, and the spec cover the intent. Lines like `// Native-only scale on press: web is opacity only`, `// data-* attributes for shadcn parity` — all forbidden.
- **Zero JSDoc on internal helpers.** If an internal function needs explanation, the explanation belongs in the spec. Name the function well instead.
- **Allowed**: a trailing one-line comment that justifies a magic number where the calculation isn't obvious (e.g. `xs: 10, // 24 + 2*10 = 44` to document the HIG tap-target math). These are "why this exact value" notes, not narration.
- **Allowed**: pointing at the spec from the main component TSDoc. (`See specs/components/<name>/<name>_implementation_spec.md`.)
- **If you feel an urge to write a comment**: write a worse-named variable / function instead and let the rename solve it.

The bar: someone reading the code without the spec should still be able to follow it. Someone with the spec shouldn't need any inline narration at all.

## Anti-patterns

- Adding npm deps without step-4 approval.
- Hardcoded hex / dimensions instead of token references.
- `Platform.OS` branching when a filename split works.
- `any`, anywhere.
- Path aliases (`@/…`) inside `registry-src/` — consumer aliases differ.
- Unistyles v2 APIs (`createStyleSheet`, `useStyles`) — only v3 (`StyleSheet.create((theme) => …)` + `useVariants`).
- **Narrative comments.** See the **Comments** section above. If the spec covers it, don't repeat it in code.
- **Verbose TSDoc** on every prop / type re-stating what the type signature already says.
- Asking the dev redundant questions that shadcn already answers.
- Skipping the spec and jumping to implementation.
- Marking ready without verifying in Chrome.
- Implementing in only one flavor when more than one is live.
- Declaring a `default` key inside a Unistyles `variants` map — base styles are the implicit default; declaring `default` poisons compound-variant matching.

---

## References

- `AGENTS.md` — binding hard rules.
- `SPEC.md` — mission, goals/non-goals, versioning.
- `specs/architecture/primitive-layer.md` — `@rn-primitives` adoption, peer-dep model, future swap mechanism (mirror shadcn ↔ Radix/Base UI).
- `specs/architecture/icon-system.md` — `<IconSlot>` placeholder + ts-morph transform, default `@expo/vector-icons`, alt `lucide-react-native`.
- `specs/registry-protocol.md` — manifest format + build pipeline.
- `specs/component-catalog.md` — tier mapping + per-component status.
- shadcn/ui — https://ui.shadcn.com · https://github.com/shadcn-ui/ui
- `@rn-primitives` — https://rn-primitives.vercel.app · https://github.com/roninoss/rn-primitives (default primitive layer).
- HeroUI Native — https://heroui.com/docs/native · https://heroui.com/native/llms.txt (mobile UX consultant only — never copy their primitive architecture; they hand-roll without a focus trap on web).
