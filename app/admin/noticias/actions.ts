"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { readNewsFile, writeNewsFile } from "./news-store";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type NewsEditorState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"title" | "bajada" | "cuerpo" | "image", string>>;
};

function buildErrorState(
  message: string,
  fieldErrors?: Partial<Record<"title" | "bajada" | "cuerpo" | "image", string>>,
): NewsEditorState {
  return { status: "error", message, fieldErrors };
}

function sanitizeImageExtension(fileName: string, mimeType: string) {
  const extensionByMime: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };

  const guessed = extensionByMime[mimeType];
  if (guessed) {
    return guessed;
  }

  const extFromName = path.extname(fileName).toLowerCase();
  if (extFromName === ".jpg" || extFromName === ".jpeg") return ".jpg";
  if (extFromName === ".png") return ".png";
  if (extFromName === ".webp") return ".webp";
  return ".jpg";
}

async function saveImageFile(file: File) {
  if (file.size <= 0) {
    return null;
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Formato de imagen no válido. Usá JPG, PNG o WEBP.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("La imagen supera los 5MB.");
  }

  const extension = sanitizeImageExtension(file.name, file.type);
  const filename = `${Date.now()}-${randomUUID()}${extension}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "news");
  const targetPath = path.join(uploadsDir, filename);

  await mkdir(uploadsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(targetPath, buffer);

  return `/uploads/news/${filename}`;
}

async function removeStoredImage(imagePath: string | null | undefined) {
  if (!imagePath || !imagePath.startsWith("/uploads/news/")) {
    return;
  }

  const absolutePath = path.join(process.cwd(), "public", imagePath);

  try {
    await unlink(absolutePath);
  } catch {
    // Si el archivo ya no existe, no interrumpimos el flujo.
  }
}

export async function saveNewsAction(_: NewsEditorState, formData: FormData): Promise<NewsEditorState> {
  try {
    const idRaw = formData.get("id");
    const title = String(formData.get("title") ?? "").trim();
    const bajada = String(formData.get("bajada") ?? "").trim();
    const cuerpo = String(formData.get("cuerpo") ?? "").trim();
    const statusValue = String(formData.get("status") ?? "draft");
    const existingImage = String(formData.get("existingImage") ?? "").trim();
    const imageInput = formData.get("image");

    const fieldErrors: NewsEditorState["fieldErrors"] = {};

    if (title.length < 5) fieldErrors.title = "El título debe tener al menos 5 caracteres.";
    if (bajada.length < 10) fieldErrors.bajada = "La bajada debe tener al menos 10 caracteres.";
    if (cuerpo.length < 20) fieldErrors.cuerpo = "El cuerpo debe tener al menos 20 caracteres.";

    if (fieldErrors.title || fieldErrors.bajada || fieldErrors.cuerpo) {
      return buildErrorState("Revisá los datos del formulario.", fieldErrors);
    }

    const uploadedImage = imageInput instanceof File && imageInput.size > 0 ? imageInput : null;
    let imagePath = existingImage || null;

    if (uploadedImage) {
      try {
        imagePath = await saveImageFile(uploadedImage);
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo guardar la imagen.";
        return buildErrorState(message, { image: message });
      }
    }

    const published = statusValue === "published";
    const now = new Date().toISOString();
    const id = Number(idRaw);
    const hasId = Number.isInteger(id) && id > 0;

    const news = await readNewsFile();

    if (hasId) {
      const index = news.findIndex((item) => item.id === id);
      if (index === -1) {
        return buildErrorState("La noticia que querés editar ya no existe.");
      }

      const current = news[index];
      news[index] = {
        ...current,
        title,
        bajada,
        cuerpo,
        published,
        image: imagePath,
        updatedAt: now,
      };

      if (uploadedImage && current.image && current.image !== imagePath) {
        await removeStoredImage(current.image);
      }
    } else {
      const nextId = news.reduce((max, item) => Math.max(max, item.id), 0) + 1;

      news.push({
        id: nextId,
        title,
        bajada,
        cuerpo,
        published,
        image: imagePath,
        createdAt: now,
        updatedAt: now,
      });
    }

    await writeNewsFile(news);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No pudimos guardar la noticia.";
    return buildErrorState(message);
  }

  revalidatePath("/admin/noticias");
  revalidatePath("/admin/noticias/editor");
  redirect("/admin/noticias");
}

export async function toggleNewsStatusAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID inválido.");
  }

  const news = await readNewsFile();
  const index = news.findIndex((item) => item.id === id);

  if (index !== -1) {
    const item = news[index];
    news[index] = {
      ...item,
      published: !item.published,
      updatedAt: new Date().toISOString(),
    };
    await writeNewsFile(news);
  }

  revalidatePath("/admin/noticias");
  revalidatePath("/admin/noticias/editor");
  redirect("/admin/noticias");
}
