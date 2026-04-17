import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/auth";
import prisma from "@/lib/prisma";
import { 
  FileText, 
  MessageSquare, 
  Users, 
  LayoutTemplate,
  ArrowRight,
  PlusCircle,
  Pencil,
  Clock
} from "lucide-react";
import { DashboardCharts } from "./components/dashboard-charts";

export default async function AdminPage() {
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }

  if (!session?.user) {
    redirect("/login");
  }

  // 1. Fetch KPIs
  const [
    totalNews, 
    publishedNews,
    pendingMessages,
    totalEditors,
    totalWebContent
  ] = await Promise.all([
    prisma.news.count(),
    prisma.news.count({ where: { published: true } }),
    prisma.contactForm.count({ where: { status: "pending" } }),
    prisma.user.count({ where: { role: { in: ["ADMIN", "EDITOR"] } } }),
    prisma.webContent.count()
  ]);

  // 2. Fetch Recent Activity
  const recentNews = await prisma.news.findMany({
    take: 4,
    orderBy: { updatedAt: "desc" },
    include: { author: true }
  });

  // 3. Fetch Data for Chart (News by Category)
  const newsByCategoryRaw = await prisma.news.groupBy({
    by: ["category"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 6
  });

  const chartData = newsByCategoryRaw.map(item => ({
    name: item.category,
    value: item._count.id
  }));

  return (
    <section className="space-y-8 pb-10">
      <header className="space-y-3">
        <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">Panel de control</p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Bienvenido, {session.user.name || "Administrador"}</h2>
        <p className="max-w-3xl text-base text-slate-600">
          Este es el resumen de actividad de tu portal. Desde aquí podés monitorear el contenido y gestionar rápidamente las secciones principales.
        </p>
      </header>

      {/* KPIs Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Noticias Publicadas</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{publishedNews}</h3>
            <p className="text-xs font-medium text-slate-500">de {totalNews} totales</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Mensajes Pendientes</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <MessageSquare size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{pendingMessages}</h3>
            <p className="text-xs font-medium text-slate-500">por responder</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Editores Activos</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{totalEditors}</h3>
            <p className="text-xs font-medium text-slate-500">registrados</p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Contenido Dinámico</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <LayoutTemplate size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{totalWebContent}</h3>
            <p className="text-xs font-medium text-slate-500">elementos editables</p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Recent Activity & Shortcuts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Chart Section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Noticias por Categoría</h3>
              <p className="text-sm text-slate-500">Distribución de los artículos publicados en el portal.</p>
            </div>
            <DashboardCharts data={chartData} />
          </div>
        </div>

        {/* Right Column: Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-widest px-1">Acciones Rápidas</h3>
          
          <Link
            href="/admin/noticias/editor"
            className="group flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
              <PlusCircle size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Crear nueva noticia</h4>
              <p className="mt-1 text-xs text-slate-500">Redactar y publicar un nuevo artículo en el portal.</p>
            </div>
          </Link>

          <Link
            href="/admin/contenido"
            className="group flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
              <LayoutTemplate size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Personalizar Portada</h4>
              <p className="mt-1 text-xs text-slate-500">Editar los textos y tarjetas de la sección Transparencia.</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent News Table (Full Width) */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Actividad Reciente</h3>
          <Link href="/admin/noticias" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {recentNews.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-slate-500">
              Aún no hay noticias creadas.
            </li>
          ) : (
            recentNews.map((news) => (
              <li key={news.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/50 transition">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{news.title}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {new Date(news.updatedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{news.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                    news.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {news.published ? 'Publicado' : 'Borrador'}
                  </span>
                  <Link 
                    href={`/admin/noticias/editor?id=${news.id}`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition"
                    title="Editar noticia"
                  >
                    <Pencil size={16} />
                  </Link>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
