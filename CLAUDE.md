@AGENTS.md

## Claude Code specifics

- Auto memory at `~/.claude/projects/-Users-agustinoberg-Documents-GitHub-LeshiUI/memory/MEMORY.md` is loaded into every session and is canonical for durable user prefs (philosophy, autonomy, language). If memory contradicts a doc, memory wins — docs can drift mid-phase.
- Don't run `/init`; this repo is already initialized and the AI docs are hand-tuned.
- For phase work, draft the spec under `specs/phase-N-<slug>.md` mirroring Phase 0's structure (goal / non-goals / numbered steps / progress tracker) before touching code.
