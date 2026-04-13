"use server";

import { requireSessionManager } from "@/lib/content-auth";
import {
  parseWebContentCreateFromFormData,
  parseWebContentUpdateFromFormData,
} from "@/lib/webcontent-form-data";
import {
  createWebContent,
  deleteWebContent,
  findManyWebContent,
  updateWebContent,
} from "@/lib/services/webcontent";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function hasPrismaCode(error: unknown, code: string) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string" &&
    (error as { code: string }).code === code
  );
}

function getErrorMessage(error: unknown) {
  if (hasPrismaCode(error, "P2002")) {
    return "Ya existe un registro con ese slug.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado.";
}

export async function findManyWebContentAction(): Promise<ActionResult<Awaited<ReturnType<typeof findManyWebContent>>>> {
  try {
    await requireSessionManager();

    const content = await findManyWebContent();
    return { ok: true, data: content };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function createWebContentAction(
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createWebContent>>>> {
  try {
    await requireSessionManager();

    const payload = parseWebContentCreateFromFormData(formData);
    const created = await createWebContent(payload);

    return {
      ok: true,
      data: created,
    };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function updateWebContentAction(
  id: number,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof updateWebContent>>>> {
  try {
    await requireSessionManager();

    const payload = parseWebContentUpdateFromFormData(formData);
    const updated = await updateWebContent(id, payload);

    return {
      ok: true,
      data: updated,
    };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function deleteWebContentAction(
  id: number,
): Promise<ActionResult<Awaited<ReturnType<typeof deleteWebContent>>>> {
  try {
    await requireSessionManager();

    const deleted = await deleteWebContent(id);
    return {
      ok: true,
      data: deleted,
    };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}
