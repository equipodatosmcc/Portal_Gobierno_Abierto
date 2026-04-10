import { unstable_noStore as noStore } from "next/cache";
import { readNewsFile } from "./news-store";

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
  const news = await readNewsFile();

  return news
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((item) => ({
      id: item.id,
      title: item.title,
      published: item.published,
      createdAt: new Date(item.createdAt),
    })) as NewsListItem[];
}

export async function getNewsById(id: number) {
  noStore();
  const news = await readNewsFile();
  const item = news.find((entry) => entry.id === id);

  if (!item) {
    return null;
  }

  return {
    id: item.id,
    title: item.title,
    bajada: item.bajada,
    cuerpo: item.cuerpo,
    published: item.published,
    image: item.image,
  } as NewsEditorData;
}
