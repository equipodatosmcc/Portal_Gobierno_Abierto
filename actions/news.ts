"use server";

import { Prisma } from "@prisma/client";
import { requireSessionManager } from "@/lib/content-auth";
import { parseNewsCreateFormData, parseNewsUpdateFormData } from "@/lib/news-form-data";
import { deleteNewsImageByUrl, saveNewsImage } from "@/lib/news-upload-storage";
import { createNews, deleteNews, findManyNews, findNewsById, updateNews } from "@/lib/services/news";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function getErrorMessage(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return "Ya existe un registro con ese slug.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado.";
}

export async function findManyNewsAction(): Promise<ActionResult<Awaited<ReturnType<typeof findManyNews>>>> {
  try {
    await requireSessionManager();
    const news = await findManyNews();
    return { ok: true, data: news };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function createNewsAction(formData: FormData): Promise<ActionResult<Awaited<ReturnType<typeof createNews>>>> {
  let newImageUrl: string | null = null;

  try {
    const manager = await requireSessionManager();
    const payload = parseNewsCreateFormData(formData);

    if (payload.imageFile) {
      const savedImage = await saveNewsImage(payload.imageFile);
      newImageUrl = savedImage.publicUrl;
    }

    const createdNews = await createNews({
      title: payload.title,
      slug: payload.slug,
      content: payload.content,
      category: payload.category,
      published: payload.published,
      image: newImageUrl,
      authorId: manager.userId,
    });

    return {
      ok: true,
      data: createdNews,
    };
  } catch (error) {
    if (newImageUrl) {
      await deleteNewsImageByUrl(newImageUrl);
    }

    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function updateNewsAction(id: number, formData: FormData): Promise<ActionResult<Awaited<ReturnType<typeof updateNews>>>> {
  let newImageUrl: string | null = null;

  try {
    await requireSessionManager();

    const existingNews = await findNewsById(id);
    if (!existingNews) {
      return { ok: false, error: "La noticia no existe." };
    }

    const payload = parseNewsUpdateFormData(formData);
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

    const updatedNews = await updateNews(id, updateData);

    const shouldDeletePreviousImage =
      !!existingNews.image && (payload.removeImage || (newImageUrl && existingNews.image !== newImageUrl));

    if (shouldDeletePreviousImage) {
      await deleteNewsImageByUrl(existingNews.image);
    }

    return {
      ok: true,
      data: updatedNews,
    };
  } catch (error) {
    if (newImageUrl) {
      await deleteNewsImageByUrl(newImageUrl);
    }

    return { ok: false, error: getErrorMessage(error) };
  }
}

export async function deleteNewsAction(id: number): Promise<ActionResult<Awaited<ReturnType<typeof deleteNews>>>> {
  try {
    await requireSessionManager();

    const deletedNews = await deleteNews(id);
    if (deletedNews.image) {
      await deleteNewsImageByUrl(deletedNews.image);
    }

    return {
      ok: true,
      data: deletedNews,
    };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}
