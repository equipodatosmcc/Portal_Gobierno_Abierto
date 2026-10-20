import { findDashboardSnapshots } from "@/lib/data/dashboard_snapshots";

export const metadata = {
  title: "Estado de fuentes",
};

// Mismas keys que usa app/page.tsx al llamar a getDashboardData
const DASHBOARD_LABELS: Record<string, string> = {
  arbolado: "Arbolado urbano",
  enfermeria: "Prestaciones de enfermería",
  odontologicas: "Consultas odontológicas",
  inmunizaciones: "Inmunizaciones",
  sac: "Sistema de Atención Ciudadana (SAC)",
  actas_infraccion: "Actas de infracción",
  hab_choferes: "Habilitaciones a choferes",
  hab_transporte: "Habilitaciones de transporte",
  retiros_via_publica: "Retiros de la vía pública",
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

const BADGE = {
  ok: "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700",
  stale: "inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700",
  down: "inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700",
  pending: "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600",
};

export default async function AdminFuentesPage() {
  const snapshots = await findDashboardSnapshots();
  const byKey = new Map(snapshots.map((s) => [s.key, s]));

  const rows = Object.entries(DASHBOARD_LABELS).map(([key, label]) => {
    const snapshot = byKey.get(key);
    if (!snapshot) {
      return { key, label, snapshot, badge: BADGE.pending, status: "Sin cargar todavía" };
    }
    if (!snapshot.lastError) {
      return { key, label, snapshot, badge: BADGE.ok, status: "OK" };
    }
    if (snapshot.refreshedAt) {
      return { key, label, snapshot, badge: BADGE.stale, status: "Fallando · muestra último dato" };
    }
    return { key, label, snapshot, badge: BADGE.down, status: "Sin datos · tablero oculto" };
  });

  const failingCount = rows.filter((r) => r.snapshot?.lastError).length;

  return (
    <section className="space-y-6">
      <header>
        <p className="text-xs font-semibold tracking-widest text-sky-700 uppercase">Tableros</p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Estado de fuentes</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Cada tablero de la home se actualiza cada hora desde su planilla o dataset. Si una fuente falla, el portal
          sigue mostrando el último dato bueno.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">Funcionando</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900">{rows.length - failingCount}</p>
        </article>
        <article
          className={
            failingCount > 0
              ? "rounded-2xl border border-red-200 bg-red-50 p-4"
              : "rounded-2xl border border-slate-200 bg-slate-50 p-4"
          }
        >
          <p
            className={
              failingCount > 0
                ? "text-xs font-semibold tracking-widest text-red-700 uppercase"
                : "text-xs font-semibold tracking-widest text-slate-500 uppercase"
            }
          >
            Con error
          </p>
          <p className={failingCount > 0 ? "mt-2 text-2xl font-bold text-red-900" : "mt-2 text-2xl font-bold text-slate-900"}>
            {failingCount}
          </p>
        </article>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Tablero</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Último dato bueno</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Último chequeo</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map(({ key, label, snapshot, badge, status }) => (
                <tr key={key} className="align-middle">
                  <td className="px-4 py-3 font-medium text-slate-900">{label}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={badge}>{status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {snapshot?.refreshedAt ? dateFormatter.format(snapshot.refreshedAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {snapshot ? dateFormatter.format(snapshot.checkedAt) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{snapshot?.lastError ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
