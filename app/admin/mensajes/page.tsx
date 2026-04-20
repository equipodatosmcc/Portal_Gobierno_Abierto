import { authOptions } from "@/auth";
import { findManyCitizenMessages } from "@/lib/services/citizen";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { MessagesTable } from "./components/messages-table";

export default async function AdminMensajesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const messages = await findManyCitizenMessages();
  const pendingCount = messages.filter((m) => m.status === "pending").length;
  const resolvedCount = messages.filter((m) => m.status === "resolved").length;

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-widest text-sky-700 uppercase">Buzón Ciudadano</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Mensajes ciudadanos</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-600">
            Solicitudes y feedback recibidos desde el portal. Ordenados por fecha de envío descendente.
          </p>
        </div>
        <a
          href="/api/admin/mensajes/export"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          <Download size={16} aria-hidden="true" />
          Descargar CSV
        </a>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Total</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{messages.length}</p>
        </article>
        <article className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold tracking-widest text-amber-700 uppercase">Pendientes</p>
          <p className="mt-2 text-2xl font-bold text-amber-900">{pendingCount}</p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">Resueltos</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{resolvedCount}</p>
        </article>
      </div>

      <MessagesTable messages={messages} />
    </section>
  );
}
