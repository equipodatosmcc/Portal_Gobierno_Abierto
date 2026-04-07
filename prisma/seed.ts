import { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";

async function main() {
  console.log("🌱 Iniciando seed...");

  const passwordHash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
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
