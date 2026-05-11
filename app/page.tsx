import { DashboardsSection } from "@/app/components/ui/DashboardsSection";
import { FeedbackSection } from "@/app/components/ui/FeedbackSection";
import { Footer } from "@/app/components/ui/Footer";
import { Header } from "@/app/components/ui/Header";
import { HeroSection } from "@/app/components/ui/HeroSection";
import { NewsSection } from "@/app/components/ui/NewsSection";
import { SkipLink } from "@/app/components/ui/SkipLink";
import { StatsSection } from "@/app/components/ui/StatsSection";
import { GobiernoAbiertoSection } from "@/app/components/ui/GobiernoAbiertoSection";
import { parseNewsContent } from "@/app/admin/noticias/content-format";
import { getArboladoData, getCKANDatasetsCount } from "@/lib/data/ckanService";
import { buildDashboards } from "@/lib/data/dashboards";
import { getSessionManager } from "@/lib/content-auth";
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
  icon: string | null;
};

async function getHomeData() {
  const [newsRecords, contentRecords, arboladoData, datasetsCount] = await Promise.all([
    findManyNews({ onlyPublished: true }).catch(() => []),
    findManyWebContent({ onlyPublished: true }).catch(() => []),
    getArboladoData(),
    getCKANDatasetsCount(),
  ]);

  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();

  const news = (newsRecords as NewsRecord[]).slice(0, 12).map((item) => {
    const { bajada, cuerpo } = parseNewsContent(item.content);
    const bajadaText = stripHtml(bajada);
    const cuerpoText = stripHtml(cuerpo);
    return {
      id: item.id,
      title: item.title,
      bajada,
      content: cuerpo,
      excerpt: bajadaText || cuerpoText.slice(0, 170),
      tag: item.category,
      image: item.image,
      createdAt: item.updatedAt.toISOString(),
    };
  });

  const gobiernoAbiertoItems = (contentRecords as WebContentRecord[])
    .filter((c) => c.slug.startsWith("gobierno-abierto-"))
    .map((item) => ({ id: item.id, slug: item.slug, title: item.title, content: item.content, icon: item.icon }));

  return { news, newsCount: newsRecords.length, gobiernoAbiertoItems, arboladoData, datasetsCount };
}

export default async function Home() {
  const [{ news, newsCount, gobiernoAbiertoItems, arboladoData, datasetsCount }, manager] = await Promise.all([
    getHomeData(),
    getSessionManager(),
  ]);
  const dashboardsCount = buildDashboards(arboladoData).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SkipLink />
      <Header />
      <main id="main-content" aria-label="Contenido principal del portal">
        <HeroSection />
        <StatsSection
          datasetsCount={datasetsCount}
          dashboardsCount={dashboardsCount}
          newsCount={newsCount}
        />
        <GobiernoAbiertoSection items={gobiernoAbiertoItems} />
        <NewsSection news={news} canEditNews={Boolean(manager)} />
        <DashboardsSection arboladoData={arboladoData} />
        <FeedbackSection />
      </main>
      <Footer />
    </div>
  );
}
