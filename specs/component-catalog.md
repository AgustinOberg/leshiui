# Component Catalog

Tier mapping and required-primitive matrix for every shadcn component as it lands in Leshi UI. Source: shadcn's components page, adapted for RN constraints. Lifted from the legacy `SPEC.md` Appendix A and kept here as the canonical catalog reference.

## Legend

Required primitives (a component "needs" a primitive if its implementation imports from there):

- **T** = tokens / unistyles init
- **P** = portal
- **O** = overlay (dismiss layer, scrim, outside-press)
- **Pos** = positioning (anchor, placement, collision)
- **F** = focus (trap / restore; web-first)
- **RF** = roving focus (keyboard navigation for menus / listbox)
- **K** = keyboard shortcuts (Esc, arrows, Enter, typeahead)
- **G** = gestures (drag / pan; native)
- **V** = virtualization (large lists / tables)
- **W** = web-first / web-only behavior

## Tiers

- **Tier 1** — simple, no portal / positioning required. Ship-first set.
- **Tier 2** — portal + basic overlay / positioning.
- **Tier 3** — complex focus / keyboard / gestures / composition.
- **Tier 4** — big feature components (data viz, complex widgets).

## Catalog

`Status` tracks whether the Unistyles-flavor implementation is considered production-ready by the maintainer. Docs-only signal; the registry still serves every item regardless.

| Component (shadcn) | Leshi UI item | Status | Tier | Required primitives | Platform notes / caveats |
|---|---|---|:---:|---|---|
| Accordion | accordion | not-ready | 2 | T, O, K (web), RF (web) | Native: implement as controlled collapsibles. Web: keyboard semantics. |
| Alert Dialog | alert-dialog | not-ready | 3 | T, P, O, F, K | Focus trap / restore on web; native uses modal-like behavior. |
| Alert | alert | not-ready | 1 | T | Simple presentational container. |
| Aspect Ratio | aspect-ratio | not-ready | 1 | T | Web: CSS aspect-ratio; native: layout trick with measured width / height. |
| Avatar | avatar | not-ready | 1 | T | Image loading states; fallback initials. |
| Badge | badge | not-ready | 1 | T | Pure presentational. |
| Breadcrumb | breadcrumb | not-ready | 2 | T, K (web) | Web: links + aria-current; native: navigation integration left to consumer. |
| Button Group | button-group | not-ready | 2 | T | Grouping + separators + consistent radii; optional roving focus on web. |
| Button | button | ready | 1 | T | shadcn v4 parity: 6 variants × 8 sizes, web hover + 3 px focus-visible ring, native scale-on-press, loading + disabled, `asChild` via Slot. |
| Calendar | calendar | not-ready | 4 | T, K, RF | Web: rich keyboard nav; native: must decide grid impl + locale formatting. |
| Card | card | not-ready | 1 | T | Pure presentational. |
| Carousel | carousel | not-ready | 4 | T, G, K (web) | Native gestures; web arrow keys; snapping. |
| Chart | chart | not-ready | 4 | T | SVG-based cross-platform recommended. |
| Checkbox | checkbox | not-ready | 2 | T, K (web) | Native: Pressable + icon. Web: role / aria-checked + space toggle. |
| Collapsible | collapsible | not-ready | 2 | T, K (web) | Single-item version of accordion. |
| Combobox | combobox | not-ready | 3 | T, P, O, Pos, RF, K, F (web) | Hard: typeahead, listbox semantics, IME. Native vs web differ heavily. |
| Command | command | not-ready | 3 | T, P, O, RF, K | Command palette pattern; web keyboard-first; native fallback acceptable. |
| Context Menu | context-menu | not-ready | 3 | T, P, O, Pos, RF, K (web) | Web: right-click + keyboard. Native: long-press trigger. |
| Data Table | data-table | not-ready | 4 | T, V, K (web) | Web-first features. Native: list / grid approximation. |
| Date Picker | date-picker | not-ready | 4 | T, P, O, Pos, K, RF | Native: platform picker or custom; web: calendar + input. |
| Dialog | dialog | ready | 3 | T, P, O, F, K | shadcn v4 parity: 10 exports, `@rn-primitives/dialog` peer (Radix on web → focus trap + scroll lock + ESC; native → BackHandler + accessibilityViewIsModal), close X via `@expo/vector-icons` Feather, subtle shadow. **Animations TBD** — Reanimated `asChild` + Radix slot merging drops styles; revisit in a follow-up. |
| Drawer | drawer | not-ready | 3 | T, P, O, G, K (web) | Native pan gestures; web: slide-in + focus management. |
| Dropdown Menu | dropdown-menu | not-ready | 3 | T, P, O, Pos, RF, K | Web semantics. Native: press trigger. |
| Empty | empty | not-ready | 1 | T | Empty-state component; content slots. |
| Field | field | not-ready | 2 | T | Forms system; presentational wrapper (label / help / error). |
| Form | form-core (+ form-rhf / form-tsf) | not-ready | 3 | T, K (web) | Core is presentational; integrations are optional items. |
| Hover Card | hover-card | not-ready | 3 | T, P, O, Pos, K (web) | Web-first. Native fallback: press-and-hold or omit hover semantics. |
| Input Group | input-group | not-ready | 2 | T | Addons, icons, button attachments. |
| Input OTP | input-otp | not-ready | 3 | T, K, F (web) | OTP UX differs by platform; handle paste, autofill hints, numeric keyboard. |
| Input | input | not-ready | 1 | T | Focus / disabled variants; web focus ring. |
| Item | item | not-ready | 2 | T | shadcn FormItem-like wrapper; part of form-core. |
| Kbd | kbd | not-ready | 1 | T | Web-first; on native render as pill text. |
| Label | label | not-ready | 2 | T | Web: label-for semantics not identical in RN; document recommended usage. |
| Menubar | menubar | not-ready | 3 | T, P, O, RF, K, F (web) | Web-first. Native may be limited and / or not shipped initially. |
| Native Select | native-select | not-ready | 2 | T | Web: `<select>` style equivalent. Native: platform picker. |
| Navigation Menu | navigation-menu | not-ready | 4 | T, P, O, Pos, RF, K, F (web) | Web-first mega-menu. Native nav is usually different; document as web-focused. |
| Pagination | pagination | not-ready | 2 | T, K (web) | Headless + UI; consumer wires data source / router. |
| Popover | popover | not-ready | 3 | T, P, O, Pos, F (web), K | Core overlay primitive; anchor measurement and collision required. |
| Progress | progress | not-ready | 1 | T | Determinate / indeterminate. |
| Radio Group | radio-group | not-ready | 3 | T, RF, K (web) | Web: roving tab index. Native: simple selection list. |
| Resizable | resizable | not-ready | 4 | T, W | Web-first; native support likely "not supported" or very limited. |
| Scroll Area | scroll-area | not-ready | 2 | T | Native uses ScrollView; web adds styled scrollbars optionally. |
| Select | select | not-ready | 3 | T, P, O, Pos, RF, K, F (web) | Like combobox; typeahead on web; native uses overlay list. |
| Separator | separator | not-ready | 1 | T | Horizontal / vertical. |
| Sheet | sheet | not-ready | 3 | T, P, O, F (web), K | Dialog variant; can share with drawer. |
| Sidebar | sidebar | not-ready | 4 | T, K (web) | Layout + responsive behavior; provide building blocks rather than monolith. |
| Skeleton | skeleton | not-ready | 1 | T | Animated shimmer optional; keep dependency-free. |
| Slider | slider | not-ready | 3 | T, G, K (web) | Native: gesture-driven. Web: arrow keys + aria-valuenow. |
| Sonner | sonner | not-ready | 3 | T, P, O, K (web) | Toast system; queue, stacking, dismiss. Name kept for parity. |
| Spinner | spinner | not-ready | 1 | T | Simple activity indicator wrapper. |
| Switch | switch | not-ready | 2 | T, K (web) | Web: role=switch. Native: Pressable / animated knob. |
| Table | table | not-ready | 2 (web) / 3 (native) | T, V | Web: real table-like rendering. Native: list / grid approximation. |
| Tabs | tabs | not-ready | 3 | T, RF, K (web) | Web semantics; native simpler but consistent API. |
| Textarea | textarea | not-ready | 1 | T | Wrap multiline TextInput. |
| Toast | toast | not-ready | 3 | T, P, O, K (web) | If both Toast and Sonner exist, define Toast as low-level primitive. |
| Toggle Group | toggle-group | not-ready | 3 | T, RF, K (web) | Multi / single selection; roving focus on web. |
| Toggle | toggle | not-ready | 2 | T | Pressable toggle; aria-pressed on web. |
| Tooltip | tooltip | not-ready | 3 | T, P, O, Pos, K (web) | Web: hover / focus. Native: long-press or press with delay. |
| Typography | typography | not-ready | 1 | T | Text presets (h1–h6, p, small, muted, etc.). |

## Appendix B — Tier 1 "must ship" set

These are recommended to land first in any new flavor (e.g., StyleSheet flavor in Phase 2) before tackling overlay-dependent components:

- tokens, typography
- button, button-group, input, textarea, input-group, label
- card, badge, alert, separator, avatar, skeleton, spinner, progress, empty
- (optional but high value) scroll-area, pagination

## Appendix C — Naming conventions

- Item name: `@leshi-ui/<item>`, kebab-case matching the component slug (e.g., `alert-dialog`, `radio-group`).
- Installed paths in consumer projects:
  - `lib/*` — tokens / primitives
  - `components/ui/*` — UI components
- Source filenames may stay PascalCase for files exporting a single React component (e.g. `PortalHost.tsx`); manifests transform to kebab-case for installed paths.
