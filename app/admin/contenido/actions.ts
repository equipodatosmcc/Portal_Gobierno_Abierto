"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import DOMPurify from "isomorphic-dompurify";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "u", "ul", "ol", "li", "a", "h3", "h4"];
const ALLOWED_ATTR = ["href", "target", "rel"];

function sanitize(html: string) {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}

export type GobiernoAbiertoPanel = {
  slug: string;
  title: string;
  content: string;
  icon: string | null;
};

export async function updateGobiernoAbiertoContent(panels: GobiernoAbiertoPanel[]) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("No autorizado");
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const panel of panels) {
        await tx.webContent.upsert({
          where: { slug: panel.slug },
          update: {
            title: panel.title,
            content: sanitize(panel.content),
            icon: panel.icon,
            published: true,
          },
          create: {
            slug: panel.slug,
            title: panel.title,
            content: sanitize(panel.content),
            icon: panel.icon,
            published: true,
          },
        });
      }
    });

    revalidatePath("/");
    revalidatePath("/admin/contenido");
    return { success: true };
  } catch (error) {
    console.error("Error updating gobierno abierto content:", error);
    return { success: false, error: "Ocurrió un error al guardar los cambios." };
  }
}
