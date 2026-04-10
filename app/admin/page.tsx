import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/auth";

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

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">Panel de administración</p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Bienvenido al área interna</h2>
        <p className="max-w-3xl text-base text-slate-600">
          Acceso validado para {session.user.email ?? "usuario autenticado"}. Desde aquí podés publicar novedades,
          gestionar noticias y mantener actualizada la portada del portal.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/noticias"
          className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300"
        >
          <h3 className="text-lg font-semibold text-slate-900">Listado de noticias</h3>
          <p className="mt-2 text-sm text-slate-600">Revisá el estado, fecha de carga y edición de cada noticia.</p>
        </Link>

        <Link
          href="/admin/noticias/editor"
          className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300"
        >
          <h3 className="text-lg font-semibold text-slate-900">Crear nueva noticia</h3>
          <p className="mt-2 text-sm text-slate-600">
            Redactá título, bajada y cuerpo de la noticia, y adjuntá una imagen principal.
          </p>
        </Link>
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-medium text-emerald-900">
          Consejo editorial: cargá las noticias como borrador y publicalas cuando estén validadas.
        </p>
      </div>
    </section>
  );
}
