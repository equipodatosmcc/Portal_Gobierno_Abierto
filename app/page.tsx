import { DashboardsSection } from "@/app/components/ui/DashboardsSection";
import { FeedbackSection } from "@/app/components/ui/FeedbackSection";
import { Footer } from "@/app/components/ui/Footer";
import { Header } from "@/app/components/ui/Header";
import { HeroSection } from "@/app/components/ui/HeroSection";
import { NewsSection } from "@/app/components/ui/NewsSection";
import { SkipLink } from "@/app/components/ui/SkipLink";
import { StatsSection } from "@/app/components/ui/StatsSection";
import { TransparencySection } from "@/app/components/ui/TransparencySection";
import { HomeNewsItem, HomeWebContentItem } from "@/app/components/ui/home-types";
import { findManyNews } from "@/lib/services/news";
import { findManyWebContent } from "@/lib/services/webcontent";

export const revalidate = 1800;

type NewsRecord = {
  id: number;
  title: string;
  content: string;
  category: string;
  image: string | null;
  updatedAt: Date;
};

type WebContentRecord = {
  id: number;
  slug: string;
  title: string;
  content: string;
};

async function getHomeData() {
  const [newsRecords, contentRecords] = await Promise.all([
    findManyNews({ onlyPublished: true }).catch(() => []),
    findManyWebContent({ onlyPublished: true }).catch(() => []),
  ]);

  const news = (newsRecords as NewsRecord[]).slice(0, 12).map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    excerpt: item.content.replace(/\s+/g, " ").trim().slice(0, 170),
    tag: item.category,
    image: item.image,
    createdAt: item.updatedAt.toISOString(),
  }));

  const transparencyRecords = (contentRecords as WebContentRecord[]).filter((c) =>
    c.slug.startsWith("transparencia-")
  );

  const mainRecord = transparencyRecords.find((c) => c.slug === "transparencia-main");
  const cardsRecords = transparencyRecords
    .filter((c) => c.slug !== "transparencia-main")
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .slice(0, 4);

  const transparencyContent = {
    main: mainRecord ? { title: mainRecord.title, content: mainRecord.content } : null,
    cards: cardsRecords.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      content: item.content,
      icon: item.icon,
    })),
  };

  return { news, transparencyContent };
}

export default async function Home() {
  const { news, transparencyContent } = await getHomeData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SkipLink />
      <Header />
      <main id="main-content" aria-label="Contenido principal del portal">
        <HeroSection />
        <StatsSection
          datasetsCount={120}
          dashboardsCount={15}
          citizensReached="380K"
          reportsCount={Math.max(45, transparencyContent.length * 10)}
        />
        <DashboardsSection />
        <TransparencySection contents={transparencyContent} />
        <NewsSection news={news} />
        <FeedbackSection />
      </main>
      <Footer />
    </div>
  );
}
