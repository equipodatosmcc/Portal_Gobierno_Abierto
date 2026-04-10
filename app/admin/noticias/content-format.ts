export type NewsContentParts = {
  bajada: string;
  cuerpo: string;
};

type StoredNewsContent = {
  bajada?: unknown;
  cuerpo?: unknown;
};

export function serializeNewsContent(parts: NewsContentParts) {
  return JSON.stringify({
    bajada: parts.bajada.trim(),
    cuerpo: parts.cuerpo.trim(),
  });
}

export function parseNewsContent(rawContent: string): NewsContentParts {
  if (!rawContent) {
    return { bajada: "", cuerpo: "" };
  }

  try {
    const parsed = JSON.parse(rawContent) as StoredNewsContent;

    if (typeof parsed?.cuerpo === "string") {
      return {
        bajada: typeof parsed.bajada === "string" ? parsed.bajada : "",
        cuerpo: parsed.cuerpo,
      };
    }
  } catch {
    // Compatibilidad con noticias previas donde content es texto plano.
  }

  return { bajada: "", cuerpo: rawContent };
}
