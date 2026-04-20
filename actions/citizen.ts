"use server";

import { headers } from "next/headers";
import { createCitizenMessage, updateCitizenMessageStatus } from "@/lib/services/citizen";
import { requireSessionManager } from "@/lib/content-auth";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

const ALLOWED_TYPES = new Set([
  "nuevo_dataset",
  "actualizar_dataset",
  "reclamo",
  "sugerencia",
]);

async function verifyTurnstileToken(
  token: string,
  remoteIp?: string | null,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", body },
    );
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado.";
}

export async function createCitizenMessageAction(input: {
  type: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  dataset?: string;
  turnstileToken: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate type
    if (!ALLOWED_TYPES.has(input.type)) {
      return { ok: false, error: "Tipo de solicitud no válido." };
    }

    // Validate required fields
    const name = input.name.trim().slice(0, 100);
    const email = input.email.trim().slice(0, 255);
    const subject = input.subject.trim().slice(0, 200);
    const message = input.message.trim().slice(0, 2000);
    const dataset = input.dataset?.trim().slice(0, 200) || null;

    if (!name || !email || !subject || !message) {
      return { ok: false, error: "Todos los campos obligatorios deben completarse." };
    }

    // Verify Turnstile token
    const headerList = await headers();
    const remoteIp =
      headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

    const valid = await verifyTurnstileToken(input.turnstileToken, remoteIp);
    if (!valid) {
      return {
        ok: false,
        error: "No pudimos validar que no seas un bot. Intentalo de nuevo.",
      };
    }

    const record = await createCitizenMessage({
      type: input.type,
      name,
      email,
      subject,
      message,
      dataset,
    });

    return { ok: true, data: { id: record.id } };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function updateCitizenMessageStatusAction(
  id: string,
  status: "pending" | "resolved",
): Promise<ActionResult<{ id: string; status: string }>> {
  try {
    await requireSessionManager();
    const updated = await updateCitizenMessageStatus(id, status);
    return { ok: true, data: { id: updated.id, status: updated.status } };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}
