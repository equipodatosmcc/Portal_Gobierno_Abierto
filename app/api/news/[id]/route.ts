import { NextResponse } from "next/server";
import { toApiError } from "@/lib/api-error";
import { getSessionManager, requireSessionManager } from "@/lib/content-auth";
import { parseNewsUpdateFormData, parseNewsUpdateObject } from "@/lib/news-form-data";
import { deleteNewsImageByUrl, saveNewsImage } from "@/lib/news-upload-storage";
import { deleteNews, findNewsById, updateNews } from "@/lib/services/news";

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
    return parseNewsUpdateFormData(formData);
  }

  const body = await request.json();
  const payload = parseNewsUpdateObject(body);

  return {
    ...payload,
    imageFile: null,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const parsedId = parseId(id);
    const manager = await getSessionManager();

    const news = await findNewsById(parsedId);
    if (!news) {
      return NextResponse.json({ error: "La noticia no existe." }, { status: 404 });
    }

    if (!manager && !news.published) {
      return NextResponse.json({ error: "La noticia no existe." }, { status: 404 });
    }

    return NextResponse.json(news, { status: 200 });
  } catch (error) {
    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  let newImageUrl: string | null = null;

  try {
    await requireSessionManager();

    const { id } = await context.params;
    const parsedId = parseId(id);
    const existingNews = await findNewsById(parsedId);

    if (!existingNews) {
      return NextResponse.json({ error: "La noticia no existe." }, { status: 404 });
    }

    const payload = await parseUpdateRequest(request);
    const updateData: Parameters<typeof updateNews>[1] = {};

    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.slug !== undefined) updateData.slug = payload.slug;
    if (payload.content !== undefined) updateData.content = payload.content;
    if (payload.category !== undefined) updateData.category = payload.category;
    if (payload.published !== undefined) updateData.published = payload.published;

    if (payload.imageFile) {
      const savedImage = await saveNewsImage(payload.imageFile);
      newImageUrl = savedImage.publicUrl;
      updateData.image = newImageUrl;
    } else if (payload.removeImage) {
      updateData.image = null;
    }

    const updatedNews = await updateNews(parsedId, updateData);

    const shouldDeletePreviousImage =
      !!existingNews.image && (payload.removeImage || (newImageUrl && existingNews.image !== newImageUrl));

    if (shouldDeletePreviousImage) {
      await deleteNewsImageByUrl(existingNews.image);
    }

    return NextResponse.json(updatedNews, { status: 200 });
  } catch (error) {
    if (newImageUrl) {
      await deleteNewsImageByUrl(newImageUrl);
    }

    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireSessionManager();

    const { id } = await context.params;
    const parsedId = parseId(id);
    const deletedNews = await deleteNews(parsedId);

    if (deletedNews.image) {
      await deleteNewsImageByUrl(deletedNews.image);
    }

    return NextResponse.json(deletedNews, { status: 200 });
  } catch (error) {
    const apiError = toApiError(error);
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
