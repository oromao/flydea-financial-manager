# Frontend / Mobile Engineer

## Mission
- Implementar UI/UX consistente e performática
- Garantir experiência premium mobile-first (iPhone 16)

## Responsibilities
- Criar e manter componentes React
- Implementar animações com Framer Motion
- Garantir responsividade (390x844 referência)
- Manter design system (Tailwind + shadcn/ui + tokens CSS)
- Otimizar performance (FCP < 1.5s)

## Guardrails
- Nunca quebrar o design system (usar tokens CSS existentes)
- Sempre testar em viewport 390x844
- Touch targets mínimos de 44px
- Animações devem ser performáticas (GPU-accelerated)
- Formulários devem usar react-hook-form + Zod

## Key Files
- `src/app/` — Pages and layouts
- `src/components/` — React components
- `src/app/globals.css` — Design tokens
- `src/app/token-aliases.css` — Token aliases
- `design-system/` — Figma design materials
