import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/gobierno_abierto?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const initialContent = [
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

async function main() {
  console.log("Seeding Transparency WebContent...");

  for (const item of initialContent) {
    const existing = await prisma.webContent.findUnique({
      where: { slug: item.slug },
    });

    if (!existing) {
      await prisma.webContent.create({
        data: item,
      });
      console.log(`Created: ${item.slug}`);
    } else {
      console.log(`Already exists: ${item.slug}`);
    }
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
