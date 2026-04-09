import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const NEWS_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "news");
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function getExtension(file: File) {
  const byMime = MIME_EXTENSION_MAP[file.type.toLowerCase()];
  if (byMime) {
    return byMime;
  }

  const originalExtension = path.extname(file.name).toLowerCase().replace(".", "");
  if (["jpg", "jpeg", "png", "webp"].includes(originalExtension)) {
    return originalExtension === "jpeg" ? "jpg" : originalExtension;
  }

  throw new Error("Tipo de archivo no permitido. Usa jpg, png o webp.");
}

function getSafePathFromUrl(imageUrl: string) {
  if (!imageUrl.startsWith("/uploads/news/")) {
    return null;
  }

  const fileName = decodeURIComponent(path.basename(imageUrl));
  if (!fileName || fileName === "." || fileName === "..") {
    return null;
  }

  const fullPath = path.resolve(NEWS_UPLOADS_DIR, fileName);
  const basePath = path.resolve(NEWS_UPLOADS_DIR);

  if (!fullPath.startsWith(basePath)) {
    return null;
  }

  return fullPath;
}

export async function saveNewsImage(file: File) {
  if (!file || file.size === 0) {
    throw new Error("No se recibió una imagen válida.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("La imagen supera el tamaño máximo permitido de 5 MB.");
  }

  const extension = getExtension(file);
  const filename = `${randomUUID()}.${extension}`;

  await mkdir(NEWS_UPLOADS_DIR, { recursive: true });

  const bytes = await file.arrayBuffer();
  const absolutePath = path.join(NEWS_UPLOADS_DIR, filename);

  await writeFile(absolutePath, Buffer.from(bytes));

  return {
    filename,
    absolutePath,
    publicUrl: `/uploads/news/${filename}`,
  };
}

export async function deleteNewsImageByUrl(imageUrl?: string | null) {
  if (!imageUrl) {
    return;
  }

  const fullPath = getSafePathFromUrl(imageUrl);
  if (!fullPath) {
    return;
  }

  try {
    await unlink(fullPath);
  } catch (error) {
    const typedError = error as NodeJS.ErrnoException;
    if (typedError.code !== "ENOENT") {
      throw error;
    }
  }
}

export const NEWS_UPLOADS_PUBLIC_PREFIX = "/uploads/news/";
