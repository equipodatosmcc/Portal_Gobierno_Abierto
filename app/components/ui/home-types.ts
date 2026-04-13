export type HomeNewsItem = {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  tag: string;
  image: string | null;
  createdAt: string;
};

export type HomeWebContentItem = {
  id: number;
  slug: string;
  title: string;
  content: string;
};
