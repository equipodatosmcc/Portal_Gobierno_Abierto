import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL no está definido");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

type LegacyNewsItem = {
  id: number;
  title: string;
  bajada: string;
  cuerpo: string;
  image: string | null;
  published: boolean;
  createdAt: string;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function buildLegacySlug(item: LegacyNewsItem) {
  const normalizedTitle = slugify(item.title) || "noticia";
  return `legacy-${item.id}-${normalizedTitle}`;
}

function serializeNewsContent(bajada: string, cuerpo: string) {
  return JSON.stringify({
    bajada: bajada.trim(),
    cuerpo: cuerpo.trim(),
  });
}

async function loadLegacyNews(): Promise<LegacyNewsItem[]> {
  const newsPath = path.join(process.cwd(), "data", "news.json");

  try {
    const raw = await readFile(newsPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is LegacyNewsItem => {
      if (typeof item !== "object" || item === null) {
        return false;
      }

      const candidate = item as Partial<LegacyNewsItem>;
      return (
        typeof candidate.id === "number" &&
        typeof candidate.title === "string" &&
        typeof candidate.bajada === "string" &&
        typeof candidate.cuerpo === "string" &&
        (typeof candidate.image === "string" || candidate.image === null) &&
        typeof candidate.published === "boolean" &&
        typeof candidate.createdAt === "string"
      );
    });
  } catch {
    return [];
  }
}

async function main() {

  console.log("🌱 Iniciando seed...");
  // --- WebContent Transparencia ---
  const transparenciaContent = [
    {
      slug: "transparencia-main",
      title: "Gestion abierta y transparente",
      content:
        "Creemos en una gestion municipal donde cada ciudadano pueda acceder a la informacion publica de manera simple y directa. Conoce como se administran los recursos de nuestra ciudad.",
      published: true,
    },
    {
      slug: "transparencia-card-1",
      title: "Presupuesto Abierto",
      content: "Consulta la ejecucion presupuestaria de la Municipalidad en tiempo real.",
      published: true,
    },
    {
      slug: "transparencia-card-2",
      title: "Compras y Contrataciones",
      content: "Licitaciones publicas, ordenes de compra y proveedores adjudicados.",
      published: true,
    },
    {
      slug: "transparencia-card-3",
      title: "Normativa Municipal",
      content: "Ordenanzas, decretos y resoluciones del Honorable Concejo Deliberante.",
      published: true,
    },
    {
      slug: "transparencia-card-4",
      title: "Obras Publicas",
      content: "Estado de avance de las obras de infraestructura municipal.",
      published: true,
    },
  ];

  for (const item of transparenciaContent) {
    await prisma.webContent.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        content: item.content,
        published: item.published,
      },
      create: {
        slug: item.slug,
        title: item.title,
        content: item.content,
        published: item.published,
      },
    });
  }
  console.log("✅ WebContent Transparencia creado/actualizado");

  const passwordHash = await bcrypt.hash("admin123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@gobierno.gob.ar" },
    update: {
      name: "Administrador Central",
      password: passwordHash,
      role: Role.ADMIN,
    },
    create: {
      email: "admin@gobierno.gob.ar",
      name: "Administrador Central",
      password: passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log("✅ Usuario admin creado/actualizado");

  const legacyNews = await loadLegacyNews();

  if (legacyNews.length > 0) {
    for (const item of legacyNews) {
      const slug = buildLegacySlug(item);

      await prisma.news.upsert({
        where: { slug },
        update: {
          title: item.title,
          content: serializeNewsContent(item.bajada, item.cuerpo),
          category: "Noticias",
          published: item.published,
          image: item.image,
          authorId: adminUser.id,
        },
        create: {
          title: item.title,
          slug,
          content: serializeNewsContent(item.bajada, item.cuerpo),
          category: "Noticias",
          published: item.published,
          image: item.image,
          authorId: adminUser.id,
          createdAt: new Date(item.createdAt),
        },
      });
    }

    console.log(`✅ Noticias migradas/actualizadas en Prisma: ${legacyNews.length}`);
  } else {
    console.log("ℹ️ No se encontraron noticias legacy para migrar.");
  }

  console.log("🌱 Seed completado");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
