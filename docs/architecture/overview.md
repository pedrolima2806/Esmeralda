# Visão da arquitetura

O Esmeralda é um monorepositório composto por uma aplicação web, um pacote de banco de
dados e um pipeline Python.

## Fluxo principal

1. O pipeline coleta e normaliza dados de fontes externas.
2. O pipeline persiste dados rastreáveis no PostgreSQL.
3. O Next.js consulta o PostgreSQL no servidor.
4. Componentes React apresentam relatórios e visualizações no navegador.

O navegador não acessa o PostgreSQL nem executa o pipeline diretamente.
