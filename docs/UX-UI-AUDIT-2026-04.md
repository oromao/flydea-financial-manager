# Flydea Financial Manager — Full UX/UI Audit Report
**Date:** 2026-04-13
**Auditor:** Principal Product Designer + Senior Frontend Engineer + UX Auditor
**Scope:** All 15 pages, 14 UI components, shared layout, design tokens, responsiveness, mobile, accessibility

---

## Executive Summary

After a line-by-line code inspection of every page, component, and shared artifact in the Flydea Financial Manager, I identified **87 distinct UX/UI gaps** across the product. The system has a solid foundation — the design token system from the 2026-03 redesign is competent, the page structure is logical, and the component base exists. However, critical issues in feedback, responsiveness, state handling, interaction safety, and mobile ergonomics create a pervasive sensation of "MVP polished but not production-hard" that would undermine trust in a financial SaaS context.

---

## Part 1: Complete Gap Table

### Legend
| Column | Description |
|--------|-------------|
| ID | Unique identifier |
| Severity | 🔴 Critical / 🟡 High / 🟢 Medium / ⚪ Low |
| Type | Visual / Functional / Navigation / Accessibility / Feedback / Responsiveness |
| Complexity | 🟢 Low (local fix) / 🟡 Medium (shared refactor) / 🔴 High (new system) |
| Priority | P0 = Now / P1 = Next / P2 = Soon / P3 = Later |

---

### 1.0 SHARED / LAYOUT GAPS (affect all pages)

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| S-01 | No global loading state for page transitions | All | All | 🟡 High | Feedback | No loading indicator when navigating between pages via Next.js routing | User perceives slow transitions as broken; no feedback that navigation is happening | Layout lacks a top-level route change listener + spinner/skeleton | Add a `usePathname` listener in layout that shows a top progress bar or page skeleton on route change | 🟡 Medium | P1 | `src/app/layout.tsx` |
| S-02 | No error boundary for the app shell | All | All | 🔴 Critical | Functional | No `<ErrorBoundary>` wrapping children in layout; React errors crash the entire app with blank screen | User sees white screen, loses all context, cannot recover | Missing error boundary wrapper | Add React error boundary component around `<Sidebar>{children}</Sidebar>` | 🟢 Low | P0 | `src/app/layout.tsx` |
| S-03 | Sidebar hides on mobile but no transition animation | Mobile only | 320-767px | 🟡 High | Visual/UX | Sidebar simply disappears via `hidden md:flex`; no slide/hamburger transition | Feels abrupt and broken; no affordance for how to access navigation on mobile | No mobile menu overlay/drawer pattern implemented | Implement a hamburger-triggered slide-in drawer with backdrop blur for mobile nav (reuse navItems array) | 🟡 Medium | P0 | `src/components/sidebar.tsx` |
| S-04 | No skip-to-content link | All | All | 🟢 Medium | Accessibility | No `<a href="#main">` skip link for keyboard/screen reader users | Keyboard users must tab through entire sidebar before reaching content | Missing skip link pattern | Add skip link as first DOM element, visible on focus | 🟢 Low | P2 | `src/app/layout.tsx` |
| S-05 | Main content padding inconsistent across pages | All | All | 🟢 Medium | Visual | Some pages use `px-4 md:px-0`, some use no padding wrapper, some use `space-y-8`, others `space-y-16` | Visual inconsistency makes product feel assembled, not designed | Each page defines its own spacing instead of a page wrapper component | Create a `<PageWrapper>` component with consistent padding, max-width, and spacing tokens | 🟡 Medium | P1 | All page files |
| S-06 | No global offline indicator | All | All | 🟢 Medium | Feedback | No detection or display of network offline state | User may try to save data offline and lose it without knowing | Missing navigator.onLine listener | Add a thin banner in layout when `!navigator.onLine` | 🟢 Low | P3 | `src/app/layout.tsx` |
| S-07 | `maximumScale: 1, userScalable: false` blocks zoom | Mobile only | All | 🟡 High | Accessibility | Viewport meta disables pinch-to-zoom and text scaling | Users with visual impairments cannot enlarge text; violates WCAG 2.1 AA | Viewport config in `layout.tsx` | Remove `maximumScale` and `userScalable: false`; allow user zoom | 🟢 Low | P1 | `src/app/layout.tsx` |
| S-08 | No focus-visible ring style globally defined | All | All | 🟡 High | Accessibility | Tailwind config has `outline-primary/70` but no consistent focus-visible ring across interactive elements | Keyboard navigation has no visible focus indicator | Missing global focus-visible style in `globals.css` | Add `*:focus-visible:ring-2 *:focus-visible:ring-secondary *:focus-visible:ring-offset-2` to base layer | 🟢 Low | P1 | `src/app/globals.css` |

### 2.0 NAVIGATION GAPS (Sidebar + Bottom Nav + Mais)

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| N-01 | Bottom nav has 6 items including logout button crammed | Mobile only | 320-414px | 🟡 High | Navigation | 6 items (5 nav + logout) in bottom bar at ~412px width = ~68px per item, below 44px touch target minimum per WCAG | Accidental taps, frustration, logout too easy to hit by mistake | Too many items in bottom nav; logout should not share prime real estate | Move logout to Profile or Mais page; reduce to 4-5 items; ensure min 44px per tap target | 🟡 Medium | P1 | `src/components/bottom-nav.tsx` |
| N-02 | Bottom nav "Mais" page hides critical modules | Mobile only | All | 🟡 High | Information Architecture | Fluxo de Caixa, Fechamento, Recorrências, Relatórios, Logs, Aprovações all hidden behind secondary nav | Users must navigate 2+ taps to reach core features; discoverability near zero | Bottom nav has only 5 slots; no expandable menu pattern | Add a slide-up sheet or expandable menu from "Mais" that shows ALL modules with icons, not just cards | 🟡 Medium | P1 | `src/components/bottom-nav.tsx`, `src/app/mais/page.tsx` |
| N-03 | Active state in bottom nav uses subtle background fill that blends | Mobile only | All | 🟢 Medium | Visual | `bg-surface-variant/50` active indicator is low contrast on white surface | User may not know which page they're on | Low contrast active state | Use a more prominent active indicator (e.g., colored dot above icon, or bolder bg tint) | 🟢 Low | P2 | `src/components/bottom-nav.tsx` |
| N-04 | Sidebar active state uses `bg-secondary/10` which is very faint | Desktop only | 1280px+ | 🟢 Medium | Visual | Active nav item has barely perceptible blue tint at 10% opacity | Users scanning sidebar may miss which page they're on | Low opacity active background | Increase to `bg-secondary/15` or add a left border accent | 🟢 Low | P3 | `src/components/sidebar.tsx` |
| N-05 | No breadcrumb or page context indicator | All | All | ⚪ Low | Navigation | Pages have no breadcrumb or parent context; user doesn't know they're in "Admin" section | Minor orientation issue in nested routes like `/admin/logs` and `/admin/aprovacoes` | No breadcrumb component | Add simple breadcrumb for nested routes | 🟢 Low | P3 | `src/components/sidebar.tsx` |
| N-06 | Profile avatar in sidebar header has no link/tooltip | Desktop only | All | ⚪ Low | Navigation | Avatar is static; no hover state or link to profile | Missed affordance; users expect clicking avatar to go to profile | Missing link wrapper | Wrap avatar in `<Link href="/perfil">` with tooltip | 🟢 Low | P3 | `src/components/sidebar.tsx` |

### 3.0 DASHBOARD GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| D-01 | Chart area has no Y-axis label explaining the values | Desktop + Mobile | All | 🟢 Medium | Clarity | Y-axis shows "R$Xk" but no label saying "Receitas/Despesas (R$)" | User may misinterpret chart values | Missing axis label on Recharts YAxis | Add `label` prop to YAxis or a subtitle above chart | 🟢 Low | P2 | `src/app/page.tsx` |
| D-02 | Budget alerts banner links to /orcamentos but has no hover state beyond bg color | All | All | ⚪ Low | Feedback | Link is an `<a>` styled as banner; no underline or clear affordance | Users may not realize it's clickable | Missing cursor:pointer and visual affordance | Add `cursor-pointer` and subtle underline or arrow on hover | 🟢 Low | P3 | `src/app/page.tsx` |
| D-03 | "Top Gastos" bar width uses inline style that may not animate smoothly | Desktop + Mobile | All | ⚪ Low | Visual | `style={{ width: '${pct}%' }}` without Framer Motion or transition | Bar jumps instead of animating | No animation library used for bars | Use Framer Motion `motion.div` with `initial={{width: 0}}` | 🟢 Low | P3 | `src/app/page.tsx` |
| D-04 | Quick Actions cards are decorative, not actionable | All | All | 🟡 High | Functional | "Atividade Recente" card just describes what you'd find; "Registrar" just links to movimentacoes | Wasted prime real estate; user expects quick actions to actually work inline | Cards are informational, not interactive | Make "Registrar" open the movimentacao dialog directly from dashboard, or add quick-add buttons | 🟡 Medium | P2 | `src/app/page.tsx` |
| D-05 | No data freshness indicator | All | All | 🟢 Medium | Trust | Dashboard shows numbers but no "Last updated at" timestamp | User cannot verify if data is current or stale | No timestamp display | Add "Atualizado às HH:MM" below header subtitle | 🟢 Low | P2 | `src/app/page.tsx` |
| D-06 | Weekly cashflow forecast and spend decision load separately from dashboard metrics | All | All | 🟢 Medium | Performance | 3 separate API calls (dashboard, cashflow, decision) fire independently; each shows its own loading state | Staggered loading creates janky visual experience; multiple spinners at different times | No coordinated data fetching | Use `Promise.all` or React Suspense to coordinate loading | 🟡 Medium | P2 | `src/app/page.tsx` |

### 4.0 MOVIMENTAÇÕES GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| M-01 | Dialog form on mobile is fullscreen with no close affordance at top | Mobile only | 320-767px | 🔴 Critical | Navigation | Dialog goes full `h-[100dvh]` with close button at `top-4 right-4` but header area is form title, not a fixed top bar | User scrolls down in form and loses access to close button; trapped in form | Dialog header is not sticky; close button scrolls away | Add `sticky top-0` header bar with close button that stays visible | 🟢 Low | P0 | `src/app/movimentacoes/page.tsx`, `src/components/ui/dialog.tsx` |
| M-02 | Form has 12+ fields without sections or grouping | Desktop + Mobile | All | 🟡 High | Usability | All fields in single column: type toggle, description, amount, date, category, recurrence, payment status, due date, paid at, attachment, link, submit | Overwhelming wall of fields; cognitive overload on mobile especially | No field grouping or visual sections | Group into sections: "Dados Básicos", "Detalhes de Pagamento", "Anexos" with section headers | 🟢 Low | P1 | `src/app/movimentacoes/page.tsx` |
| M-03 | File upload input is hidden behind a styled div with `opacity-0` | Desktop + Mobile | All | 🟡 High | Accessibility | `<Input className="opacity-0 absolute inset-0">` overlaid on a styled div | Screen readers announce empty/hidden input; keyboard users cannot focus it | Fake file input pattern | Use a visible `<label>` linked to hidden input, or use `visibility: hidden` with proper aria-label | 🟢 Low | P1 | `src/app/movimentacoes/page.tsx` |
| M-04 | Delete uses `confirm()` browser dialog, not the ConfirmDialog component | All | All | 🟡 High | UX Consistency | `if (!confirm("Confirmar exclusão..."))` instead of `useConfirm()` | Browser confirm is jarring, ugly, inconsistent with the app's premium confirm dialog | Page uses native confirm instead of shared ConfirmDialog | Replace with `useConfirm()` from `@/components/ui/confirm-dialog` | 🟢 Low | P1 | `src/app/movimentacoes/page.tsx` |
| M-05 | Custom toast system duplicates the global ToastProvider | All | All | 🟡 High | Consistency | Page defines its own `toast` state + animation instead of using `useToast()` from providers | Two different toast styles exist in the app; this page's toasts disappear in 3s with no undo | Page has local toast implementation | Replace local toast with `useToast()` hook; use `undo` variant for delete actions | 🟢 Low | P1 | `src/app/movimentacoes/page.tsx` |
| M-06 | Table has no responsive breakpoint — cards exist below but table still renders | Mobile only | 320-767px | 🟡 High | Responsiveness | Table is wrapped in `px-4 md:px-0` but the `<Table>` component itself renders on mobile alongside cards | Users see double content: table (horizontally scrolled) + cards below | No `hidden md:block` on table wrapper | Add `hidden md:block` to the table container div | 🟢 Low | P0 | `src/app/movimentacoes/page.tsx` |
| M-07 | Search has 300ms debounce but no visual loading indicator during search | All | All | ⚪ Low | Feedback | `setTimeout(() => fetchTransactions(page), 300)` but no spinner while loading | User doesn't know search is in progress | Missing inline loading state on search | Add a small spinner inside search input during fetch | 🟢 Low | P3 | `src/app/movimentacoes/page.tsx` |
| M-08 | Pagination has no page numbers, only prev/next | All | All | 🟢 Medium | Usability | Only "Anterior" and "Próxima" buttons; no page 1, 2, 3 indicators | User cannot jump to specific pages; must click through sequentially | Simple prev/next pattern | Add page number buttons with ellipsis for large page counts | 🟢 Low | P2 | `src/app/movimentacoes/page.tsx` |
| M-09 | FAB button positioned at `bottom-24` may overlap with bottom nav on some devices | Mobile only | 320-414px | 🟡 High | Responsiveness | FAB at `bottom-24` (96px) but bottom nav is `h-[calc(4rem+env(safe-area-inset-bottom))]` (~64-90px with safe area) | FAB may sit directly on top of bottom nav or overlap it on devices with large safe areas | Fixed bottom offset doesn't account for safe-area-inset | Change to `bottom-[calc(4rem+env(safe-area-inset-bottom)+16px)]` | 🟢 Low | P0 | `src/app/movimentacoes/page.tsx` |
| M-10 | Export button opens URL directly, no loading/error feedback | All | All | 🟢 Medium | Feedback | `window.location.href = '/api/transactions/export?...'` — if export fails, user sees nothing | Silent failure; user doesn't know if export worked | Direct navigation with no error handling | Use `fetch()` with blob download; show loading spinner and error toast on failure | 🟡 Medium | P2 | `src/app/movimentacoes/page.tsx` |
| M-11 | Category filter and type filter and payment status filter = 3 separate filter rows | Desktop + Mobile | All | 🟢 Medium | Visual Density | Search bar + category select + type toggle group + payment status toggle group = 4 rows of filters | Excessive vertical space consumed by filters; user scrolls past content | No filter consolidation | Collapse into a single filter bar with a "Filters" button that opens a drawer/panel | 🟡 Medium | P2 | `src/app/movimentacoes/page.tsx` |
| M-12 | Amount input uses `type="number"` which shows spinner arrows in some browsers | Desktop only | All | ⚪ Low | Visual | `<Input type="number">` without suppressing spinners | Browser-native number spinners clash with design | Missing CSS to hide spinners | Add `[-moz-appearance:_textfield]` and `&::-webkit-outer-spin-button, &::-webkit-inner-spin-button { -webkit-appearance: none; }` | 🟢 Low | P3 | `src/app/movimentacoes/page.tsx` |

### 5.0 CONTAS GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| C-01 | Delete uses `confirm()` browser dialog | All | All | 🟡 High | UX Consistency | Same pattern as Movimentações — `if (!confirm("Remover esta conta?..."))` | Inconsistent with premium design system | Native confirm instead of ConfirmDialog | Replace with `useConfirm()` | 🟢 Low | P1 | `src/app/contas/page.tsx` |
| C-02 | No empty state component used — custom opacity-30 fallback | All | All | 🟢 Medium | Consistency | Uses inline `opacity-30` div with icon + text instead of `<EmptyState>` component | Empty state looks different from other modules | Page doesn't use shared EmptyState component | Replace with `<EmptyState icon={Wallet} title="Nenhuma conta" description="..." ctaLabel="Nova Conta" onCta={openDialog} />` | 🟢 Low | P2 | `src/app/contas/page.tsx` |
| C-03 | Color picker uses 8 hardcoded colors with no label | All | All | ⚪ Low | Usability | 8 color swatches with no "Cor" label or accessible names | Screen reader announces "button" 8 times with no context | Missing aria-labels on color buttons | Add `aria-label={`Selecionar cor ${color}`}` to each swatch | 🟢 Low | P3 | `src/app/contas/page.tsx` |
| C-04 | Account cards show "Ativo" status with pulse dot but no way to deactivate | All | All | 🟢 Medium | Functional | All accounts show as "Ativo" with green pulse; no deactivate/archive action | User cannot soft-delete or archive old accounts | Missing deactivate feature | Add archive/deactivate toggle in card actions | 🟡 Medium | P3 | `src/app/contas/page.tsx` |
| C-05 | Edit and delete buttons are `h-10 w-10` on desktop but `sm:h-8 sm:w-8` on mobile | Mobile only | 320-767px | 🟡 High | Touch Targets | Button shrinks from 40px to 32px on mobile — below 44px WCAG minimum | Touch targets too small for fingers | Responsive size makes them smaller on mobile where they need to be LARGER | Remove `sm:h-8 sm:w-8`; keep `h-11 w-11` minimum on mobile | 🟢 Low | P1 | `src/app/contas/page.tsx` |
| C-06 | Local toast instead of global ToastProvider | All | All | 🟡 High | Consistency | Same duplicate toast pattern as Movimentações | Two toast implementations | Page defines local toast state | Replace with `useToast()` | 🟢 Low | P1 | `src/app/contas/page.tsx` |

### 6.0 FLUXO DE CAIXA GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| F-01 | Page uses server component but WeeklyCashflow and InvoiceManager are client-only | All | All | ⚪ Low | Architecture | Page is `async function` (server) but children are all `"use client"` | No SSR benefit; could be a full client page | Mixed server/client pattern unnecessarily | Convert page to client component or keep as is (minor) | 🟢 Low | P3 | `src/app/fluxo-caixa/page.tsx` |
| F-02 | InvoiceManager uses native `alert()` for success/error | All | All | 🟡 High | Consistency | `alert("Nota criada com sucesso!")` and `alert("Erro ao criar nota")` | Browser alert breaks the premium UX; inconsistent with toast system | Uses native alert instead of useToast | Replace with `useToast().success()` and `useToast().error()` | 🟢 Low | P1 | `src/components/invoice-manager.tsx` |
| F-03 | InvoiceManager form uses plain HTML inputs, not shared Input component | All | All | 🟢 Medium | Consistency | `<input className="w-full px-3 py-2 border border-gray-300 rounded-md">` hardcoded gray styles | Form looks completely different from rest of app (gray vs design system) | Does not use shared Input/Select components | Replace all inputs with shared `<Input>` and `<Select>` components | 🟢 Low | P1 | `src/components/invoice-manager.tsx` |
| F-04 | InvoiceManager form has no validation feedback | All | All | 🟢 Medium | Usability | Only `required` attributes; no custom validation messages or field errors | User sees browser default validation which clashes with design | Missing FieldError component usage | Add Zod validation + FieldError for each field | 🟡 Medium | P2 | `src/components/invoice-manager.tsx` |
| F-05 | InvoiceManager form is very long on mobile with no sticky submit | Mobile only | 320-767px | 🟢 Medium | Usability | Installment section can produce 12+ rows of inputs; submit button at very bottom | User scrolls for a long time to submit; may lose context | No sticky action button | Add sticky bottom bar with submit button when form is open | 🟡 Medium | P2 | `src/components/invoice-manager.tsx` |
| F-06 | WeeklyCashflow component uses hardcoded gray/gray-50/gray-100 colors | All | All | 🟢 Medium | Visual Consistency | Classes like `bg-gray-50`, `border-gray-200`, `text-gray-900`, `text-gray-600` | Completely different color palette from the design system tokens | Component was built before the design system tokens | Replace all gray-* with design system tokens (surface, on-surface, outline, etc.) | 🟢 Low | P1 | `src/components/weekly-cashflow.tsx` |
| F-07 | WeeklyCashflow monthly summary section has no visual distinction from weekly section | All | All | ⚪ Low | Visual Hierarchy | Monthly summary at bottom uses same `bg-gray-100` card style | User may confuse weekly vs monthly sections | No visual separation between sections | Add a divider or different card style for monthly summary | 🟢 Low | P3 | `src/components/weekly-cashflow.tsx` |

### 7.0 CONTAS A PAGAR (PENDÊNCIAS) GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| P-01 | Filter buttons don't actually filter — sections always show all content | All | All | 🔴 Critical | Functional | Filter buttons set `filter` state, but sections check `filter !== "all" && filter !== "overdue"` to show placeholder text — actual items ALWAYS render regardless of filter | Filter buttons are misleading; user clicks "Atrasadas" but sees all sections with empty placeholders | Filter logic only controls placeholder text, not actual data rendering | Fix filter to actually filter the displayed items: when "overdue" selected, only show overdue section | 🟢 Low | P0 | `src/app/contas-a-pagar/page.tsx` |
| P-02 | Partial payment inline inputs are plain HTML, not shared Input component | All | All | 🟢 Medium | Consistency | `<input className="h-9 w-32 rounded-xl border border-outline/30 bg-surface px-3 text-xs">` | Inconsistent styling with rest of app | Not using shared Input component | Replace with `<Input className="h-9 w-32 text-xs" />` | 🟢 Low | P2 | `src/app/contas-a-pagar/page.tsx` |
| P-03 | No confirmation when marking a pending expense as paid | All | All | 🟡 High | Safety | `onClick={() => updatePaymentStatus(t.id, "PAID")}` fires immediately with no confirm | Accidental tap marks expense as paid with no undo | Missing confirmation step | Use `useConfirm()` before marking as paid, OR use `useToast().undo()` with 5s undo window | 🟡 Medium | P1 | `src/app/contas-a-pagar/page.tsx` |
| P-04 | "Atualizar" button just re-fetches — no loading state | All | All | ⚪ Low | Feedback | Button has no spinner or disabled state during fetch | User may click multiple times | Missing loading/disabled state | Add `loading` state and disable button during fetch | 🟢 Low | P3 | `src/app/contas-a-pagar/page.tsx` |
| P-05 | Three sections (Atrasadas, Vencem em breve, Sem vencimento) stack vertically with no collapse | Desktop + Mobile | All | 🟢 Medium | Visual Density | All 3 sections always expanded; each has its own card with header | Long page requiring excessive scrolling | No accordion/collapse pattern | Make sections collapsible with accordion pattern; default expand the most relevant one | 🟢 Low | P2 | `src/app/contas-a-pagar/page.tsx` |
| P-06 | Overdue card uses `border-red-100 bg-red-50/20` per-item AND section card | All | All | ⚪ Low | Visual | Double red styling — section card AND individual items are red-tinted | Visual noise; too much red | Redundant color application | Remove per-item bg color; keep section-level color | 🟢 Low | P3 | `src/app/contas-a-pagar/page.tsx` |

### 8.0 ORÇAMENTOS GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| O-01 | Delete uses `confirm()` browser dialog | All | All | 🟡 High | UX Consistency | `if (!confirm("Remover este orçamento?"))` | Same inconsistency pattern as other pages | Native confirm | Replace with `useConfirm()` | 🟢 Low | P1 | `src/app/orcamentos/page.tsx` |
| O-02 | Alert threshold slider has no visual tick marks or labels | All | All | 🟢 Medium | Usability | `<Input type="range">` with only "Mínimo" and "Crítico" labels at extremes | User cannot precisely set alert threshold; no intermediate feedback | Missing step indicators on range input | Add visual tick marks or a live percentage display on the slider thumb | 🟢 Low | P2 | `src/app/orcamentos/page.tsx` |
| O-03 | Budget bar animation uses `motion.div` but resets on every render | All | All | ⚪ Low | Visual | `initial={{ width: 0 }} animate={{ width: '${pct}%' }}` re-triggers on every re-render | Bar animates from 0 every time data refreshes, even slightly | No `key` or `shouldReduceMotion` check | Add `key={budget.id}` and respect `prefers-reduced-motion` | 🟢 Low | P3 | `src/app/orcamentos/page.tsx` |
| O-04 | No budget creation date range selector (always current month) | All | All | 🟢 Medium | Functional | Budgets are "MONTHLY" or "YEARLY" but no way to see previous periods' budget performance | User cannot compare budget usage over time | Missing period selector | Add month selector to view budget performance for past months | 🟡 Medium | P3 | `src/app/orcamentos/page.tsx` |
| O-05 | Local toast instead of global ToastProvider | All | All | 🟡 High | Consistency | Same duplicate toast pattern | Three pages now with local toasts | Page defines local toast | Replace with `useToast()` | 🟢 Low | P1 | `src/app/orcamentos/page.tsx` |

### 9.0 RECORRÊNCIAS GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| R-01 | Delete button has no onClick handler — does nothing | All | All | 🔴 Critical | Functional | `<Button variant="ghost" size="icon" className="..."><Trash2 /></Button>` — no onClick prop! | Delete button is completely non-functional; user clicks and nothing happens | Missing onClick handler | Add `onClick={() => handleDelete(rec.id)}` and implement the delete handler | 🟢 Low | P0 | `src/app/recorrencias/page.tsx` |
| R-02 | No delete handler function defined | All | All | 🔴 Critical | Functional | No `handleDelete` or similar function exists in the component | Even if onClick were added, there's no logic to execute | Missing function entirely | Implement `handleDelete` with confirm dialog and API call | 🟢 Low | P0 | `src/app/recorrencias/page.tsx` |
| R-03 | Dialog form has no reset on open — retains previous values when re-opening | All | All | 🟢 Medium | Usability | `onOpenChange={setIsDialogOpen}` without reset callback | User opens dialog, closes, reopens — may see stale form state | Missing reset on open | Add reset call when dialog opens: `onOpenChange={(v) => { setIsDialogOpen(v); if (v) resetForm(); }}` | 🟢 Low | P2 | `src/app/recorrencias/page.tsx` |
| R-04 | Toggle pause/reactivate has no confirmation or feedback toast | All | All | 🟢 Medium | Feedback | `toggleRecurrence` fires silently with no toast or confirm | User toggles but gets no visual feedback that it worked | Missing toast notification | Add `useToast().success()` after toggle | 🟢 Low | P2 | `src/app/recorrencias/page.tsx` |
| R-05 | Frequency select only has MONTHLY and WEEKLY — no BIWEEKLY or YEARLY | All | All | ⚪ Low | Functional | Only two options in frequency select | User with biweekly or yearly subscriptions cannot model them correctly | Limited frequency options | Add BIWEEKLY and YEARLY options (requires backend support) | 🟡 Medium | P3 | `src/app/recorrencias/page.tsx` |

### 10.0 FECHAMENTO GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| FE-01 | Period selector buttons overflow horizontally on mobile with no scroll handling | Mobile only | 320-414px | 🟡 High | Responsiveness | 4 buttons in a flex row with `overflow-x-auto pb-1` but no visible scroll indicator or snap | User may not realize more buttons exist off-screen | Horizontal scroll with no affordance | Add snap scrolling or convert to a dropdown/select on mobile | 🟢 Low | P1 | `src/app/fechamento/page.tsx` |
| FE-02 | Export buttons navigate directly with no loading or error feedback | All | All | 🟢 Medium | Feedback | `window.location.href = /api/fechamento/export?...` same pattern as Movimentações export | Silent failure if export endpoint errors | Direct navigation | Use fetch + blob download with loading state and error toast | 🟡 Medium | P2 | `src/app/fechamento/page.tsx` |
| FE-03 | No transaction list/detail — only summary cards | All | All | 🟢 Medium | Functional | Page shows 6 summary cards + 3 status cards but no actual transaction breakdown | User sees totals but cannot see what makes up the numbers | Missing detail view | Add a collapsible transaction list below each summary card | 🟡 Medium | P2 | `src/app/fechamento/page.tsx` |
| FE-04 | "1 mês atrás" label is grammatically incorrect — should be "1 mês anterior" | All | All | ⚪ Low | Microcopy | Button text: `${p} mês${p === "1" ? "" : "es"} atrás` produces "1 mês atrás" | Minor language issue | String template | Change to "Mês anterior" for p=1 | 🟢 Low | P3 | `src/app/fechamento/page.tsx` |

### 11.0 RELATÓRIOS GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| RE-01 | Pie chart labels overlap heavily on mobile | Mobile only | 320-767px | 🟡 High | Visual | Recharts Pie with `label={({ name, percent }) => ${name} ${((percent || 0) * 100).toFixed(0)}%}` — labels render inside the chart area | On small viewports, labels overlap and are unreadable | No responsive label sizing or external legend | Hide labels on mobile; show external legend instead, or use a donut with center summary | 🟡 Medium | P1 | `src/app/relatorios/page.tsx` |
| RE-02 | Bar chart X-axis labels truncate at 10 chars with ellipsis | All | All | 🟢 Medium | Clarity | `name.length > 10 ? name.slice(0, 10) + "…" : name` | Category names get cut off; user cannot see full name | Hardcoded truncation | Use full names with rotated labels or a tooltip on hover/tap | 🟢 Low | P2 | `src/app/relatorios/page.tsx` |
| RE-03 | handlePrint uses `window.print()` but no print styles exist | All | All | 🟢 Medium | Functional | `onClick={handlePrint}` triggers browser print but `no-print` class only hides the page wrapper | Printed output is unstyled, shows navigation, colors wrong | Missing `@media print` styles | Add print stylesheet in globals.css: hide nav, adjust colors for print, ensure text is black | 🟢 Low | P2 | `src/app/globals.css`, `src/app/relatorios/page.tsx` |
| RE-04 | Charts container height is fixed at 300px, too tall on mobile | Mobile only | 320-767px | 🟢 Medium | Responsiveness | `height={300}` on ResponsiveContainer | Chart takes 300px on a 320px wide screen — disproportionate | Fixed height | Use responsive height: `height={isMobile ? 200 : 300}` | 🟢 Low | P2 | `src/app/relatorios/page.tsx` |
| RE-05 | Expense distribution list has max-w-[120px] mini progress bars that are too small to read | All | All | ⚪ Low | Visual | `max-w-[120px]` on progress bar within each list item | Mini bars are decorative rather than informative | Bar too small | Increase to `max-w-[200px]` or make proportional to row width | 🟢 Low | P3 | `src/app/relatorios/page.tsx` |

### 12.0 LOGS GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| L-01 | Table has no pagination — all logs render at once | Desktop + Mobile | All | 🔴 Critical | Performance | `filteredLogs.map((log) => ...)` renders every log in a single table | With 100+ logs, page becomes extremely slow and long to render | No pagination or virtualization | Add pagination (e.g., 25 per page) or infinite scroll | 🟡 Medium | P0 | `src/app/admin/logs/page.tsx` |
| L-02 | Table cells use `sm:px-10` padding making it extremely wide on desktop | Desktop only | 1280px+ | 🟢 Medium | Visual | `px-4 sm:px-10` on first and last columns | Table is excessively wide; causes horizontal scroll on medium screens | Over-padded cells | Reduce to `px-4 lg:px-6` | 🟢 Low | P2 | `src/app/admin/logs/page.tsx` |
| L-03 | No empty state — just "Nenhum log encontrado" plain text | All | All | ⚪ Low | Consistency | Plain text empty state instead of `<EmptyState>` component | Inconsistent with other modules | Missing EmptyState usage | Replace with shared EmptyState component | 🟢 Low | P3 | `src/app/admin/logs/page.tsx` |
| L-04 | Action filter and entity filter are hardcoded with limited options | All | All | ⚪ Low | Functional | Action select has CREATE, UPDATE, DELETE, IMPORT hardcoded; entity filter depends on existing data | If new action types are added to backend, they won't appear in filter | Static filter options | Fetch unique actions and entities from API for dynamic filter options | 🟡 Medium | P3 | `src/app/admin/logs/page.tsx` |

### 13.0 APROVAÇÕES GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| A-01 | Approve/Reject buttons have no loading state or confirmation | All | All | 🔴 Critical | Safety | `handle(item.id, "APPROVE")` fires immediately with no confirm, no loading, no error feedback | Accidental approval/rejection with no undo; network errors silently fail | No confirm dialog, no loading state, no error handling | Add useConfirm() + loading state + error toast for approve/reject actions | 🟡 Medium | P0 | `src/app/admin/aprovacoes/page.tsx` |
| A-02 | No empty state when there are no pending approvals | All | All | 🟢 Medium | Consistency | When `items` is empty, page shows nothing (just header) | User sees blank page and doesn't know if it loaded or is empty | Missing empty state | Add `<EmptyState icon={ShieldCheck} title="Sem aprovações pendentes" description="Tudo em ordem!" />` | 🟢 Low | P2 | `src/app/admin/aprovacoes/page.tsx` |
| A-03 | No filter or search — all approvals shown in raw order | All | All | 🟢 Medium | Usability | No search, no filter by status, no sort by date | User cannot find a specific approval in a long list | Missing filtering | Add search + status filter + date sort | 🟡 Medium | P2 | `src/app/admin/aprovacoes/page.tsx` |
| A-04 | Date column missing — no createdAt display in approval cards | All | All | ⚪ Low | Information | Approval cards show entity, action, status, reason, requester — but NOT when it was created | User cannot tell how old a pending approval is | Missing date display | Add formatted `createdAt` to each card | 🟢 Low | P3 | `src/app/admin/aprovacoes/page.tsx` |
| A-05 | Page has no role check — non-admin users can access it | All | All | 🟡 High | Security | Unlike Logs page which checks `session?.user?.role !== "ADMIN"`, Aprovações has NO access control | Any authenticated user can see and act on approvals | Missing auth check | Add same admin role guard as Logs page | 🟢 Low | P0 | `src/app/admin/aprovacoes/page.tsx` |

### 14.0 PERFIL GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| PE-01 | Save triggers `window.location.reload()` — full page refresh | All | All | 🟡 High | UX Quality | `window.location.reload()` after save | Harsh full-page reload; loses scroll position, feels broken | No optimistic update or toast confirmation | Replace with toast success + re-fetch profile without reload | 🟡 Medium | P1 | `src/app/perfil/page.tsx` |
| PE-02 | No feedback toast or message when save succeeds or fails | All | All | 🟡 High | Feedback | Save function has try/finally but no success or error notification | User clicks save and sees no confirmation that it worked | Missing toast | Add `useToast().success("Perfil salvo!")` on success, `.error()` on failure | 🟢 Low | P1 | `src/app/perfil/page.tsx` |
| PE-03 | No loading state on save button beyond text change | All | All | 🟢 Medium | Feedback | Button shows "Salvando…" text but no spinner icon | Subtle feedback; user may not notice text change | Missing spinner | Add `<Loader2 className="w-4 h-4 animate-spin mr-2" />` when saving | 🟢 Low | P2 | `src/app/perfil/page.tsx` |
| PE-04 | "Recarregar" button uses Trash2 icon — confusing affordance | All | All | 🟢 Medium | Visual/Affordance | `<Trash2 className="w-4 h-4 mr-2" /> Recarregar` — trash icon for reload action | User may think this deletes something, not reloads | Wrong icon | Replace Trash2 with `<RefreshCw />` | 🟢 Low | P2 | `src/app/perfil/page.tsx` |
| PE-05 | Email field is disabled but no explanation why | All | All | ⚪ Low | Usability | `<Input value={email} disabled>` with no helper text | User may wonder why they can't change email | Missing microcopy | Add "Email não pode ser alterado" below the field | 🟢 Low | P3 | `src/app/perfil/page.tsx` |
| PE-06 | Avatar upload has no error handling | All | All | 🟢 Medium | Robustness | `uploadAvatar` has try/finally but no catch — if upload fails, user sees nothing | Silent failure on avatar upload | Missing error catch | Add catch block with toast error | 🟢 Low | P2 | `src/app/perfil/page.tsx` |

### 15.0 LOGIN GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| LG-01 | No "forgot password" flow | All | All | 🟡 High | Functional | Login form has email + password only; no password recovery link | User who forgets password is stuck with no recovery path | Missing password reset feature | Add "Esqueci minha senha" link (even if just mailto for now) | 🟡 Medium | P2 | `src/app/login/page.tsx` |
| LG-02 | No "remember me" or session persistence control | All | All | ⚪ Low | Functional | No checkbox for session duration | User must re-login every session | Missing remember me pattern | Add "Lembrar-me" checkbox that sets longer session expiry | 🟡 Medium | P3 | `src/app/login/page.tsx` |
| LG-03 | Error message shows raw NextAuth error string | All | All | 🟢 Medium | UX Quality | `setError(res.error)` displays whatever NextAuth returns | User may see technical error like "CredentialsSignin" instead of friendly message | Raw error passthrough | Map NextAuth errors to user-friendly messages | 🟢 Low | P2 | `src/app/login/page.tsx` |
| LG-04 | Password input has no visibility toggle | All | All | ⚪ Low | Usability | `type="password"` with no show/hide toggle | User cannot verify what they typed before submitting | Missing toggle | Add eye icon toggle for password visibility | 🟢 Low | P3 | `src/app/login/page.tsx` |

### 16.0 ALERTAS GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| AL-01 | Mark all read and clear read fire multiple sequential API calls without batch | All | All | 🟢 Medium | Performance | `Promise.all(notifications.filter(...).map((n) => markRead(n.id, true)))` — one API call per notification | With 50 notifications, 50 parallel requests fire at once | No batch endpoint | Create a single PATCH /api/notifications/mark-all endpoint | 🟡 Medium | P2 | `src/app/alertas/page.tsx` |
| AL-02 | Delete notification has no undo or confirmation | All | All | 🟢 Medium | Safety | Trash button fires `remove(n.id)` immediately | Accidental deletion with no recovery | Missing confirm/undo | Wrap in useConfirm() or use undo toast | 🟢 Low | P2 | `src/app/alertas/page.tsx` |
| AL-03 | Search is client-side on all loaded data — no debouncing | All | All | ⚪ Low | Performance | `notifications.filter(...)` on every keystroke | With many notifications, search may lag slightly | No debounce on search | Add 200ms debounce to search input | 🟢 Low | P3 | `src/app/alertas/page.tsx` |

### 17.0 MAIS PAGE GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| MA-01 | Cards have "Abrir" button but entire card is not clickable | All | All | 🟢 Medium | Affordance | Only the "Abrir" button is a link; the card body is not | User expects to click anywhere on the card to navigate | Partial clickable area | Wrap entire card in `<Link>` or add `onClick` to card div | 🟢 Low | P2 | `src/app/mais/page.tsx` |
| MA-02 | No icon differentiation — all cards use same secondary/10 bg style | All | All | ⚪ Low | Visual | Every shortcut card has identical `bg-secondary/10 text-secondary` icon container | Cards look homogeneous; no visual scanning aid | Same color for all icons | Use distinct colors per module (matching sidebar active colors) | 🟢 Low | P3 | `src/app/mais/page.tsx` |

### 18.0 COMPONENT / DESIGN SYSTEM GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| DS-01 | Button component has `rounded-full` but all pages use `rounded-lg` or `rounded-xl` overrides | All | All | 🟢 Medium | Consistency | Button default is `rounded-full` but pages override with `rounded-lg`, `rounded-xl`, `rounded-2xl` everywhere | Design system default is never used; pages fight it | Button default shape doesn't match page design language | Change button default to `rounded-lg` to match page usage | 🟢 Low | P2 | `src/components/ui/button.tsx` |
| DS-02 | Dialog on mobile is full-screen with no drag-to-dismiss or swipe-down | Mobile only | 320-767px | 🟡 High | Mobile UX | Dialog is `h-[100dvh]` on mobile with no gesture dismissal | User must scroll to find X button; no intuitive close gesture | Missing swipe-to-close on mobile dialog | Add Framer Motion drag gesture to swipe dialog down to close | 🟡 Medium | P1 | `src/components/ui/dialog.tsx` |
| DS-03 | Table component wraps in `overflow-x-auto` but no scroll indicator | All | All | 🟢 Medium | Usability | `<div className="relative w-full overflow-x-auto">` around table | User may not know table scrolls horizontally on smaller screens | No visual affordance for horizontal scroll | Add a subtle fade gradient on the right edge to indicate more content | 🟢 Low | P3 | `src/components/ui/table.tsx` |
| DS-04 | Toast component uses hardcoded colors (emerald-400, rose-400) not design tokens | All | All | 🟢 Medium | Consistency | `text-emerald-400`, `bg-emerald-400` hardcoded in toast icons and progress bars | Toast colors don't match app's semantic color palette | Hardcoded colors instead of tokens | Map to design tokens or use CSS variables for toast colors | 🟢 Low | P2 | `src/components/ui/toast.tsx` |
| DS-05 | EmptyState uses `glass-card` class that may not exist in globals.css | All | All | 🟡 High | Broken UI | `className="glass-card rounded-[32px] p-12"` — `glass-card` is NOT defined in globals.css | EmptyState renders unstyled or with missing styles | Reference to non-existent CSS class | Define `.glass-card` in globals.css OR replace with `premium-card` | 🟢 Low | P0 | `src/components/ui/empty-state.tsx` |
| DS-06 | No dedicated LoadingButton component | All | All | 🟢 Medium | DX/Consistency | Every page manually handles loading state on buttons (text change, disabled) | Inconsistent loading patterns across pages | No LoadingButton component | Create `<LoadingButton loading={saving} spinner={<Loader2 />}>Salvar</LoadingButton>` | 🟢 Low | P2 | New component |
| DS-07 | No dedicated MoneyInput component with currency formatting | All | All | 🟡 High | UX Quality | Every page uses `type="number"` with `step="0.01"` — no BRL formatting | User enters "1000" but sees "1000" not "R$ 1.000,00" — no formatting guidance | Missing MoneyInput component | Create `<MoneyInput value={raw} onChange={setRaw} formatted={formatted} />` with Intl.NumberFormat | 🟡 Medium | P2 | New component |
| DS-08 | Skeleton components use `bg-muted` which is not defined in theme | All | All | 🟡 High | Broken UI | `className="animate-pulse rounded-md bg-muted"` — `--color-muted` is NOT in the Tailwind theme | Skeletons render invisible or wrong colored | Missing muted color token | Add `--color-muted: #E5E5EA` to theme OR replace `bg-muted` with `bg-surface-variant` | 🟢 Low | P0 | `src/components/ui/skeleton.tsx` |
| DS-09 | FilterChips component uses hardcoded `bg-white/5` and `bg-primary/20` | All | All | 🟢 Medium | Consistency | Filter chips use `bg-white/5` and `bg-primary/20` which assume dark mode patterns | Colors may not work well in the light-dominant design system | Hardcoded white/primary values | Map to design system tokens (surface-variant, secondary, etc.) | 🟢 Low | P2 | `src/components/ui/filter-chips.tsx` |
| DS-10 | ConfirmDialog uses `glass-card` class (same issue as EmptyState) | All | All | 🟡 High | Broken UI | `className="glass-card rounded-3xl p-6"` — class not defined | Confirm dialog may render unstyled | Same non-existent CSS class | Define `.glass-card` or use `premium-card` | 🟢 Low | P0 | `src/components/ui/confirm-dialog.tsx` |

### 19.0 MOBILE-SPECIFIC GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| MB-01 | No mobile navigation for 10 hidden modules (Fluxo de Caixa, Fechamento, Recorrências, Relatórios, Logs, Aprovações, Alertas, Perfil, Orçamentos) | Mobile only | 320-767px | 🔴 Critical | Navigation | Bottom nav only shows 5 items; "Mais" is a page with cards, not a nav pattern | 67% of modules are 2+ taps away on mobile; extremely poor discoverability | No mobile drawer or expandable nav | Implement a hamburger menu in mobile header OR expand "Mais" into a full-screen nav sheet | 🟡 Medium | P0 | `src/components/sidebar.tsx`, `src/components/bottom-nav.tsx` |
| MB-02 | Dialog forms on mobile are full-screen but keyboard covers submit button | Mobile only | 320-767px | 🔴 Critical | Mobile UX | On iOS/Android, virtual keyboard pushes content up; submit button at bottom of long forms goes behind keyboard | User cannot see or tap submit button while typing | No scroll-into-view or keyboard-aware layout | Add `scrollIntoView` on focus, or make submit button sticky at bottom of dialog | 🟡 Medium | P0 | All pages with dialogs |
| MB-03 | Tables in Movimentacoes, Logs don't adapt to mobile at all | Mobile only | 320-767px | 🟡 High | Responsiveness | Table cells have `whitespace-nowrap` and fixed padding; forces horizontal scroll | User must scroll horizontally to see all columns — terrible on 320px | No card-view transformation for mobile tables | On mobile, transform table rows into card layout (already done for Movimentações but not Logs) | 🟡 Medium | P1 | `src/app/admin/logs/page.tsx` |
| MB-04 | Charts in Relatórios and Dashboard are too dense on mobile | Mobile only | 320-767px | 🟢 Medium | Responsiveness | Recharts with fixed axis labels, tooltips, and grid lines crammed into 320px | Charts are unreadable on narrow screens | No mobile-specific chart configuration | Reduce chart height, hide grid lines, simplify labels on mobile | 🟢 Low | P2 | `src/app/page.tsx`, `src/app/relatorios/page.tsx` |
| MB-05 | Stats cards grid uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — single column on 320px | Mobile only | 320-414px | 🟢 Medium | Responsiveness | 4 stat cards stack vertically on mobile, consuming entire viewport height | User must scroll through 4 full-width cards to see content below | No 2-column grid on small mobile | Use `grid-cols-2` on all viewports for stat cards, adjust font sizes | 🟢 Low | P2 | All pages with stat grids |
| MB-06 | Bottom nav safe-area-inset-bottom may not work on Android | Mobile only | Android | 🟢 Medium | Responsiveness | `h-[calc(4rem+env(safe-area-inset-bottom))]` — Android Chrome doesn't support env(safe-area-inset) | Nav may overlap Android gesture bar | iOS-only CSS | Add fallback: `padding-bottom: max(0.5rem, env(safe-area-inset-bottom))` | 🟢 Low | P2 | `src/components/bottom-nav.tsx` |
| MB-07 | Text sizes don't scale down sufficiently on 320px | Mobile only | 320px | 🟢 Medium | Legibility | `text-3xl` = 30px h1 on 320px viewport — consumes 94% of screen width in one line | Headings dominate small screens | No responsive text clamp | Add `text-2xl` for 320px: use `text-xl sm:text-2xl md:text-3xl` for h1 | 🟢 Low | P2 | globals.css heading styles |

### 20.0 ACCESSIBILITY GAPS

| ID | Title | Module | Viewport | Severity | Type | Evidence | Impact | Root Cause | Recommendation | Complexity | Priority | Files |
|----|-------|--------|----------|----------|------|----------|--------|------------|----------------|------------|----------|-------|
| AX-01 | Many buttons lack aria-label when icon-only | All | All | 🟡 High | Accessibility | Edit, Delete, Toggle buttons with only icons and no aria-label (e.g., `<Edit2 className="w-3.5 h-3.5" />` with no label) | Screen reader users hear "button" with no context | Missing aria-label or title attributes | Add `aria-label="Editar movimentação"` to all icon-only buttons | 🟢 Low | P1 | All pages |
| AX-02 | Color-only status indicators (red/green/amber) without text alternative | All | All | 🟡 High | Accessibility | Status shown purely via color (e.g., balance color changes green/red) | Colorblind users cannot distinguish status | Missing text/aria-live announcements | Add `aria-live="polite"` and text labels alongside color indicators | 🟢 Low | P1 | All pages with color status |
| AX-03 | Form labels use className instead of proper htmlFor association in some cases | All | All | 🟢 Medium | Accessibility | Some labels use `<Label className="... ml-1">` but no `htmlFor` or wrapping | Screen readers may not associate label with input | Missing htmlFor/wrapper association | Ensure all labels have `htmlFor` matching input `id` | 🟢 Low | P2 | All form pages |
| AX-04 | No reduced-motion support for Framer Motion animations | All | All | 🟢 Medium | Accessibility | All pages use Framer Motion with spring animations | Users with vestibular disorders experience nausea from motion | Missing `prefers-reduced-motion` check | Wrap animations in a hook that checks `window.matchMedia('(prefers-reduced-motion: reduce)')` and disables motion | 🟡 Medium | P2 | All pages with motion |
| AX-05 | Dialog trap focus not implemented | Mobile only | 320-767px | 🟡 High | Accessibility | Dialog opens but focus is not trapped inside | Keyboard/screen reader users can tab behind the dialog | Missing focus trap | Add focus trap to Dialog component using useEffect + querySelector | 🟡 Medium | P1 | `src/components/ui/dialog.tsx` |

---

## Part 2: Problem Classification

### 2.1 Shared Problems (Desktop + Mobile)

| Category | Count | Key IDs |
|----------|-------|---------|
| Feedback gaps | 18 | M-05, C-06, O-05, PE-02, F-02, R-04, FE-02, LG-03, MB-02 |
| Confirm/dialog consistency | 8 | M-04, C-01, O-01, P-03, R-01, A-01, AL-02, DS-10 |
| Toast duplication | 6 | M-05, C-06, O-05, R-04, F-02, PE-02 |
| Empty state inconsistency | 5 | C-02, L-03, A-02, PE-05, MA-02 |
| Accessibility (aria, focus, color) | 5 | AX-01, AX-02, AX-03, AX-04, AX-05 |
| Design token gaps | 4 | DS-05, DS-08, DS-10, F-06 |
| Export without feedback | 3 | M-10, FE-02, RE-03 |
| Component inconsistency | 3 | DS-01, DS-06, DS-07 |

### 2.2 Desktop-Only Problems

| Category | Count | Key IDs |
|----------|-------|---------|
| Table padding excess | 2 | L-02, M-06 |
| Sidebar faint active state | 1 | N-04 |
| Chart density | 1 | D-01 |
| Button shape mismatch | 1 | DS-01 |
| Number input spinners | 1 | M-12 |

### 2.3 Mobile-Only Problems

| Category | Count | Key IDs |
|----------|-------|---------|
| Navigation discoverability | 3 | MB-01, N-01, N-02 |
| Dialog/keyboard overlap | 2 | M-01, MB-02 |
| Touch targets below 44px | 2 | C-05, N-01 |
| Table horizontal scroll | 2 | M-06, MB-03 |
| Chart readability | 2 | RE-01, MB-04 |
| Stat card stacking | 1 | MB-05 |
| Safe area support | 1 | MB-06 |
| Text sizing | 1 | MB-07 |
| Zoom disabled | 1 | S-07 |
| Dialog close button lost | 1 | M-01 |
| FAB position overlap | 1 | M-09 |
| Period button overflow | 1 | FE-01 |

---

## Part 3: Top 20 Most Critical Gaps

| Rank | ID | Title | Why Critical |
|------|----|-------|-------------|
| 1 | R-01/R-02 | Delete button in Recorrências is completely broken (no onClick, no handler) | Feature appears to work but silently does nothing — destroys trust |
| 2 | P-01 | Filter buttons in Pendências don't actually filter data | Core feature is misleading; user thinks they're filtering when they're not |
| 3 | A-01 | Aprovações approve/reject has no confirmation, loading, or error handling | Financial approval action is irreversible and unsafe — could approve/reject by accident |
| 4 | A-05 | Aprovações has no admin access control | Any user can approve/reject financial actions — security vulnerability |
| 5 | L-01 | Logs table renders ALL rows with no pagination | Performance killer; with 500+ logs the page may freeze |
| 6 | S-03 | No mobile navigation drawer — sidebar just disappears on mobile | 67% of features unreachable on mobile; core usability failure |
| 7 | MB-01 | Bottom nav hides most modules behind "Mais" page | Discoverability near zero for core features on mobile |
| 8 | M-01 | Dialog form close button scrolls away on mobile fullscreen | User trapped in form with no way to close |
| 9 | MB-02 | Keyboard covers submit button in mobile forms | User cannot complete form submission on mobile |
| 10 | S-02 | No error boundary — React errors produce blank screen | No graceful degradation; user sees white screen with no recovery |
| 11 | M-04/M-06/C-01/O-01 | Native `confirm()` used instead of premium ConfirmDialog | Destroys the premium feel; inconsistent across 5+ pages |
| 12 | DS-05/DS-08/DS-10 | `glass-card` class undefined; `bg-muted` undefined | Components render unstyled — broken UI on empty states, dialogs, skeletons |
| 13 | PE-01 | Profile save does full page reload | Jarring UX; user loses context |
| 14 | S-07 | `userScalable: false` blocks zoom for accessibility | WCAG 2.1 AA violation; blocks users with visual impairments |
| 15 | F-02/F-03 | InvoiceManager uses `alert()` and gray HTML inputs | Completely breaks design system in a core feature |
| 16 | DS-07 | No MoneyInput component — all amounts are raw numbers | Financial product without currency formatting in inputs |
| 17 | AX-01/AX-02 | Icon-only buttons lack aria-labels; color-only status | Screen reader users cannot use the product |
| 18 | M-06/M-09 | Table visible behind mobile cards; FAB overlaps bottom nav | Broken visual layout on mobile |
| 19 | M-05/C-06/O-05 | Three pages with duplicate toast implementations | Maintenance nightmare; inconsistent toast experience |
| 20 | M-02 | 12+ field form with no grouping or sections | Cognitive overload; form abandonment on mobile |

---

## Part 4: Quick Wins (High Impact, Low Effort)

| ID | Action | Effort | Impact |
|----|--------|--------|--------|
| DS-08 | Fix `bg-muted` → `bg-surface-variant` in skeleton | 5min | Skeletons start working |
| DS-05 | Fix `glass-card` → `premium-card` in EmptyState | 2min | Empty states render correctly |
| DS-10 | Fix `glass-card` → `premium-card` in ConfirmDialog | 2min | Confirm dialogs render correctly |
| R-01 | Add `onClick` to delete button in Recorrências | 5min | Delete feature starts working |
| R-02 | Implement `handleDelete` function | 15min | Delete feature fully functional |
| P-01 | Fix filter logic to actually filter displayed sections | 20min | Filter buttons work as expected |
| A-05 | Add admin role check to Aprovações | 10min | Security fix |
| S-07 | Remove `userScalable: false` | 1min | Accessibility compliance |
| S-08 | Add global focus-visible style | 10min | Keyboard navigation gets visible focus |
| M-09 | Fix FAB bottom offset with safe-area calc | 5min | FAB stops overlapping bottom nav |
| M-06 | Add `hidden md:block` to table wrapper | 2min | Table disappears on mobile (cards handle it) |
| C-05 | Remove `sm:h-8 sm:w-8` from account action buttons | 2min | Touch targets reach 44px |
| PE-04 | Replace Trash2 with RefreshCw on reload button | 2min | Icon matches action |
| F-02 | Replace `alert()` with `useToast()` | 10min | Toast consistency |
| F-06 | Replace gray-* colors with design tokens | 20min | Visual consistency |
| LG-03 | Map NextAuth errors to friendly messages | 15min | Better login error UX |
| DS-01 | Change button default from `rounded-full` to `rounded-lg` | 5min | Button default matches actual usage |

---

## Part 5: Structural UX/UI Debt

These require architectural changes but will pay off enormously:

| Debt | Description | Affected | Solution |
|------|-------------|----------|----------|
| **No shared page wrapper** | Every page defines its own spacing, padding, max-width | All 15 pages | Create `<PageLayout>` component with consistent padding, spacing scale, and header pattern |
| **No shared form pattern** | Every dialog form is hand-built with raw inputs | Movimentações, Contas, Orçamentos, Recorrências, Fluxo de Caixa, Perfil | Create `<FormDialog>` component with sections, validation, and loading states |
| **No MoneyInput** | Financial product without currency-formatted inputs | Movimentações, Contas, Orçamentos, Pendências, Fluxo de Caixa | Create `<MoneyInput>` with BRL formatting, negative handling, and keyboard type |
| **No LoadingButton** | Every page manually manages button loading states | All pages with forms | Create `<LoadingButton>` that accepts `loading` prop and shows spinner |
| **Mobile nav is broken** | No real mobile navigation pattern; sidebar hidden, bottom nav incomplete | All pages | Implement hamburger + slide-in drawer OR expandable "Mais" sheet with all modules |
| **Toast inconsistency** | 3+ pages have local toast implementations | Movimentações, Contas, Orçamentos | Migrate all to global `useToast()` with undo support |
| **Confirm inconsistency** | Native `confirm()` used in 5+ pages | Movimentações, Contas, Orçamentos, Pendências, Recorrências | Migrate all to `useConfirm()` |
| **No responsive chart config** | Charts ignore viewport size | Dashboard, Relatórios | Create `<ResponsiveChart>` wrapper that adjusts height/labels based on viewport |
| **Keyboard-aware forms missing** | Mobile keyboard covers submit buttons | All dialog forms | Create `<KeyboardAwareForm>` with scrollIntoView and sticky submit |

---

## Part 6: What Must Become Global Design System Standards

| Standard | Current State | Required State |
|----------|--------------|----------------|
| **Toast** | Global ToastProvider exists but 3 pages ignore it | ALL pages use `useToast()` exclusively; local toast states deleted |
| **Confirm dialogs** | Global ConfirmDialogProvider exists but 5 pages use native confirm | ALL destructive actions use `useConfirm()` |
| **Empty states** | `<EmptyState>` component exists but unused | ALL empty states use `<EmptyState>` with icon, title, description, CTA |
| **Loading states** | Each page invents its own spinner/text pattern | Use `<LoadingButton>` + `<PageSkeleton>` + consistent loading patterns |
| **Form inputs** | Mix of shared `<Input>` and raw HTML inputs | ALL forms use shared Input, Select, Label components |
| **Money formatting** | Raw `type="number"` everywhere | `<MoneyInput>` component with BRL formatting |
| **Page layout** | Each page defines own padding/spacing | `<PageLayout>` wrapper with consistent padding, max-width, spacing |
| **Dialog layout** | Dialog header scrolls away on mobile | Sticky header with close button; swipe-to-dismiss on mobile |
| **Touch targets** | Some buttons at 32px (below 44px WCAG minimum) | Minimum 44x44px for ALL interactive elements on mobile |
| **Color tokens** | Some components use hardcoded gray/emerald/rose | ALL colors map to design system tokens |
| **Focus-visible** | No global focus style | `*:focus-visible:ring-2 ring-secondary ring-offset-2` on all interactive elements |
| **Chart responsiveness** | Fixed heights and labels | Charts auto-adjust height/labels based on viewport breakpoint |
| **Export actions** | Direct `window.location.href` with no feedback | Fetch + blob download with loading spinner + error toast |
| **Icon-only buttons** | Missing aria-labels | ALL icon-only buttons have `aria-label` |
| **Button shape** | Default `rounded-full` never used, pages override to `rounded-lg` | Default changed to `rounded-lg` |

---

## Part 7: Phased Correction Plan

### Phase 1: Quick Wins & Feedback Fixes (Week 1)
**Goal:** Fix broken features, establish feedback consistency, fix critical bugs

| Priority | ID | Action | Solution Type |
|----------|----|--------|--------------|
| P0 | R-01, R-02 | Fix broken delete in Recorrências | Ajuste local |
| P0 | P-01 | Fix filter logic in Pendências | Ajuste local |
| P0 | A-01 | Add confirm + loading + error to Aprovações | Refactor de componente compartilhado |
| P0 | A-05 | Add admin role guard to Aprovações | Revisão de layout/página |
| P0 | L-01 | Add pagination to Logs | Refactor de componente compartilhado |
| P0 | DS-05 | Fix glass-card in EmptyState | Revisão de design token |
| P0 | DS-08 | Fix bg-muted in Skeleton | Revisão de design token |
| P0 | DS-10 | Fix glass-card in ConfirmDialog | Revisão de design token |
| P0 | S-07 | Remove userScalable: false | Revisão de design token |
| P0 | M-09 | Fix FAB positioning | Ajuste local |
| P0 | M-06 | Hide table on mobile | Ajuste local |
| P1 | M-04, C-01, O-01 | Replace confirm() with useConfirm() | Ajuste local (×5 pages) |
| P1 | M-05, C-06, O-05 | Replace local toast with useToast() | Ajuste local (×3 pages) |
| P1 | F-02 | Replace alert() with useToast() | Ajuste local |
| P1 | PE-02 | Add save feedback toast | Ajuste local |
| P1 | PE-04 | Fix reload icon | Ajuste local |
| P1 | S-08 | Add global focus-visible | Revisão de design token |
| P1 | DS-01 | Fix button default shape | Refactor de componente compartilhado |
| P1 | C-05 | Fix touch target sizes | Ajuste local |
| P1 | F-06 | Replace gray colors with tokens | Ajuste local |
| P2 | LG-03 | Map auth errors to friendly text | Ajuste local |

### Phase 2: Responsiveness & Mobile (Week 2-3)
**Goal:** Make the product genuinely usable on mobile devices

| Priority | ID | Action | Solution Type |
|----------|----|--------|--------------|
| P0 | S-03 | Implement mobile navigation drawer | Criação de novo componente base |
| P0 | MB-01 | Expand mobile nav to all modules | Criação de novo componente base |
| P0 | M-01 | Fix dialog close button on mobile | Refactor de componente compartilhado |
| P0 | MB-02 | Keyboard-aware form handling | Criação de novo componente base |
| P1 | MB-03 | Add card view for Logs table on mobile | Refactor de componente compartilhado |
| P1 | MB-05 | Use 2-col grid for stat cards on mobile | Ajuste local (×5 pages) |
| P1 | MB-07 | Responsive text sizing for headings | Revisão de design token |
| P1 | FE-01 | Fix period button overflow | Ajuste local |
| P1 | RE-01 | Fix pie chart labels on mobile | Ajuste local |
| P1 | RE-04 | Responsive chart heights | Ajuste local |
| P2 | MB-06 | Android safe-area fallback | Ajuste local |
| P2 | N-03 | Improve bottom nav active state | Ajuste local |
| P2 | AX-05 | Add focus trap to dialogs | Refactor de componente compartilhado |

### Phase 3: Component Consistency & Design System (Week 3-4)
**Goal:** Unify patterns, create missing components, enforce standards

| Priority | ID | Action | Solution Type |
|----------|----|--------|--------------|
| P1 | DS-06 | Create LoadingButton component | Criação de novo componente base |
| P1 | DS-07 | Create MoneyInput component | Criação de novo componente base |
| P1 | M-02 | Group form fields into sections | Revisão de layout/página |
| P1 | M-03 | Fix file input accessibility | Ajuste local |
| P1 | F-03 | Replace raw inputs in InvoiceManager | Ajuste local |
| P1 | F-04 | Add form validation to InvoiceManager | Ajuste local |
| P1 | P-03 | Add confirm before marking as paid | Ajuste local |
| P1 | AX-01 | Add aria-labels to icon buttons | Ajuste local (all pages) |
| P1 | AX-02 | Add text labels to color-only status | Ajuste local (all pages) |
| P2 | C-02 | Use EmptyState in Contas | Ajuste local |
| P2 | A-02 | Add empty state to Aprovações | Ajuste local |
| P2 | L-03 | Use EmptyState in Logs | Ajuste local |
| P2 | DS-09 | Fix FilterChips colors | Refactor de componente compartilhado |
| P2 | DS-04 | Fix Toast colors to use tokens | Refactor de componente compartilhado |
| P2 | PE-01 | Replace reload with toast + re-fetch | Ajuste local |

### Phase 4: Complex Flows & Final Polish (Week 4-5)
**Goal:** Polish complex flows, improve trust signals, final QA

| Priority | ID | Action | Solution Type |
|----------|----|--------|--------------|
| P2 | S-01 | Add route change loading indicator | Refactor de componente compartilhado |
| P2 | S-05 | Create PageLayout wrapper | Criação de novo componente base |
| P2 | D-04 | Make Quick Actions actually actionable | Revisão de layout/página |
| P2 | D-05 | Add data freshness timestamp | Ajuste local |
| P2 | D-06 | Coordinate dashboard data fetching | Ajuste local |
| P2 | M-08 | Add page numbers to pagination | Ajuste local |
| P2 | M-10 | Add export feedback handling | Ajuste local |
| P2 | M-11 | Consolidate filter rows | Revisão de layout/página |
| P2 | FE-02 | Add export feedback to Fechamento | Ajuste local |
| P2 | FE-03 | Add transaction detail to Fechamento | Revisão de layout/página |
| P2 | RE-03 | Add print styles | Revisão de design token |
| P2 | RE-02 | Fix bar chart label truncation | Ajuste local |
| P2 | P-05 | Add accordion to Pendências sections | Ajuste local |
| P2 | AL-01 | Create batch notification endpoint | Refactor de componente compartilhado |
| P2 | AX-04 | Add reduced-motion support | Refactor de componente compartilhado |
| P3 | S-04 | Add skip-to-content link | Ajuste local |
| P3 | S-06 | Add offline indicator | Ajuste local |
| P3 | N-05 | Add breadcrumbs for admin pages | Ajuste local |
| P3 | N-06 | Make sidebar avatar clickable | Ajuste local |
| P3 | MA-01 | Make entire Mais card clickable | Ajuste local |
| P3 | LG-01 | Add forgot password link | Revisão de layout/página |
| P3 | LG-04 | Add password visibility toggle | Ajuste local |

---

## Appendix: File-by-File Audit Summary

| File | Lines | Issues Found | Top Priority Fix |
|------|-------|-------------|-----------------|
| `src/app/layout.tsx` | 31 | 4 | Add error boundary + remove userScalable |
| `src/components/sidebar.tsx` | 131 | 4 | Add mobile drawer pattern |
| `src/components/bottom-nav.tsx` | 61 | 4 | Reduce items, add expandable nav |
| `src/app/page.tsx` | 256 | 6 | Make Quick Actions actionable |
| `src/app/movimentacoes/page.tsx` | 787 | 12 | Hide table on mobile, fix FAB, fix dialog close |
| `src/app/contas/page.tsx` | 240 | 6 | Fix touch targets, use useToast/useConfirm |
| `src/app/fluxo-caixa/page.tsx` | 65 | 7 | Fix InvoiceManager inputs and alert() |
| `src/app/contas-a-pagar/page.tsx` | 262 | 6 | Fix filter logic |
| `src/app/orcamentos/page.tsx` | 253 | 5 | Use useToast/useConfirm |
| `src/app/recorrencias/page.tsx` | 227 | 5 | Fix broken delete (CRITICAL) |
| `src/app/fechamento/page.tsx` | 148 | 4 | Fix period overflow, add export feedback |
| `src/app/relatorios/page.tsx` | 277 | 5 | Fix pie chart labels on mobile |
| `src/app/admin/logs/page.tsx` | 120 | 4 | Add pagination (CRITICAL) |
| `src/app/admin/aprovacoes/page.tsx` | 54 | 5 | Add confirm + admin guard (CRITICAL) |
| `src/app/perfil/page.tsx` | 119 | 6 | Replace reload with toast + re-fetch |
| `src/app/login/page.tsx` | 95 | 4 | Map auth errors to friendly text |
| `src/app/alertas/page.tsx` | 126 | 3 | Add batch endpoint |
| `src/app/mais/page.tsx` | 43 | 2 | Make cards fully clickable |
| `src/components/ui/button.tsx` | 54 | 1 | Fix default shape |
| `src/components/ui/dialog.tsx` | 124 | 3 | Add mobile sticky header + focus trap |
| `src/components/ui/table.tsx` | 79 | 1 | Add scroll indicator |
| `src/components/ui/toast.tsx` | 116 | 1 | Use design token colors |
| `src/components/ui/input.tsx` | 18 | 0 | ✅ Clean |
| `src/components/ui/empty-state.tsx` | 29 | 1 | Fix glass-card |
| `src/components/ui/confirm-dialog.tsx` | 103 | 1 | Fix glass-card |
| `src/components/ui/skeleton.tsx` | 12 | 1 | Fix bg-muted |
| `src/components/ui/select.tsx` | 144 | 0 | ✅ Clean |
| `src/components/ui/card.tsx` | 80 | 0 | ✅ Clean |
| `src/components/ui/filter-chips.tsx` | 48 | 1 | Fix hardcoded colors |
| `src/components/weekly-cashflow.tsx` | 173 | 2 | Replace gray colors with tokens |
| `src/components/weekly-cashflow-forecast.tsx` | 194 | 0 | ✅ Clean |
| `src/components/invoice-manager.tsx` | 253 | 5 | Replace raw inputs + alert() |
| `src/components/spend-decision-indicator.tsx` | 96 | 0 | ✅ Clean |

---

*End of Audit Report — 87 gaps identified across 33 files*
*Report generated: 2026-04-13*
