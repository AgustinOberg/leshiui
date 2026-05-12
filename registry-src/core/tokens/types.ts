/**
 * Type-only re-exports for the semantic theme contract.
 *
 * Importing types from here (instead of a concrete theme file like
 * `shadcn-default.js`) makes intent explicit — the consumer wants the
 * contract, not the values — and is friendlier to tools that strip
 * type-only imports at build time. The `Theme` type is canonical: every
 * theme palette (shadcn-default, future shadcn-rose, custom brand palettes)
 * must produce values that satisfy it.
 */
export type { Theme, ThemeName } from "./shadcn-default.js"
