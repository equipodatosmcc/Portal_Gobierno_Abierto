import prisma from "@/lib/prisma";

export type CreateNewsInput = {
  title: string;
  slug: string;
  content: string;
  category: string;
  published: boolean;
  authorId: string;
  image?: string | null;
};

export type UpdateNewsInput = {
  title?: string;
  slug?: string;
  content?: string;
  category?: string;
  published?: boolean;
  image?: string | null;
};

export async function createNews(data: CreateNewsInput) {
  return prisma.news.create({
    data,
  });
}

export async function findManyNews(options?: { onlyPublished?: boolean }) {
  return prisma.news.findMany({
    where: options?.onlyPublished ? { published: true } : undefined,
    orderBy: { updatedAt: "desc" },
  });
}

export async function findNewsById(id: number) {
  return prisma.news.findUnique({
    where: { id },
  });
}

export async function updateNews(id: number, data: UpdateNewsInput) {
  return prisma.news.update({
    where: { id },
    data,
  });
}

export async function deleteNews(id: number) {
  return prisma.news.delete({
    where: { id },
  });
}
