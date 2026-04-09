import { NextResponse } from "next/server";
import { toApiError } from "@/lib/api-error";
import { getSessionManager, requireSessionManager } from "@/lib/content-auth";
import { parseNewsCreateFormData, parseNewsCreateObject } from "@/lib/news-form-data";
import { deleteNewsImageByUrl, saveNewsImage } from "@/lib/news-upload-storage";
import { createNews, findManyNews } from "@/lib/services/news";

export const runtime = "nodejs";

async function parseCreateRequest(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    return parseNewsCreateFormData(formData);
  }

  const body = await request.json();
  const payload = parseNewsCreateObject(body);

  return {
    ...payload,
    imageFile: null,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const manager = await getSessionManager();

    const forcePublishedOnly = url.searchParams.get("publishedOnly") === "true";
    const onlyPublished = manager ? forcePublishedOnly : true;

    const news = await findManyNews({ onlyPublished });
    return NextResponse.json(news, { status: 200 });
  } catch (error) {
    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function POST(request: Request) {
  let newImageUrl: string | null = null;

  try {
    const manager = await requireSessionManager();
    const payload = await parseCreateRequest(request);

    if (payload.imageFile) {
      const savedImage = await saveNewsImage(payload.imageFile);
      newImageUrl = savedImage.publicUrl;
    }

    const created = await createNews({
      title: payload.title,
      slug: payload.slug,
      content: payload.content,
      category: payload.category,
      published: payload.published,
      image: newImageUrl,
      authorId: manager.userId,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (newImageUrl) {
      await deleteNewsImageByUrl(newImageUrl);
    }

    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
