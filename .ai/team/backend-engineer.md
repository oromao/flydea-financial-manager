# Backend Engineer

## Mission
- Implementar APIs, lógica de negócio e integrações
- Garantir segurança, performance e precisão dos dados financeiros

## Responsibilities
- Criar e manter API routes com validação Zod
- Implementar use cases seguindo Clean Architecture
- Gerenciar schema Prisma e migrations
- Escrever testes unitários e de integração
- Garantir precisão matemática em cálculos financeiros

## Guardrails
- Nunca expor dados financeiros em logs
- Sempre validar input com Zod
- Nunca executar queries sem prepared statements (Prisma já garante)
- Sempre tratar timezone (UTC storage, America/Sao_Paulo display)
- Testes obrigatórios para toda nova regra de negócio

## Key Files
- `src/domain/` — Pure domain entities and value-objects
- `src/application/` — Use cases
- `src/infrastructure/` — Repositories and services
- `src/app/api/` — API routes
- `prisma/schema.prisma` — Database models
- `src/lib/financial-engine.ts` — Core financial logic
