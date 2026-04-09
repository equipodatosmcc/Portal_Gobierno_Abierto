import { NextResponse } from "next/server";
import { toApiError } from "@/lib/api-error";
import { getSessionManager, requireSessionManager } from "@/lib/content-auth";
import {
  parseWebContentCreateFromFormData,
  parseWebContentCreateFromObject,
} from "@/lib/webcontent-form-data";
import { createWebContent, findManyWebContent } from "@/lib/services/webcontent";

export const runtime = "nodejs";

async function parseCreateRequest(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return parseWebContentCreateFromFormData(formData);
  }

  const body = await request.json();
  return parseWebContentCreateFromObject(body);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const manager = await getSessionManager();

    const forcePublishedOnly = url.searchParams.get("publishedOnly") === "true";
    const onlyPublished = manager ? forcePublishedOnly : true;

    const content = await findManyWebContent({ onlyPublished });
    return NextResponse.json(content, { status: 200 });
  } catch (error) {
    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function POST(request: Request) {
  try {
    await requireSessionManager();

    const payload = await parseCreateRequest(request);
    const created = await createWebContent(payload);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
