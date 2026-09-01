import { PrismaClient } from "@prisma/client";

const database = new PrismaClient();

const slug = "panorama-semanal-demonstracao";
const sources = [
  { position: 1, title: "Banco Central do Brasil — Estatísticas", url: "https://www.bcb.gov.br/estatisticas" },
  { position: 2, title: "IBGE — Indicadores econômicos", url: "https://www.ibge.gov.br/indicadores.html" },
];
const sections = [
  {
    position: 1,
    title: "Visão geral",
    content: [
      {
        type: "paragraph",
        text: "Este relatório demonstra como a Esmeralda organiza uma leitura semanal do mercado. O conteúdo é ilustrativo e não representa dados, eventos ou recomendações reais.",
      },
      {
        type: "quote",
        text: "Uma boa análise não elimina a incerteza; ela torna os riscos e as hipóteses mais visíveis.",
      },
    ],
  },
  {
    position: 2,
    title: "Sinais acompanhados",
    content: [
      {
        type: "paragraph",
        text: "A leitura combina sinais macroeconômicos, comportamento dos principais mercados e mudanças nas expectativas. O objetivo é conectar movimentos isolados a um cenário mais amplo.",
      },
      {
        type: "list",
        items: [
          "Direção das expectativas de inflação e juros",
          "Mudanças no apetite por risco",
          "Comportamento relativo entre classes de ativos",
          "Eventos capazes de alterar o cenário-base",
        ],
      },
    ],
  },
  {
    position: 3,
    title: "Cenário e próximos passos",
    content: [
      {
        type: "heading",
        text: "O que observar",
      },
      {
        type: "paragraph",
        text: "Nas próximas publicações, esta seção poderá reunir indicadores atualizados, gráficos e hipóteses de acompanhamento. Cada conclusão deverá indicar sua fonte e a data de referência.",
      },
      {
        type: "paragraph",
        text: "Este material foi criado exclusivamente para validar a experiência de leitura das páginas públicas do projeto Esmeralda.",
      },
    ],
  },
];

async function main() {
  const report = await database.report.upsert({
    where: { slug },
    update: {
      title: "Panorama semanal: sinais, riscos e próximos movimentos",
      summary: "Relatório demonstrativo para visualizar a experiência pública de análise da Esmeralda.",
      category: "Panorama semanal",
      author: "Equipe Esmeralda",
      coverImageUrl: "/images/emerald-stone-hero.png",
      tags: ["mercados", "macroeconomia", "cenário"],
      referenceDate: new Date("2026-08-31T00:00:00.000Z"),
      status: "PUBLISHED",
      publishedAt: new Date(),
      sections: {
        deleteMany: {},
        create: sections,
      },
      sources: {
        deleteMany: {},
        create: sources,
      },
    },
    create: {
      slug,
      title: "Panorama semanal: sinais, riscos e próximos movimentos",
      summary: "Relatório demonstrativo para visualizar a experiência pública de análise da Esmeralda.",
      category: "Panorama semanal",
      author: "Equipe Esmeralda",
      coverImageUrl: "/images/emerald-stone-hero.png",
      tags: ["mercados", "macroeconomia", "cenário"],
      referenceDate: new Date("2026-08-31T00:00:00.000Z"),
      status: "PUBLISHED",
      publishedAt: new Date(),
      sections: { create: sections },
      sources: { create: sources },
    },
  });

  console.log(`Relatório disponível em /relatorios/${report.slug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.$disconnect();
  });
