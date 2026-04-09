export type NewsCreatePayload = {
  title: string;
  slug: string;
  content: string;
  category: string;
  published: boolean;
  imageFile: File | null;
};

export type NewsUpdatePayload = {
  title?: string;
  slug?: string;
  content?: string;
  category?: string;
  published?: boolean;
  removeImage: boolean;
  imageFile: File | null;
};

function normalizeString(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function parseBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["true", "1", "on", "yes", "si"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "off", "no"].includes(normalized)) {
    return false;
  }

  return fallback;
}

function readFile(value: FormDataEntryValue | null) {
  if (!value || !(value instanceof File)) {
    return null;
  }

  if (value.size === 0) {
    return null;
  }

  return value;
}

export function parseNewsCreateObject(body: unknown): Omit<NewsCreatePayload, "imageFile"> {
  const candidate = body as Record<string, unknown>;
  const title = normalizeString(candidate?.title);
  const slug = normalizeString(candidate?.slug);
  const content = normalizeString(candidate?.content);
  const category = normalizeString(candidate?.category) || "General";
  const published = parseBoolean(candidate?.published, false);

  if (!title || !slug || !content) {
    throw new Error("Campos obligatorios faltantes: title, slug, content");
  }

  return {
    title,
    slug,
    content,
    category,
    published,
  };
}

export function parseNewsUpdateObject(body: unknown): Omit<NewsUpdatePayload, "imageFile"> {
  const candidate = body as Record<string, unknown>;
  const title = normalizeString(candidate?.title);
  const slug = normalizeString(candidate?.slug);
  const content = normalizeString(candidate?.content);
  const category = normalizeString(candidate?.category);

  return {
    title: title || undefined,
    slug: slug || undefined,
    content: content || undefined,
    category: category || undefined,
    published: Object.prototype.hasOwnProperty.call(candidate, "published")
      ? parseBoolean(candidate?.published)
      : undefined,
    removeImage: parseBoolean(candidate?.removeImage, false),
  };
}

export function parseNewsCreateFormData(formData: FormData): NewsCreatePayload {
  const title = normalizeString(formData.get("title"));
  const slug = normalizeString(formData.get("slug"));
  const content = normalizeString(formData.get("content"));
  const category = normalizeString(formData.get("category")) || "General";
  const published = parseBoolean(formData.get("published"), false);
  const imageFile = readFile(formData.get("image"));

  if (!title || !slug || !content) {
    throw new Error("Campos obligatorios faltantes: title, slug, content");
  }

  return {
    title,
    slug,
    content,
    category,
    published,
    imageFile,
  };
}

export function parseNewsUpdateFormData(formData: FormData): NewsUpdatePayload {
  const title = normalizeString(formData.get("title"));
  const slug = normalizeString(formData.get("slug"));
  const content = normalizeString(formData.get("content"));
  const category = normalizeString(formData.get("category"));
  const imageFile = readFile(formData.get("image"));

  return {
    title: title || undefined,
    slug: slug || undefined,
    content: content || undefined,
    category: category || undefined,
    published: formData.has("published") ? parseBoolean(formData.get("published")) : undefined,
    removeImage: parseBoolean(formData.get("removeImage"), false),
    imageFile,
  };
}
