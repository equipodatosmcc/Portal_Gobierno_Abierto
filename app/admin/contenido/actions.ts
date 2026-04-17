"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

export type TransparencyMainPayload = {
  title: string;
  content: string;
};

export type TransparencyCardPayload = {
  title: string;
  content: string;
  icon: string | null;
};

export async function updateTransparencyContent(
  main: TransparencyMainPayload,
  cards: TransparencyCardPayload[]
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("No autorizado");
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update the main text
      await tx.webContent.upsert({
        where: { slug: "transparencia-main" },
        update: { title: main.title, content: main.content, published: true },
        create: {
          slug: "transparencia-main",
          title: main.title,
          content: main.content,
          published: true,
        },
      });

      // 2. Delete all existing transparency cards
      await tx.webContent.deleteMany({
        where: {
          slug: {
            startsWith: "transparencia-card-",
          },
        },
      });

      // 3. Insert the new cards with sequential slugs
      if (cards.length > 0) {
        await tx.webContent.createMany({
          data: cards.map((card, index) => ({
            slug: `transparencia-card-${index + 1}`,
            title: card.title,
            content: card.content,
            icon: card.icon || "FileSearch", // default fallback
            published: true,
          })),
        });
      }
    });

    revalidatePath("/");
    revalidatePath("/admin/contenido");
    return { success: true };
  } catch (error) {
    console.error("Error updating web content:", error);
    return { success: false, error: "Ocurrió un error al guardar los cambios." };
  }
}
