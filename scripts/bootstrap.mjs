#!/usr/bin/env node
import { copyFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function ensureEnvLocal() {
  if (existsSync(".env.local")) {
    console.log("[setup] .env.local ya existe");
    return;
  }

  if (!existsSync(".env.example")) {
    console.error("[setup] No se encontro .env.example");
    process.exit(1);
  }

  copyFileSync(".env.example", ".env.local");
  console.log("[setup] .env.local creado desde .env.example");
}

console.log("[setup] Iniciando bootstrap del proyecto...");
ensureEnvLocal();
run("pnpm", ["install"]);
run("docker", ["compose", "up", "-d", "db_gobierno_abierto"]);
console.log("[setup] Listo. Ejecuta: pnpm dev");
