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
  const gobiernoAbiertoContent = [
    {
      slug: "gobierno-abierto-intro",
      title: "¿Qué es el Gobierno Abierto?",
      icon: "Landmark",
      content:
        "<p>El Gobierno Abierto es un modelo de gestión que busca transformar la relación entre el Municipio y los vecinos. Se basa en la convicción de que la información pública pertenece a la ciudadanía y que los problemas de la ciudad se resuelven mejor cuando trabajamos juntos. No se trata solo de publicar datos, sino de abrir las puertas de la gestión para que cada correntino tenga una voz activa en el diseño de su comunidad.</p>",
      published: true,
    },
    {
      slug: "gobierno-abierto-pilares",
      title: "Nuestros Pilares",
      icon: "Scale",
      content:
        "<p><strong>Transparencia:</strong> Garantizar que la información estratégica de nuestra ciudad —como los indicadores económicos locales, la infraestructura de salud y la movilidad urbana— sea pública, comprensible y esté al alcance de un clic. Este portal es una herramienta dinámica que busca conectar al Municipio con el vecino, democratizando el acceso a la información que nos pertenece a todos.</p><p><strong>Participación Ciudadana:</strong> Crear espacios reales para que los vecinos dejen de ser espectadores y pasen a proponer soluciones, influyendo directamente en las prioridades de sus barrios.</p><p><strong>Colaboración:</strong> Trabajar en equipo con universidades, organizaciones sociales y empresas para usar la tecnología y la creatividad en la mejora de los servicios públicos.</p>",
      published: true,
    },
    {
      slug: "gobierno-abierto-corrientes",
      title: "Gobierno Abierto en Corrientes",
      icon: "MapPin",
      content:
        "<p>Para la Municipalidad de Corrientes, el Gobierno Abierto es un compromiso con la modernización y la honestidad. Somos parte de <strong>OGP Local</strong> (Alianza para el Gobierno Abierto), una red internacional de ciudades que eligen ser transparentes y rendir cuentas a sus habitantes.</p><p><strong>Acciones que ya estamos implementando:</strong></p><ul><li><strong>Apertura de Datos Reales:</strong> Ponemos a disposición información estratégica sobre Economía, Salud, Transporte y Geografía en formatos que podés descargar y reutilizar libremente.</li><li><strong>Co-creación y Escucha:</strong> Implementamos procesos de consulta ciudadana para que los proyectos clave de la ciudad cuenten con el aval y la visión de quienes viven en cada barrio.</li><li><strong>Modernización y Autogestión:</strong> Facilitamos el acceso a trámites y servicios digitales para que la relación con el Municipio sea más simple, rápida y sin vueltas.</li></ul>",
      published: true,
    },
    {
      slug: "gobierno-abierto-ciudadano",
      title: "¿Para qué te sirve como ciudadano?",
      icon: "Users",
      content:
        "<p>El Gobierno Abierto es una herramienta para tu día a día:</p><ul><li><strong>Tomar mejores decisiones:</strong> Si sos emprendedor, estudiante o periodista, podés usar los datos del portal para tus proyectos, investigaciones o para analizar el mercado local.</li><li><strong>Cuidar tu barrio:</strong> Podés consultar la ubicación de servicios municipales (SAPS, puntos verdes, centros de atención) y verificar que los recursos lleguen a tu zona.</li><li><strong>Influir en la gestión:</strong> Tu opinión cuenta. A través de este portal, podés ayudarnos a decidir qué capacitaciones traer a los Puntos Digitales o cuáles son las prioridades de infraestructura en tu sector.</li></ul>",
      published: true,
    },
    {
      slug: "gobierno-abierto-participacion",
      title: "Tu participación hace al Portal",
      icon: "MessageSquare",
      content:
        "<p>Este portal no es una biblioteca estática; es un espacio vivo de conexión. Por eso, hemos sumado una sección de Feedback y Sugerencias diseñada para que seas protagonista del crecimiento de esta plataforma.</p><p><strong>¿Qué podés hacer en la sección de interacción?</strong></p><ul><li><strong>Solicitar nuevos Datasets:</strong> Si necesitás información que aún no está publicada, podés pedir su apertura.</li><li><strong>Actualizar Información:</strong> Ayudanos a mantener los datos al día informándonos sobre cambios o sugerencias de mejora en los registros actuales.</li><li><strong>Enviar Sugerencias:</strong> Danos tu idea para que el portal sea más fácil de usar o para que los datos sean más útiles para tu trabajo o estudio.</li></ul><p>Tu aporte es el motor que nos permite seguir expandiendo el acceso a la información en Corrientes.</p>",
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
