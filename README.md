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
npm run dev
```

A aplicação estará em `http://localhost:3000` e o diagnóstico da API em
`http://localhost:3000/api/health`.

## Pipeline Python

```bash
cd services/data-pipeline
python3 -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
esmeralda-pipeline health
pytest
```
