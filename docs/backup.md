# Backup gratuito

Este projeto usa um plano local-first e gratuito para proteger os dados:

1. Dump diário do banco com `pg_dump`.
2. Compressão em `.sql.gz`.
3. Retenção simples de arquivos antigos.
4. Cópia opcional para um disco externo, Time Machine, iCloud Drive ou Google Drive.

## Scripts

```bash
npm run backup:db
```

```bash
npm run restore:db -- backups/flydea-YYYY-MM-DDTHH-MM-SS-sssZ.sql.gz
```

## Variáveis

- `DIRECT_URL` ou `DATABASE_URL`
- `BACKUP_DIR` para mudar o diretório de saída
- `BACKUP_RETENTION_DAYS` para definir retenção

## Rotina recomendada

- Diário: backup local comprimido
- Semanal: copiar a última versão para um destino externo gratuito
- Mensal: testar restore em ambiente de homologação

## Observação

O fluxo é gratuito, mas depende de `pg_dump` e `psql` instalados no macOS. Se faltar, instale as ferramentas de linha de comando do Postgres.
