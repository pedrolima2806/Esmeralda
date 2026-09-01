import { PrismaClient } from "@esmeralda/database";
import { resolve } from "node:path";

if (!process.env.DATABASE_URL) {
  process.loadEnvFile(resolve(process.cwd(), "../../.env"));
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const database = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = database;
}
