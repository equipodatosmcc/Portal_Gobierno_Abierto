export type WebContentCreatePayload = {
  slug: string;
  title: string;
  content: string;
  published: boolean;
};

export type WebContentUpdatePayload = {
  slug?: string;
  title?: string;
  content?: string;
  published?: boolean;
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

export function parseWebContentCreateFromFormData(formData: FormData): WebContentCreatePayload {
  const slug = normalizeString(formData.get("slug"));
  const title = normalizeString(formData.get("title"));
  const content = normalizeString(formData.get("content"));
  const published = parseBoolean(formData.get("published"), false);

  if (!slug || !title || !content) {
    throw new Error("Campos obligatorios faltantes: slug, title, content");
  }

  return { slug, title, content, published };
}

export function parseWebContentUpdateFromFormData(formData: FormData): WebContentUpdatePayload {
  const slug = normalizeString(formData.get("slug"));
  const title = normalizeString(formData.get("title"));
  const content = normalizeString(formData.get("content"));

  return {
    slug: slug || undefined,
    title: title || undefined,
    content: content || undefined,
    published: formData.has("published") ? parseBoolean(formData.get("published")) : undefined,
  };
}

export function parseWebContentCreateFromObject(body: unknown): WebContentCreatePayload {
  const candidate = body as Record<string, unknown>;
  const slug = normalizeString(candidate?.slug);
  const title = normalizeString(candidate?.title);
  const content = normalizeString(candidate?.content);
  const published = parseBoolean(candidate?.published, false);

  if (!slug || !title || !content) {
    throw new Error("Campos obligatorios faltantes: slug, title, content");
  }

  return { slug, title, content, published };
}

export function parseWebContentUpdateFromObject(body: unknown): WebContentUpdatePayload {
  const candidate = body as Record<string, unknown>;
  const slug = normalizeString(candidate?.slug);
  const title = normalizeString(candidate?.title);
  const content = normalizeString(candidate?.content);

  return {
    slug: slug || undefined,
    title: title || undefined,
    content: content || undefined,
    published: Object.prototype.hasOwnProperty.call(candidate, "published")
      ? parseBoolean(candidate?.published)
      : undefined,
  };
}
