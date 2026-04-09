import { Prisma } from "@prisma/client";

export function toApiError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return {
        status: 409,
        message: "Ya existe un registro con ese valor único (por ejemplo slug).",
      };
    }

    if (error.code === "P2025") {
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
