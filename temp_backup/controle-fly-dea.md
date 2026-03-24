# Controle FLY DEA

## Goal
Sistema web MVP para controle financeiro (entradas e saídas) com dashboard e relatórios, focado nos usuários Augusto e Luiz. Construído com Next.js (App Router), Prisma, PostgreSQL e NextAuth.

## Tasks
- [ ] Task 1: Inicializar o projeto Next.js com Tailwind CSS e Shadcn UI. → Verify: App rodando em `localhost:3000`.
- [ ] Task 2: Configurar o Prisma ORM e modelar o banco de dados (Usuários, Movimentações, Categorias). → Verify: `prisma migrate` executa e tabelas são criadas no Neon.
- [ ] Task 3: Implementar NextAuth (Credentials Provider) e script de seed para criar "Augusto" e "Luiz". → Verify: Login funciona e redireciona para o Dashboard.
- [ ] Task 4: Desenvolver APIs do Backend e Server Actions para Dashboard (Métricas) e Movimentações (CRUD). → Verify: APIs retornam o saldo correto (entradas - saídas).
- [ ] Task 5: Construir Componentes de UI (Sidebar, Cards Financeiros, Tabela de Dados, Gráficos). → Verify: Componentes renderizam sem erros e com estilo moderno.
- [ ] Task 6: Integrar Páginas (Login, Dashboard, Movimentações, Relatórios) com dados reais e filtros (data, categoria, usuário). → Verify: Fluxo E2E do cadastro à exclusão de lançamento.

## Done When
- [ ] Login restrito apenas para Augusto e Luiz com senhas seguras.
- [ ] Dashboard exibe saldo atual, totais do mês e gráfico comparativo.
- [ ] Listagem de movimentações possui filtros operacionais, e lançamentos não podem ter valor zero.
- [ ] Sistema apresenta formatação monetária padrão BRL (R$).
