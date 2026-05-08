# HANDOFF

One-page orientation for an AI agent or developer arriving fresh at this repo. Read this in order.

## What this repo is

**Leshi UI** — shadcn-style, source-distributed UI components for React Native (iOS / Android / Web), with two interchangeable styling backends:

- **Unistyles flavor** (current implementation, uses `react-native-unistyles` v3)
- **StyleSheet flavor** (Phase 1+, plain `StyleSheet` + Context theming, zero native deps)

Consumer picks one flavor per project via shadcn's `{style}` URL placeholder. The library is not an npm package — it publishes a static shadcn registry that consumers install with `npx shadcn@latest add @leshi-ui/<item>`.

Repo: `https://github.com/AgustinOberg/leshiui`. Hosting: `https://leshi-ui.pages.dev` (Cloudflare Pages, manual deploy).

## Where you are right now

**Phase 0 (Restructure & Rebrand) is in progress.** The repo is mid-migration. The working tree still has the legacy `registry-src/shadniwind/` layout; rebrand documentation has landed on top.

## What to read, in order

1. **`CLAUDE.md`** — full repo guidance, current state summary, common commands, architecture, conventions. Auto-loaded by Claude Code.
2. **`specs/phase-0-restructure.md`** — the **authoritative active plan**. Locked decisions, final tree, build script design, step-by-step execution plan, and a **progress tracker (§18)** with which steps are done.
3. **`AGENTS.md`** — short contributor guidelines, commands, style.
4. **`SPEC.md`** — high-level project spec. **Currently in flux** during Phase 0; treat `specs/` as canonical for current direction until Phase 0 step 14 rewrites this file.
5. **`README.md`** — consumer-facing install instructions. **Currently mid-rebrand** — snippets still reference the legacy `shadniwind` registry URL. Don't trust them yet; full rewrite is Phase 0 step 14.

## Coding philosophy (binding)

1. **Mirror shadcn first.** Look at shadcn/ui's API and port to RN. Don't invent.
2. **Minimal dependencies.** Don't add npm deps without explicit user approval.
3. **Single-file components.** Like shadcn — self-contained `.tsx` per component. Split only when truly unreadable.
4. **Strict typing, no `any`.**
5. **Performance and a11y are non-negotiable.**
6. **Reuse via primitives**, not duplication.

## What to do next

If continuing Phase 0:

1. Open `specs/phase-0-restructure.md` §18 (Progress tracker).
2. Find the first row marked `pending`.
3. Execute that step per §11.
4. Validate (`lint`, `typecheck`, `test`, `build:registry` if relevant).
5. Commit narrowly with a message describing the step.
6. Update §18 with the new short commit SHA.
7. Move to the next pending row.

If something breaks during execution: **fix it inline**, don't ask. The user signed off on autonomy. Mention what broke and how it was fixed in the commit message or running status update.

If something requires a decision not in the spec: **stop and ask** the user. Don't pick a default.

## What is NOT done in Phase 0

These are Phase 1+ and explicitly out of scope:

- StyleSheet flavor lib (theme provider, useTheme, useWebUi).
- Any component in the StyleSheet flavor.
- Refactoring existing Unistyles components.
- A new playground app (the user will rebuild from scratch).
- Tests for a11y, visual regression, perf benchmarks.
- A real docs site under `apps/docs/`.

## User communication

The user writes in Argentine Spanish (voseo). Reply in Spanish. Code, identifiers, file content, and commit messages stay in English.
