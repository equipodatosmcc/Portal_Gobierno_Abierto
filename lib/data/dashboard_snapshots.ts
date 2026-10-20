import { after } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

// Los tableros se sirven desde el último resultado agregado guardado en la base.
// Si el snapshot tiene más de REFRESH_INTERVAL_MS, se refresca después de responder;
// si la fuente falla, se sigue mostrando el último dato bueno.
const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

const inFlight = new Map<string, Promise<unknown>>();

function refresh<T>(key: string, load: () => Promise<T>, isValid: (data: T) => boolean): Promise<T | null> {
  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T | null>;

  const promise = (async () => {
    const now = new Date();
    const data = await load().catch(() => null);

    if (data !== null && isValid(data)) {
      const json = data as unknown as Prisma.InputJsonValue;
      await prisma.dashboardSnapshot
        .upsert({
          where: { key },
          create: { key, data: json, refreshedAt: now, checkedAt: now },
          update: { data: json, refreshedAt: now, checkedAt: now, lastError: null },
        })
        .catch((err) => console.error(`[dashboards] No se pudo guardar el snapshot de ${key}:`, err));
      return data;
    }

    const lastError = "La fuente no devolvió filas válidas (ver logs de ckanService)";
    console.error(`[dashboards] ${key}: ${lastError}`);
    await prisma.dashboardSnapshot
      .upsert({
        where: { key },
        create: { key, checkedAt: now, lastError },
        update: { checkedAt: now, lastError },
      })
      .catch((err) => console.error(`[dashboards] No se pudo registrar el error de ${key}:`, err));
    return null;
  })().finally(() => inFlight.delete(key));

  inFlight.set(key, promise);
  return promise;
}

export async function getDashboardData<T>(
  key: string,
  load: () => Promise<T>,
  isValid: (data: T) => boolean,
  empty: T,
): Promise<T> {
  const snapshot = await prisma.dashboardSnapshot.findUnique({ where: { key } }).catch(() => null);

  if (!snapshot) {
    return (await refresh(key, load, isValid)) ?? empty;
  }

  if (Date.now() - snapshot.checkedAt.getTime() > REFRESH_INTERVAL_MS) {
    after(() => refresh(key, load, isValid));
  }

  return snapshot.data === null ? empty : (snapshot.data as unknown as T);
}
