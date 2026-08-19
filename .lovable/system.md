# Lenk Explorer Quest — Design System

An alpine trail-exploration design language: deep mountain blues, forest greens,
snow-bright surfaces, and gold reserved for earned rewards. Friendly, modern,
and legible outdoors in bright sunlight.

## Hard constraints

- Never write raw color, radius, or shadow literals (`#1A2B4C`, `rgb(...)`,
  `box-shadow: 0 1px ...`). Use the token-backed utilities: `bg-primary`,
  `text-text-muted`, `border-border`, `shadow-sm`, `rounded-2xl`.
  See `.lovable/rules/design-tokens.md` for the full set.
- Gold (`bg-gold` / `text-gold`) is **exclusively** for unlocked medals,
  trophies, and premium rewards. Never for ordinary buttons, links, or headers.
- No inline `style` attributes for styling; no ad-hoc CSS files.
- Compose the existing components (`Button`, `Card`, `Badge`, `Medal`,
  `Heading`, `Text`, `Input`) before writing a new primitive.
- Choose looks through `variant` / `size` props — never one-off boolean style
  props and never a near-duplicate component.

## Shape language

- Cards and modals: `rounded-2xl`.
- Buttons, inputs, selects: `rounded-xl`.
- Sector tags and status pills (Water, Summit, Culture): `rounded-full`.
- Elevation stays soft: `shadow-sm` at rest, `shadow-md` for raised or
  reward-bearing surfaces. Never harsh, high-opacity shadows.

## Typography

- Family: Plus Jakarta Sans, with Inter as fallback (`font-display` for
  headings, `font-sans` for body). Loaded via a `<link>` in the root route.
- Headings: bold, tight tracking, brand blue.
- Body: neutral weight, relaxed line-height for outdoor readability.

## Accessibility

- Build on semantic elements: `<button>` for actions, `<a>` for navigation,
  `<label>` bound to every input.
- Keep the visible focus ring (`focus-visible:ring-primary`) — never remove it.
- Icon-only controls need an `aria-label`.

## Usage patterns

```tsx
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@/design-system/lenk";

<Card>
  <CardHeader>
    <CardTitle>Simmefälle Trail</CardTitle>
    <Badge variant="trail">Water</Badge>
  </CardHeader>
  <CardContent>
    <Button variant="primary">Start quest</Button>
  </CardContent>
</Card>;
```