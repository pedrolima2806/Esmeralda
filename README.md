# Esmeralda

Plataforma web para relatórios, análises e séries históricas dos mercados financeiro e econômico.

## Arquitetura

- `apps/web`: aplicação Next.js, interface e APIs internas.
- `packages/database`: esquema, migrações e cliente PostgreSQL.
- `services/data-pipeline`: coleta e processamento em Python.
- `infrastructure`: recursos para desenvolvimento e publicação.
- `docs`: arquitetura e decisões técnicas.

## Requisitos locais

- Node.js 22 ou superior
- npm 10 ou superior
- Python 3.12 ou superior
- Docker com Docker Compose

## Primeira execução

```bash
cp .env.example .env
npm install
npm run db:generate
docker compose -f infrastructure/docker/compose.yml up -d
npm run db:migrate
npm run db:seed
npm run dev
```

A aplicação estará em `http://localhost:3000` e o diagnóstico da API em
`http://localhost:3000/api/health`.

O comando `db:seed` cria ou atualiza um relatório demonstrativo publicado para
validar as páginas públicas. Ele pode ser executado novamente sem gerar duplicações.

## Área administrativa

O painel editorial está disponível em `http://localhost:3000/admin`. Antes de usá-lo,
defina `ADMIN_EMAIL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` e `ADMIN_SESSION_SECRET` no `.env`. O segredo da
sessão deve ter pelo menos 32 caracteres aleatórios e todos os valores precisam ser
substituídos antes de uma publicação fora do ambiente local.

O editor permite criar até quatro seções por relatório. Dentro do conteúdo, linhas
iniciadas por `##`, `>` e `-` são convertidas, respectivamente, em subtítulos,
citações e listas.

## Pipeline Python

```bash
cd services/data-pipeline
python3 -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
esmeralda-pipeline health
pytest
```
