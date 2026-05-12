# Frontend Guardrails

## Design System
- Usar tokens CSS existentes em globals.css e token-aliases.css
- Componentes shadcn/ui não devem ser modificados sem aprovação
- Novos componentes devem seguir o padrão existing

## Mobile-First
- Viewport de referência: iPhone 16 (390x844)
- Touch targets mínimos: 44px
- Bottom navigation para navegação principal
- Safe-area-insets para dispositivos com notch

## Performance
- Lazy loading para componentes abaixo da dobra
- Imagens otimizadas (next/image ou blurhash)
- Animações GPU-accelerated (transform, opacity)
- Bundle size monitoring

## Forms
- Sempre usar react-hook-form + Zod
- Feedback visual imediato para erros de validação
- Loading states para operações assíncronas
- Tratar erro de rede graciosamente
