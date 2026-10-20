import prisma from "@/lib/prisma";

type WebContentRecord = {
  id: number;
  slug: string;
  title: string;
  content: string;
  icon: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type WebContentDelegate = {
  create(args: { data: CreateWebContentInput }): Promise<WebContentRecord>;
  findMany(args: {
    where?: { published: boolean };
    orderBy: { createdAt: "asc" | "desc" };
  }): Promise<WebContentRecord[]>;
  findUnique(args: { where: { id: number } }): Promise<WebContentRecord | null>;
  update(args: { where: { id: number }; data: UpdateWebContentInput }): Promise<WebContentRecord>;
  delete(args: { where: { id: number } }): Promise<WebContentRecord>;
};

const webContentDelegate = (prisma as unknown as { webContent: WebContentDelegate }).webContent;

export type CreateWebContentInput = {
  slug: string;
  title: string;
  content: string;
  icon?: string | null;
  published: boolean;
};

export type UpdateWebContentInput = {
  slug?: string;
  title?: string;
  content?: string;
  icon?: string | null;
  published?: boolean;
};

export async function createWebContent(data: CreateWebContentInput) {
  return webContentDelegate.create({
    data,
  });
}

export async function findManyWebContent(options?: { onlyPublished?: boolean }) {
  return webContentDelegate.findMany({
    where: options?.onlyPublished ? { published: true } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

// Fila de WebContent usada como flag: published=false oculta la sección Novedades. Sin fila = visible.
export const NEWS_SECTION_SLUG = "seccion-novedades";

export async function isNewsSectionVisible() {
  const flag = await prisma.webContent.findUnique({ where: { slug: NEWS_SECTION_SLUG } });
  return flag?.published ?? true;
}

export async function setNewsSectionVisible(visible: boolean) {
  await prisma.webContent.upsert({
    where: { slug: NEWS_SECTION_SLUG },
    update: { published: visible },
    create: { slug: NEWS_SECTION_SLUG, title: "Sección Novedades", content: "", published: visible },
  });
}

export async function findWebContentById(id: number) {
  return webContentDelegate.findUnique({
    where: { id },
  });
}

export async function updateWebContent(id: number, data: UpdateWebContentInput) {
  return webContentDelegate.update({
    where: { id },
    data,
  });
}

export async function deleteWebContent(id: number) {
  return webContentDelegate.delete({
    where: { id },
  });
}
