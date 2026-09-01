# Modelo inicial de dados

- `data_sources`: procedência dos dados.
- `economic_indicators`: catálogo semântico dos indicadores.
- `time_series`: séries disponibilizadas por uma fonte.
- `observations`: valores históricos, preservando revisões.
- `reports`, `report_sections` e `report_sources`: metadados, conteúdo editorial
  estruturado e referências utilizadas em cada publicação.
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

Essa estrutura mantém o conteúdo independente da apresentação visual e é produzida
pelo editor da área administrativa.

Além das seções, cada relatório pode armazenar categoria, autor, imagem de capa,
tags, data de referência e uma lista ordenada de fontes com título e URL. As tags
permanecem no próprio registro do relatório; as fontes usam `report_sources` para
permitir múltiplas referências e preservar sua ordem de apresentação.
