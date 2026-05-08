# HANDOFF

One-page orientation for an AI agent or developer arriving fresh at this repo. Read this in order.

## What this repo is

**Leshi UI** — shadcn-style, source-distributed UI components for React Native (iOS / Android / Web), with two interchangeable styling backends:

- **Unistyles flavor** (current implementation, uses `react-native-unistyles` v3)
- **StyleSheet flavor** (Phase 1+, plain `StyleSheet` + Context theming, zero native deps)

Consumer picks one flavor per project via shadcn's `{style}` URL placeholder. The library is not an npm package — it publishes a static shadcn registry that consumers install with `npx shadcn@latest add @leshi-ui/<item>`.

Repo: `https://github.com/AgustinOberg/leshiui`. Hosting: `https://leshi-ui.pages.dev` (Cloudflare Pages, manual deploy).

## Where you are right now

**Phase 0 (Restructure & Rebrand) is complete.** All 17 tracker rows in `specs/phase-0-restructure.md` §18 are marked done across 7 commits on `main`. Validation green: `lint`, `typecheck`, `test` (28/28), `build:registry` (idempotent). The next active phase is `specs/phase-1-stylesheet-foundations.md` (StyleSheet flavor); read its pre-flight checklist before starting any Phase 1 work.

## What to read, in order

1. **`CLAUDE.md`** — full repo guidance, current state summary, common commands, architecture, conventions. Auto-loaded by Claude Code.
2. **`specs/phase-0-restructure.md`** — the **authoritative active plan**. Locked decisions, final tree, build script design, step-by-step execution plan, and a **progress tracker (§18)** with which steps are done.
3. **`AGENTS.md`** — short contributor guidelines, commands, style.
4. **`SPEC.md`** — high-level project spec. **Currently in flux** during Phase 0; treat `specs/` as canonical for current direction until Phase 0 step 14 rewrites this file.
5. **`README.md`** — consumer-facing install instructions with the live `https://leshi-ui.pages.dev/v1/styles/{style}/r/{name}.json` registry URL. Trust these.

## Coding philosophy (binding)

1. **Mirror shadcn first.** Look at shadcn/ui's API and port to RN. Don't invent.
2. **Minimal dependencies.** Don't add npm deps without explicit user approval.
3. **Single-file components.** Like shadcn — self-contained `.tsx` per component. Split only when truly unreadable.
4. **Strict typing, no `any`.**
5. **Performance and a11y are non-negotiable.**
6. **Reuse via primitives**, not duplication.

## What to do next

If starting Phase 1 (StyleSheet flavor):

1. Open `specs/phase-1-stylesheet-foundations.md`.
2. Confirm the pre-flight checklist is satisfied on `main` HEAD.
3. Walk the user through the open questions section (theme switching API, color scheme listener, variants memoization, Tier 1 catalog scope, playground strategy, form integrations).
4. Once decisions are locked, draft the Phase 1 execution plan in that file (mirror Phase 0's §11 + §18 structure: numbered steps + a progress tracker).
5. Then execute, committing per logical step and updating the tracker after each commit.

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
