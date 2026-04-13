function getPrismaCode(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }

  return null;
}

export function toApiError(error: unknown) {
  const prismaCode = getPrismaCode(error);

  if (prismaCode) {
    if (prismaCode === "P2002") {
      return {
        status: 409,
        message: "Ya existe un registro con ese valor único (por ejemplo slug).",
      };
    }

    if (prismaCode === "P2025") {
      return {
        status: 404,
        message: "No se encontró el registro solicitado.",
      };
    }
  }

  if (error instanceof Error) {
    if (error.message === "FORBIDDEN") {
      return { status: 403, message: "No autorizado para esta operación." };
    }

    return { status: 400, message: error.message };
  }

  return { status: 500, message: "Error interno inesperado." };
}
