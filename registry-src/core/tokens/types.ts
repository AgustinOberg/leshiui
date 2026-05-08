/**
 * Type-only re-exports for the semantic theme contract.
 *
 * Importing types from here (instead of `default.js`) makes intent explicit
 * — the consumer wants the contract, not the values — and is friendlier to
 * tools that strip type-only imports at build time.
 */
export type { Theme, ThemeName } from "./default.js"
