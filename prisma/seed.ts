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
  // --- Limpiar registros de Transparencia anteriores ---
  await prisma.webContent.deleteMany({
    where: { slug: { startsWith: "transparencia-" } },
  });

  // --- WebContent Gobierno Abierto ---
  await prisma.webContent.deleteMany({
    where: { slug: { in: ["gobierno-abierto-pilares", "gobierno-abierto-ciudadano"] } },
  });

  const gobiernoAbiertoContent = [
    {
      slug: "gobierno-abierto-intro",
      title: "¿Qué es el Gobierno Abierto?",
      icon: "Landmark",
      content:
        "<p>El Gobierno Abierto es un modelo de gestión que busca transformar la relación entre el Municipio y los vecinos. Se basa en la convicción de que la información pública pertenece a la ciudadanía y que los problemas de la ciudad se resuelven mejor cuando trabajamos juntos. No se trata solo de publicar datos, sino de abrir las puertas de la gestión para que cada correntino tenga una voz activa en el diseño de su comunidad.</p><p><strong>Nuestros Pilares:</strong></p><ul><li><strong>Transparencia:</strong> Garantizar que la información estratégica —como indicadores económicos, infraestructura de salud y movilidad urbana— sea pública, comprensible y esté a un clic de distancia. Democratizamos el acceso a la información que nos pertenece a todos.</li><li><strong>Participación Ciudadana:</strong> Crear espacios reales para que los vecinos dejen de ser espectadores y pasen a proponer soluciones, influyendo en las prioridades de sus barrios.</li><li><strong>Colaboración:</strong> Trabajar en equipo con universidades, organizaciones sociales y empresas para usar la tecnología y la creatividad en la mejora de los servicios públicos.</li></ul>",
      published: true,
    },
    {
      slug: "gobierno-abierto-corrientes",
      title: "Corrientes Abierta: El Impacto en tu Día a Día",
      icon: "MapPin",
      content:
        "<p>Para la Municipalidad de Corrientes, este modelo es un compromiso con la modernización y la honestidad. Como miembros de <strong>OGP Local</strong> (Alianza para el Gobierno Abierto), no solo abrimos datos, sino que te damos herramientas concretas para tu vida cotidiana:</p><ul><li><strong>Tomar mejores decisiones:</strong> Abrimos información estratégica sobre Economía, Salud y Transporte. Si sos emprendedor, estudiante o periodista, podés usar estos datos para investigar o analizar el mercado local.</li><li><strong>Cuidar tu barrio y gestionar más rápido:</strong> Facilitamos servicios digitales para agilizar tus trámites y te permitimos consultar la ubicación de servicios municipales para verificar que los recursos lleguen a tu zona.</li><li><strong>Influir en la gestión:</strong> A través de nuestras consultas ciudadanas, tu opinión cuenta para decidir, por ejemplo, qué capacitaciones llevar a los Puntos Digitales o priorizar infraestructura en tu sector.</li></ul>",
      published: true,
    },
    {
      slug: "gobierno-abierto-participacion",
      title: "Co-creá este Portal con Nosotros",
      icon: "MessageSquare",
      content:
        "<p>Este portal no es una biblioteca estática; es un espacio vivo de conexión y mejora continua. Hemos sumado una sección de Feedback y Sugerencias para que seas protagonista del crecimiento de esta plataforma.</p><p><strong>¿Qué podés hacer en nuestra sección de interacción?</strong></p><ul><li><strong>Solicitar nuevos Datasets:</strong> Si necesitás información pública que aún no está disponible, podés pedir su apertura.</li><li><strong>Actualizar Información:</strong> Ayudanos a mantener los datos al día informándonos sobre cambios en tu zona o mejoras en los registros.</li><li><strong>Enviar Sugerencias:</strong> Compartí tus ideas para que el portal sea más fácil de usar o para que los datos te resulten más útiles.</li></ul><p>Tu aporte es el motor que nos permite seguir expandiendo el acceso a la información en Corrientes.</p>",
      published: true,
    },
  ];

  for (const item of gobiernoAbiertoContent) {
    await prisma.webContent.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        content: item.content,
        icon: item.icon,
        published: item.published,
      },
      create: {
        slug: item.slug,
        title: item.title,
        content: item.content,
        icon: item.icon,
        published: item.published,
      },
    });
  }
  console.log("✅ WebContent Gobierno Abierto creado/actualizado");

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
