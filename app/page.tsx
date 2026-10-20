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
import {
  getActasInfraccionData,
  getArboladoData,
  getCKANDatasetsCount,
  getEnfermeriaData,
  getHabChoferesData,
  getHabTransporteData,
  getInmunizacionesData,
  getOdontologicasData,
  getRetirosViaPublicaData,
  getSacData,
  ARBOLADO_EMPTY,
  ENFERMERIA_EMPTY,
  ODONTOLOGICAS_EMPTY,
  INMUNIZACIONES_EMPTY,
  SAC_EMPTY,
  ACTAS_INFRACCION_EMPTY,
  HAB_CHOFERES_EMPTY,
  HAB_TRANSPORTE_EMPTY,
  RETIROS_VIA_PUBLICA_EMPTY,
} from "@/lib/data/ckanService";
import { getDashboardData } from "@/lib/data/dashboard_snapshots";
import { buildDashboards } from "@/lib/data/dashboards";
import { getSessionManager } from "@/lib/content-auth";
import { findManyNews } from "@/lib/services/news";
import { findManyWebContent, isNewsSectionVisible } from "@/lib/services/webcontent";

export const revalidate = 1800;

type NewsRecord = {
  id: number;
  title: string;
  content: string;
  category: string;
  image: string | null;
  imagePosition: string | null;
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
  const [
    newsRecords,
    contentRecords,
    arboladoData,
    enfermeriaData,
    odontologicasData,
    inmunizacionesData,
    sacData,
    actasInfraccionData,
    habChoferesData,
    habTransporteData,
    retirosViaPublicaData,
    datasetsCount,
    showNews,
  ] = await Promise.all([
    findManyNews({ onlyPublished: true }).catch(() => []),
    findManyWebContent({ onlyPublished: true }).catch(() => []),
    getDashboardData("arbolado", getArboladoData, (d) => d.topEspecies.length > 0, ARBOLADO_EMPTY),
    getDashboardData("enfermeria", getEnfermeriaData, (d) => d.topPrestaciones.length > 0, ENFERMERIA_EMPTY),
    getDashboardData("odontologicas", getOdontologicasData, (d) => d.topPracticas.length > 0, ODONTOLOGICAS_EMPTY),
    getDashboardData("inmunizaciones", getInmunizacionesData, (d) => d.topVacunas.length > 0, INMUNIZACIONES_EMPTY),
    getDashboardData("sac", getSacData, (d) => d.topAsuntos.length > 0, SAC_EMPTY),
    getDashboardData("actas_infraccion", getActasInfraccionData, (d) => d.byMes.length > 0, ACTAS_INFRACCION_EMPTY),
    getDashboardData("hab_choferes", getHabChoferesData, (d) => d.byAnio.length > 0, HAB_CHOFERES_EMPTY),
    getDashboardData("hab_transporte", getHabTransporteData, (d) => d.byCategoria.length > 0, HAB_TRANSPORTE_EMPTY),
    getDashboardData("retiros_via_publica", getRetirosViaPublicaData, (d) => d.byMes.length > 0, RETIROS_VIA_PUBLICA_EMPTY),
    getCKANDatasetsCount(),
    isNewsSectionVisible().catch(() => true),
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
      excerpt: bajadaText || undefined,
      tag: item.category,
      image: item.image,
      imagePosition: item.imagePosition ?? "50% 50%",
      createdAt: item.updatedAt.toISOString(),
    };
  });

  const gobiernoAbiertoItems = (contentRecords as WebContentRecord[])
    .filter((c) => c.slug.startsWith("gobierno-abierto-"))
    .map((item) => ({ id: item.id, slug: item.slug, title: item.title, content: item.content, icon: item.icon }));

  return {
    news,
    newsCount: newsRecords.length,
    gobiernoAbiertoItems,
    arboladoData,
    enfermeriaData,
    odontologicasData,
    inmunizacionesData,
    sacData,
    actasInfraccionData,
    habChoferesData,
    habTransporteData,
    retirosViaPublicaData,
    datasetsCount,
    showNews,
  };
}

export default async function Home() {
  const [
    {
      news,
      newsCount,
      gobiernoAbiertoItems,
      arboladoData,
      enfermeriaData,
      odontologicasData,
      inmunizacionesData,
      sacData,
      actasInfraccionData,
      habChoferesData,
      habTransporteData,
      retirosViaPublicaData,
      datasetsCount,
      showNews,
    },
    manager,
  ] = await Promise.all([getHomeData(), getSessionManager()]);
  const dashboardsCount = buildDashboards({
    arboladoData,
    enfermeriaData,
    odontologicasData,
    inmunizacionesData,
    sacData,
    actasInfraccionData,
    habChoferesData,
    habTransporteData,
    retirosViaPublicaData,
  }).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SkipLink />
      <Header showNews={showNews} />
      <main id="main-content" aria-label="Contenido principal del portal">
        <HeroSection />
        <StatsSection
          datasetsCount={datasetsCount}
          dashboardsCount={dashboardsCount}
          newsCount={showNews ? newsCount : null}
        />
        <GobiernoAbiertoSection items={gobiernoAbiertoItems} canEdit={Boolean(manager)} />
        <DashboardsSection
          arboladoData={arboladoData}
          enfermeriaData={enfermeriaData}
          odontologicasData={odontologicasData}
          inmunizacionesData={inmunizacionesData}
          sacData={sacData}
          actasInfraccionData={actasInfraccionData}
          habChoferesData={habChoferesData}
          habTransporteData={habTransporteData}
          retirosViaPublicaData={retirosViaPublicaData}
        />
        {showNews ? <NewsSection news={news} canEditNews={Boolean(manager)} /> : null}
        <FeedbackSection />
      </main>
      <Footer showNews={showNews} />
    </div>
  );
}
