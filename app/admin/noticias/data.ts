import { unstable_noStore as noStore } from "next/cache";
import { findManyNews, findNewsById } from "@/lib/services/news";
import { parseNewsContent } from "./content-format";

export type NewsListItem = {
  id: number;
  title: string;
  published: boolean;
  createdAt: Date;
};

export type NewsEditorData = {
  id: number;
  title: string;
  bajada: string;
  cuerpo: string;
  published: boolean;
  image: string | null;
};

export async function getNewsList() {
  noStore();
  const news = await findManyNews();

  return news.map((item) => ({
    id: item.id,
    title: item.title,
    published: item.published,
    createdAt: item.createdAt,
  })) as NewsListItem[];
}

export async function getNewsById(id: number) {
  noStore();
  const item = await findNewsById(id);

  if (!item) {
    return null;
  }

  const contentParts = parseNewsContent(item.content);

  return {
    id: item.id,
    title: item.title,
    bajada: contentParts.bajada,
    cuerpo: contentParts.cuerpo,
    published: item.published,
    image: item.image,
  } as NewsEditorData;
}
