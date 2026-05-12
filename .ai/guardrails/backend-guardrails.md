# Backend Guardrails

## API Routes
- Validar todo input com Zod antes de processar
- Retornar erros padronizados (ApiError format)
- Métodos HTTP corretos (GET para leitura, POST para criação, etc.)
- Sempre verificar ownership do usuário

## Database (Prisma)
- Usar Prisma Client singleton (evitar múltiplas conexões)
- Sempre usar transactions para operações que afetam múltiplas tabelas
- Migrations devem ser testadas em ambiente de preview
- Evitar N+1 queries (usar `include` ou `select` específico)

## Financial Logic
- Cálculos financeiros em pure functions (src/lib/financial-engine.ts)
- Nunca fazer arredondamento no meio de cálculo
- Usar inteiros para valores monetários (centavos)
- Sempre validar saldo antes de permitir transação

## Testing
- Testes unitários para toda regra de negócio
- Mocks para serviços externos (OCR, Blob, Resend)
- Testes de integração para API routes
