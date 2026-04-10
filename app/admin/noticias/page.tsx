import Link from "next/link";
import { ToggleNewsStatusButton } from "./components/toggle-news-status-button";
import { getNewsList } from "./data";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

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

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Título</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {news.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                    Todavía no hay noticias cargadas.
                  </td>
                </tr>
              ) : (
                news.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <span
                        className={
                          item.published
                            ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
                            : "inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"
                        }
                      >
                        {item.published ? "Publicada" : "Borrador"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{dateFormatter.format(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{item.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <ToggleNewsStatusButton id={item.id} title={item.title} published={item.published} />
                        <Link
                          href={`/admin/noticias/editor?id=${item.id}`}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
