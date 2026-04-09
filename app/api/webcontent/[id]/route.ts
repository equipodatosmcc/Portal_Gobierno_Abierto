import { NextResponse } from "next/server";
import { toApiError } from "@/lib/api-error";
import { getSessionManager, requireSessionManager } from "@/lib/content-auth";
import {
  parseWebContentUpdateFromFormData,
  parseWebContentUpdateFromObject,
} from "@/lib/webcontent-form-data";
import {
  deleteWebContent,
  findWebContentById,
  updateWebContent,
} from "@/lib/services/webcontent";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseId(id: string) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("ID inválido.");
  }

  return parsed;
}

async function parseUpdateRequest(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return parseWebContentUpdateFromFormData(formData);
  }

  const body = await request.json();
  return parseWebContentUpdateFromObject(body);
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const parsedId = parseId(id);
    const manager = await getSessionManager();

    const content = await findWebContentById(parsedId);
    if (!content) {
      return NextResponse.json({ error: "El contenido no existe." }, { status: 404 });
    }

    if (!manager && !content.published) {
      return NextResponse.json({ error: "El contenido no existe." }, { status: 404 });
    }

    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireSessionManager();

    const { id } = await context.params;
    const parsedId = parseId(id);

    const payload = await parseUpdateRequest(request);
    const updated = await updateWebContent(parsedId, payload);

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireSessionManager();

    const { id } = await context.params;
    const parsedId = parseId(id);

    const deleted = await deleteWebContent(parsedId);
    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
