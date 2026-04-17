# Design Brief — SpendWise

## Purpose & Context
Premium fintech app for intelligent expense tracking and financial habit analysis. Users need confidence, clarity, and actionable insights in one glance.

## Tone
Refined minimalism with vibrant accents. Trustworthy yet modern, intelligent without being intimidating.

## Color Palette

| Token | OKLCH | Context |
|-------|-------|---------|
| Primary | `0.50 0.14 255` (dark) / `0.65 0.18 255` (light) | Deep teal/blue — primary CTAs, metric highlights |
| Secondary | `0.55 0.11 165` (dark) / `0.70 0.15 165` (light) | Emerald green — accent highlights, trends |
| Accent | `0.75 0.16 75` (dark) / `0.85 0.15 75` (light) | Warm amber — warnings, budget alerts |
| Background | `0.10 0` (dark) / `0.97 0` (light) | Deep navy (dark primary) / near-white |
| Foreground | `0.95 0` (dark) / `0.12 0` (light) | High-contrast text |
| Border | `0.22 0` (dark) / `0.88 0` (light) | Subtle card/input boundaries |

## Typography

| Role | Font | Scale |
|------|------|-------|
| Display | General Sans (600–700 weight) | 28–48px, heading hierarchy |
| Body | DM Sans (400–500 weight) | 14–16px, readable at all sizes |
| Mono | Geist Mono (400) | Data tables, code snippets |

## Shape & Radius
`0.75rem` (12px) default — modern, not over-rounded. Varies: 0 (sharp), 6px (compact), 12px (standard), 24px (prominent cards).

## Elevation & Depth
- `shadow-subtle`: 1px cards, inputs
- `shadow-elevated`: dashboard cards, modals
- No glow or neon shadows

## Structural Zones

| Zone | Background | Border | Purpose |
|------|------------|--------|---------|
| Header | `card` with `border-b` | `border` | Title, dark mode toggle |
| Sidebar | `sidebar` with `border-r` | `sidebar-border` | Navigation with gradient underlines for active state |
| Main Content | `background` | — | Expense list, dashboard grid |
| Metric Cards | `card` with `shadow-elevated` | subtle fade | Total, Monthly, Prediction values |
| Charts Container | `card` | `border` | Pie/line charts with chart color palette |
| Footer/Actions | `muted/40` with `border-t` | `border` | Buttons, action rows |

## Motion
- `transition-smooth` (0.3s) for state changes (card hover, sidebar active)
- `animation-fade-in` (0.3s) for new elements (metrics, chart data)
- `animation-slide-in-up` (0.4s) for modals/drawers
- `animation-pulse-soft` for loading states

## Component Patterns
- **Metrics**: Card + large number + subtext + gradient accent line
- **Expense Row**: Category badge + amount (right-aligned) + date + actions (hover)
- **Budget Bar**: Full-width progress with green/yellow/red zones
- **Chart**: Contained in card, responsive, vibrant palette
- **Button**: Primary (gradient-primary), Secondary (outline), Tertiary (ghost)
- **Input**: Subtle border, focus ring with primary color

## Constraints
- Dark mode as primary aesthetic — light mode inverts elegantly
- No generic purple gradients — strictly blue/teal/emerald/amber palette
- No random shadows — hierarchy through layering (card < elevated)
- Font pairing locked — do not add system fonts
- Max decoration: gradient underlines on sidebar, subtle card shadows

## Signature Detail
Gradient accent line beneath active sidebar nav item (teal → emerald) + subtle gradient underlines on metric cards to draw focus to key values without overwhelming the interface.

## Responsive Strategy
Mobile-first breakpoints (`sm`, `md`, `lg`). Sidebar collapses to drawer at `md`. Charts scale within card containers. Touch-friendly button sizing (44px+ min). Grid cards reflow from 1 col → 2 col → 3 col.
