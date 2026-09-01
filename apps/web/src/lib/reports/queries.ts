import type { Prisma } from "@esmeralda/database";
import { database } from "@/lib/database/client";

const publishedReportSummary = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  category: true,
  author: true,
  coverImageUrl: true,
  tags: true,
  referenceDate: true,
  publishedAt: true,
} satisfies Prisma.ReportSelect;

export type PublishedReportSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category: string | null;
  author: string | null;
  coverImageUrl: string | null;
  tags: string[];
  referenceDate: Date | null;
  publishedAt: Date;
};

export async function listPublishedReports(limit?: number): Promise<PublishedReportSummary[]> {
  const reports = await database.report.findMany({
    where: { status: "PUBLISHED", publishedAt: { not: null, lte: new Date() } },
    select: publishedReportSummary,
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return reports.flatMap((report) => report.publishedAt ? [{ ...report, publishedAt: report.publishedAt }] : []);
}

export function findPublishedReport(slug: string) {
  return database.report.findFirst({
    where: { slug, status: "PUBLISHED", publishedAt: { not: null, lte: new Date() } },
    include: {
      sections: { orderBy: { position: "asc" } },
      sources: { orderBy: { position: "asc" } },
    },
  });
}
