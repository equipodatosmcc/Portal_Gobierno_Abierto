import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log("🌱 Iniciando seed...");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no está definido");
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@gobierno.gob.ar" },
    update: {},
    create: {
      email: "admin@gobierno.gob.ar",
      name: "Administrador Central",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Usuario admin creado/actualizado");
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
