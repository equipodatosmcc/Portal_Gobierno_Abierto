/**
 * Migrates legacy news content from plain text to HTML.
 * Idempotent: skips records where cuerpo already contains HTML tags.
 * Run: pnpm tsx scripts/migrate-news-to-html.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL no está definido");
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

function textToHtml(text: string): string {
  return text
    .split(/\n\n+/)
    .map((para) => `<p>${para.replace(/\n/g, "<br>").trim()}</p>`)
    .join("");
}

function isHtml(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

async function main() {
  const allNews = await prisma.news.findMany({ select: { id: true, content: true } });
  let migrated = 0;

  for (const item of allNews) {
    let parsed: { bajada?: unknown; cuerpo?: unknown };

    try {
      parsed = JSON.parse(item.content) as { bajada?: unknown; cuerpo?: unknown };
    } catch {
      continue;
    }

    const bajada = typeof parsed.bajada === "string" ? parsed.bajada : "";
    const cuerpo = typeof parsed.cuerpo === "string" ? parsed.cuerpo : "";

    if (isHtml(bajada) || isHtml(cuerpo)) {
      continue;
    }

    const newContent = JSON.stringify({
      bajada: textToHtml(bajada),
      cuerpo: textToHtml(cuerpo),
    });

    await prisma.news.update({ where: { id: item.id }, data: { content: newContent } });
    migrated++;
  }

  console.log(`✅ Migradas ${migrated} noticias de ${allNews.length} totales.`);
}

main()
  .catch((e) => {
    console.error("❌ Error en migración:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
