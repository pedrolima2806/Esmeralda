# Contexto do Projeto Esmeralda

Este documento é a memória técnica consolidada do Esmeralda. Ele deve ser atualizado
quando objetivos, arquitetura ou decisões relevantes forem alterados. Detalhes mais
específicos permanecem nos demais documentos da pasta `docs`.

## 1. Visão geral

O Esmeralda é uma plataforma web para organizar e publicar relatórios, análises e
séries históricas sobre os mercados financeiro e econômico.

O projeto pretende resolver a dispersão dessas informações ao reuni-las em uma
interface clara, consultável e preparada para preservar conteúdo histórico. A ideia
inicial é disponibilizar relatórios financeiros ao público e, progressivamente,
incorporar dados estruturados, indicadores econômicos e visualizações.

Além de construir o produto, o desenvolvimento do Esmeralda tem um objetivo de
aprendizado: criar a aplicação desde a base, aplicando práticas usadas em projetos
profissionais e entendendo como cada parte do sistema se conecta.

## 2. Objetivos atuais

- Criar um site de acesso gratuito para publicação de relatórios financeiros.
- Publicar relatórios semanais de forma organizada.
- Manter relatórios antigos disponíveis para consulta.
- Preparar a plataforma para automatizar futuramente a coleta de dados.
- Permitir a geração futura de gráficos a partir de dados financeiros e econômicos.

## 3. Stack tecnológica

### Frontend

- **Next.js:** estrutura a aplicação web, suas rotas, páginas e renderização.
- **React:** permite construir a interface como componentes reutilizáveis.
- **TypeScript:** adiciona verificação de tipos ao código JavaScript e ajuda a detectar
  erros durante o desenvolvimento.
- **CSS:** define a apresentação visual da interface. A base atual utiliza CSS global
  organizado e pode receber estilos por componente conforme a aplicação crescer.

### Backend

- **Next.js:** executa funcionalidades do site no servidor, APIs internas, regras da
  aplicação e a integração da interface com o banco de dados.
- **Python:** executa coleta, validação, processamento e análise de dados. Essa parte é
  organizada como um pipeline independente da interface web.

### Banco de dados

- **PostgreSQL:** persiste relatórios, indicadores, séries históricas, observações e
  registros das tarefas de coleta e processamento.

O esquema do PostgreSQL é definido e versionado pelo Prisma. O Prisma é a única
autoridade de migração do projeto; o pipeline Python acessa o mesmo banco, mas não
mantém um segundo histórico de alterações estruturais.

## 4. Arquitetura planejada

O projeto foi implementado como um monorepositório modular. A estrutura real equivale
à separação conceitual entre frontend, backend, dados, banco e documentação, mas usa
nomes que deixam explícito o papel de cada módulo:

```text
/
├── apps/
│   └── web/                  # Interface, páginas e APIs em Next.js
├── services/
│   └── data-pipeline/        # Coleta e processamento em Python
├── packages/
│   └── database/             # Prisma, esquema e migrações do PostgreSQL
├── data/                     # Amostras pequenas para desenvolvimento
├── infrastructure/
│   └── docker/               # PostgreSQL para o ambiente local
├── docs/                     # Contexto, arquitetura e decisões técnicas
└── .github/
    └── workflows/            # Verificações automatizadas no GitHub
```

Responsabilidades:

- `apps/web`: corresponde ao frontend e à parte web do backend. Contém componentes
  React, rotas, páginas e APIs internas.
- `services/data-pipeline`: corresponde ao backend de dados. Contém os scripts e
  módulos Python usados para coleta, transformação e análise.
- `packages/database`: centraliza o modelo PostgreSQL, as migrações e o cliente usado
  pelo Next.js.
- `data`: guarda somente dados de exemplo pequenos, públicos e seguros. Dados brutos
  ou processados não devem ser versionados no Git.
- `infrastructure`: contém recursos necessários para executar ou publicar o sistema.
  Atualmente inclui o PostgreSQL local via Docker Compose.
- `docs`: registra o contexto, o modelo de dados e as decisões arquiteturais.
- `.github/workflows`: executa verificações automáticas de qualidade para TypeScript e
  Python.

## 5. Fluxo de dados esperado

```text
Fontes de dados financeiros
            ↓
Scripts Python de coleta e análise
            ↓
Banco de dados PostgreSQL
            ↓
APIs e backend do Next.js
            ↓
Interface Next.js e React
            ↓
Usuário final
```

O pipeline Python coleta, valida e normaliza os dados antes de gravá-los no
PostgreSQL. O Next.js consulta o banco apenas no servidor e entrega à interface as
informações necessárias. O navegador do usuário não acessa diretamente o banco nem
executa o pipeline Python.

## 6. Decisões técnicas

### Decisões atuais

1. **Separar análise de dados e aplicação web.** Python fica responsável pelo trabalho
   de dados, enquanto Next.js e React cuidam da experiência web. Essa divisão mantém
   cada tecnologia concentrada no tipo de tarefa para o qual foi escolhida.
2. **Usar PostgreSQL para persistência.** Relatórios e séries históricas exigem dados
   consistentes, relacionáveis e preservados ao longo do tempo.
3. **Usar o banco como ponto inicial de integração.** O Python grava os resultados no
   PostgreSQL e o Next.js os consulta. Não há, neste momento, um servidor Python
   permanente.
4. **Manter uma única autoridade de migração.** O Prisma controla as alterações no
   esquema para evitar históricos conflitantes entre TypeScript e Python.
5. **Adotar um monorepositório modular.** A aplicação web, o banco e o pipeline ficam
   no mesmo repositório, com responsabilidades e dependências separadas.
6. **Construir o site desde a base para aprendizado.** As etapas devem ser explicadas,
   verificáveis e executadas de forma incremental.
7. **Priorizar uma arquitetura escalável.** A organização deve permitir crescimento
   sem introduzir serviços e complexidade antes de serem necessários.

### Futuras decisões

Novas decisões relevantes devem ser registradas em `docs/decisions` como ADRs
(*Architecture Decision Records*, ou registros de decisão arquitetural) e resumidas
nesta seção.

## 7. Padrões de desenvolvimento

### Organização de pastas

- Manter código da interface e das APIs web em `apps/web`.
- Manter coleta e processamento em `services/data-pipeline`.
- Alterar o esquema do banco somente em `packages/database`.
- Não misturar regras de negócio diretamente com componentes visuais.
- Manter testes próximos do módulo ao qual pertencem, usando as pastas `tests`.

### Nomes de arquivos e código

- Usar nomes claros que expressem a responsabilidade do arquivo.
- Seguir as convenções da tecnologia e do módulo existente.
- Evitar abreviações que não sejam conhecidas no domínio do projeto.
- Manter funções pequenas e com uma responsabilidade principal.

### Git e branches

- Criar uma branch para cada funcionalidade ou correção.
- Usar nomes descritivos, como `feature/publicacao-relatorios` ou
  `fix/validacao-indicadores`.
- Fazer commits pequenos, coerentes e com mensagens que expliquem a mudança.
- Não versionar `.env`, credenciais, dependências instaladas ou dados financeiros
  brutos.
- Revisar `git diff` e executar as verificações antes de cada commit.

### Documentação de mudanças

- Atualizar este documento quando o contexto geral mudar.
- Registrar decisões arquiteturais em `docs/decisions`.
- Atualizar o `README.md` quando os comandos de instalação ou execução mudarem.
- Documentar migrações que alterem significativamente o significado dos dados.

## 8. Próximos passos

Estado inicial das tarefas solicitadas:

- [x] Definir a estrutura inicial do projeto.
- [x] Configurar o ambiente Next.js.
- [x] Configurar o PostgreSQL local e o modelo inicial.
- [x] Criar a base de integração Python com o PostgreSQL.
- [x] Desenvolver a primeira página da aplicação.
- [ ] Criar o sistema de publicação e consulta de relatórios.

Os itens marcados como concluídos representam apenas a base técnica. Funcionalidades
de produto, conteúdo real e fluxos administrativos ainda deverão ser desenvolvidos em
etapas futuras.

## 9. Histórico de decisões

| Data | Decisão | Motivo |
| --- | --- | --- |

## 10. Observações

- A estrutura ilustrativa `/frontend`, `/backend`, `/database` foi representada no
  repositório por `apps/web`, `services/data-pipeline` e `packages/database`. Não há
  conflito funcional: trata-se de uma nomenclatura de monorepositório mais específica.
- O modelo inicial já contém entidades para fontes, indicadores econômicos, séries
  temporais, observações, relatórios, seções, execuções de coleta e tarefas de
  processamento. A presença dessas entidades prepara a estrutura, mas não significa
  que os respectivos fluxos de produto já estejam implementados.
- Novas anotações e dúvidas técnicas devem ser adicionadas aqui até serem formalizadas
  como decisão, tarefa ou documentação específica.
