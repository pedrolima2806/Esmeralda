# Modelo inicial de dados

- `data_sources`: procedência dos dados.
- `economic_indicators`: catálogo semântico dos indicadores.
- `time_series`: séries disponibilizadas por uma fonte.
- `observations`: valores históricos, preservando revisões.
- `reports` e `report_sections`: conteúdo editorial estruturado.
- `collection_runs`: auditoria de coletas.
- `processing_jobs`: fila persistente para trabalhos assíncronos futuros.

O Prisma é a única autoridade de migração. O pipeline Python consome o esquema, mas
não mantém uma segunda árvore de migrações.
