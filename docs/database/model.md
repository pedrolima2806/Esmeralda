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

## Conteúdo dos relatórios

O campo JSON `report_sections.content` é uma lista ordenada de blocos. As páginas
públicas reconhecem inicialmente quatro formatos:

```json
[
  { "type": "heading", "text": "Destaques da semana" },
  { "type": "paragraph", "text": "Texto da análise." },
  { "type": "quote", "text": "Uma observação em destaque." },
  { "type": "list", "items": ["Primeiro ponto", "Segundo ponto"] }
]
```

Essa estrutura mantém o conteúdo independente da apresentação visual e poderá ser
produzida futuramente pelo editor da área administrativa.
