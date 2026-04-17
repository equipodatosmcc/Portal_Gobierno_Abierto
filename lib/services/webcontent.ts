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
