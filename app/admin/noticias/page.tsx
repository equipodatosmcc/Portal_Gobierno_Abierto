import Link from "next/link";
import { NewsOrderTable } from "./components/news-order-table";
import { getNewsList } from "./data";

export default async function AdminNewsPage() {
  const news = await getNewsList();
  const publishedCount = news.filter((item) => item.published).length;
  const draftCount = news.length - publishedCount;

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest text-sky-700 uppercase">Noticias</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Gestión de noticias</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Visualizá el estado de cada publicación y administrá ediciones desde esta tabla.
          </p>
        </div>
        <Link
          href="/admin/noticias/editor"
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Redactar noticia
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Total</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{news.length}</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">Publicadas</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{publishedCount}</p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold tracking-widest text-amber-700 uppercase">Borradores</p>
          <p className="mt-2 text-2xl font-bold text-amber-900">{draftCount}</p>
        </article>
      </div>

      <NewsOrderTable news={news} />
    </section>
  );
}
