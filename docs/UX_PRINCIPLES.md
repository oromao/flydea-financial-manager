# FlyDea Financial Manager — Princípios de UX

## Visão Geral

Este documento define os princípios de experiência do usuário para o FlyDea Financial Manager. O objetivo é manter consistência visual e comportamental em todo o produto, garantindo que o usuário tenha uma experiência premium, intuitiva e sem fricção.

---

## Princípios Fundamentais

### 1. Mobile-First, Desktop-Derived

- **Regra:** Todo design começa pelo mobile (iPhone 16, 390x844)
- **Desktop:** Adaptações quando necessário, nunca o oposto
- **Viewport:** Foco em 320px-414px (mobile), 1280px+ (desktop)

### 2. Touch Targets Mínimos 44px

- **Botões, ícones clicáveis:** Mínimo 44x44px
- **Exceção:** Inputs podem ser menores, mas com hit area adequada
- **Por que:** WCAG 2.1 AA e experiência no dedo

### 3. Feedback Imediato

- **Toast:** Toda ação exibe toast de sucesso/erro
- **Loading:** Spinner ou skeleton durante carregamento
- **Confirmação:** Ações destrutivas usam `useConfirm()` (não `confirm()` nativo)
- **Animações:** 150-300ms para transições, não mais que isso

### 4. Consistência Visual

- **Cores:** Tokens do design system (não hardcoded)
- **Tipografia:** Uma família de fonte, pesos consistentes
- **Spacing:** Multiplos de 4px (4, 8, 12, 16, 24, 32, 48, 64)
- **Border Radius:** Padrão 8px-12px (não mixing diferentes)

### 5. Clareza sem Jargão

- **Termos:** Em português, definições oficiais (ver `docs/DOMAIN_RULES.md`)
- **Labels:** Autoexplicativos, sem abreviações quando possível
- **Notificações:** Mensagens amigáveis, não técnicas

---

## Padrões de Formulário

### Estrutura

```
┌─────────────────────────────────────┐
│ [Header com título e fechar] ✓      │  ← Sticky no mobile
├─────────────────────────────────────┤
│ [Seção: Dados Básicos]              │  ← Section headers
│  ├── Campo 1                        │
│  ├── Campo 2                        │
│  └── Campo 3                        │
│                                     │
│ [Seção: Detalhes de Pagamento]      │
│  ├── Campo 4                        │
│  └── Campo 5                        │
│                                     │
│ [Seção: Anexos]                     │
│  └── Upload                         │
├─────────────────────────────────────┤
│ [Botão: Salvar]    [Botão: Cancelar]│  ← Sticky no mobile quando键盘
└─────────────────────────────────────┘
```

### Regras

1. **Campos em grupos** — Não mais que 5-7 campos por seção
2. **Labels acima dos inputs** — Nunca ao lado no mobile
3. **Feedback inline** — Erros aparecem abaixo do campo (`FieldError` component)
4. **Validação Zod** — Nunca rely só no HTML `required`

---

## Padrões de Diálogos/Modais

### Mobile

- **Fullscreen:** `h-[100dvh]` no mobile
- **Header sticky:** Título + botão fechar sempre visível
- **Gesture:** Swipe down para fechar (Framer Motion drag)
- **Keyboard-aware:** Submit button não fica atrás do teclado

### Desktop

- **Centered:** Modal centralizado com backdrop blur
- **Tamanho:** Max 500px width, auto height
- **Fechar:** X button no header, click outside, ESC key

---

## Padrões de Loading

### Tipos de Loading

| Tipo | Quando Usar | Implementação |
|------|-------------|---------------|
| **Skeleton** | Carregamento inicial de página | `PageSkeleton`, `Skeleton` components |
| **Spinner** | Ação de botão/submit | `<Loader2 className="animate-spin" />` |
| **Progress** | Upload/download longo | `<Progress value={percent} />` |
| **Toast** | Ação em background | `useToast().loading()` |

### Regras

1. **Skeleton** para layout inicial
2. **Spinner** para ações de usuário
3. **Sem loading states travando** a UI por mais de 3s sem feedback
4. **Animações** respeitar `prefers-reduced-motion`

---

## Padrões de Navegação

### Mobile (Bottom Nav)

```
┌─────────────────────────────────────┐
│            CONTEÚDO                 │
├─────────────────────────────────────┤
│ [Home] [Movim.] [+] [Alertas] [Mais]│  ← 5 itens máx
└─────────────────────────────────────┘
```

- **Ícone + Label:** Sempre, nunca só ícone
- **Active state:** Indicador claro (não só `bg-secondary/10`)
- **Safe area:** Respeitar `env(safe-area-inset-bottom)`

### Desktop (Sidebar)

- **Ativo:** `bg-secondary/15` + left border accent
- **Hover:** `bg-secondary/10`
- **Transição:** 150ms ease

### Navigation Drawer (Mobile Expandido)

- Usar **slide-in sheet** para módulos secundários
- Sem menu hamburger que esconda tudo

---

## Padrões Visuais

### Cores (Design System Tokens)

```css
/* Backgrounds */
--color-background: #FFFFFF;
--color-surface: #F8FAFC;
--color-surface-variant: #F1F5F9;

/* Text */
--color-foreground: #0F172A;
--color-foreground-muted: #64748B;

/* Primary/Accent */
--color-primary: #3B82F6;
--color-primary-foreground: #FFFFFF;

/* Semantic */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;

/* Borders */
--color-border: #E2E8F0;
--color-outline: #94A3B8;
```

### Typography

- **Font:** Inter (padrão) ou sistema
- **Heading 1:** 24px, 700 weight
- **Heading 2:** 20px, 600 weight
- **Body:** 16px, 400 weight
- **Caption:** 14px, 400 weight

### Shadows

```css
/* Cards */
box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06);

/* Modais */
box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);

/* Premium Card */
box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
```

### Border Radius

- **Small:** 4px (inputs, badges)
- **Medium:** 8px (cards, buttons)
- **Large:** 12px (dialogs, modals)
- **Full:** 9999px (pills, avatars)

---

## O que Evitar

### Anti-patterns

| Prática | Problema | Alternativa |
|---------|----------|--------------|
| `confirm()` nativo | UI quebrada, não customizável | `useConfirm()` |
| Toast local por página | Duplicação, inconsistência | `useToast()` global |
| CSS hardcoded (gray-50) | Não segue design system | Tokens do theme |
| `window.location.reload()` | Perda de estado | Re-fetch com SWR |
| Form sem sections | Cognitivo overload | Group fields |
| Tabela no mobile junto cards | Duplicação, scroll horizontal | Cards only no mobile |
| Touch target < 44px | Dificuldade de clique | Min 44x44px |
| Zoom desabilitado | Acessibilidade | Remover `user-scalable=false` |

### Erros Comuns

1. **Sem empty state** — Usar `<EmptyState />` component
2. **Sem pagination** — Carregar tudo de uma vez (lento)
3. **Filtro que não filtra** — Apenas cosmetic, não muda dados
4. **Delete sem handler** — Botão non-functional
5. **Alert nativo** — Quebra experiência premium

---

## Acesso Rápido

| Componente | Caminho |
|------------|---------|
| Button | `src/components/ui/button.tsx` |
| Input | `src/components/ui/input.tsx` |
| Select | `src/components/ui/select.tsx` |
| Dialog | `src/components/ui/dialog.tsx` |
| Toast | `src/components/ui/toast.tsx` |
| EmptyState | `src/components/ui/empty-state.tsx` |
| Skeleton | `src/components/ui/skeleton.tsx` |
| ConfirmDialog | `src/components/ui/confirm-dialog.tsx` |
| PageWrapper | **A criar** (E6-T1) |
| MoneyInput | **A criar** (E6-T8) |
| LoadingButton | **A criar** (E6-T9) |

---

## Referências

- shadcn/ui: https://ui.shadcn.com/
- Auditoria UX: `docs/QA_CHECKLIST.md`
- Best Practices: `./BEST_PRACTICES.md`

---

*Última atualização: 2026-04-30*