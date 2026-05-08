# core/variants/

**`cva`-like variant helper for styling backends without built-in variants.**

> **Status: Phase 0 placeholder.** Folder reserved. Implementation lands in Phase 1 when the StyleSheet flavor needs it. See `specs/phase-1-stylesheet-foundations.md`.

## API contract (planned)

Mirrors `class-variance-authority`'s shape but operates on RN style objects, not class strings:

```ts
import { variants } from "@/lib/variants"

const button = variants({
  base: { paddingHorizontal: 16, borderRadius: 8 },
  variants: {
    variant: {
      default:     { backgroundColor: theme.colors.primary },
      destructive: { backgroundColor: theme.colors.destructive },
      outline:     { borderWidth: 1, borderColor: theme.colors.input },
    },
    size: {
      sm: { height: 36 },
      md: { height: 40 },
      lg: { height: 44 },
    },
  },
  compoundVariants: [
    { variant: "outline", size: "lg", style: { borderWidth: 2 } },
  ],
  defaultVariants: { variant: "default", size: "md" },
})

const styleArray = button({ variant: "outline", size: "lg" })
// → [base, outline-style, lg-size, outline+lg-compound]
```

## Why in `core/`

Used by every flavor whose backend doesn't ship variants (StyleSheet today; future NativeWind, restyle-style; etc.). The Unistyles flavor doesn't use it — Unistyles has its own variant system embedded in `StyleSheet.create`.

## Implementation constraints (for Phase 1)

- **Zero dependencies.** No `cva`, no `tailwind-merge`. Plain TypeScript + RN style object merging.
- **Strict types.** `VariantProps<typeof button>` extracts the union of valid variant inputs.
- **Stable output.** Returns the same array reference for the same inputs where possible (consider memoization keyed on the variants object identity).
