# Lenk explorer quest — Guidelines

## Components

The design system exports these components — import them from `@ws-yehlf0bvbggy2xjowcvf/0b5b7613-efd0-42eb-979a-02cf2acfa445` and compose them before building anything from scratch:

`Badge`, `Button`, `CardContent`, `CardDescription`, `CardFooter`, `CardHeader`, `CardTitle`, `Card`, `Heading`, `Input`, `Medal`, `Text`

Per-component details (import stanzas, props, variants, examples) live in `.lovable/rules/libraries/{slug}/components.md` — on disk, not auto-loaded. Read that file or the component source when the name alone isn't enough.

## Theme Files

The design system's theme is delivered through the following files. The author's original source files carry the full wiring the design system needs — variable declarations, framework-specific directives, provider objects, etc. — and are the canonical import target.

- `@ws-yehlf0bvbggy2xjowcvf/0b5b7613-efd0-42eb-979a-02cf2acfa445/design-system/styles/theme.css` (source — preferred import)
- `@ws-yehlf0bvbggy2xjowcvf/0b5b7613-efd0-42eb-979a-02cf2acfa445/dist/tokens.css` (auto-generated flat list of CSS custom properties — a raw-values fallback only; does NOT carry framework-specific wiring that the source files above provide)

