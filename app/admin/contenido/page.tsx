import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { EditorForm } from "./editor-form";
import { findManyWebContent } from "@/lib/services/webcontent";

export const metadata = {
  title: "Editor de Contenido Web",
};

export default async function ContenidoPage() {
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }

  if (!session?.user) {
    redirect("/login");
  }

  // Find the published records for the Transparency section
  const contentRecords = await findManyWebContent({ onlyPublished: true });
  
  const transparencyItems = contentRecords
    .filter((c) => c.slug.startsWith("transparencia-"))
    .map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      content: item.content,
      icon: item.icon,
    }));

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">Panel de administración</p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Contenido Web</h2>
        <p className="max-w-3xl text-base text-slate-600">
          Desde aquí podés personalizar los textos principales de las secciones informativas del portal.
        </p>
      </header>

      {transparencyItems.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
          No se encontraron registros de contenido para la sección Transparencia. Asegúrate de haber inicializado la base de datos con los textos predeterminados.
        </div>
      ) : (
        <EditorForm items={transparencyItems} />
      )}
    </section>
  );
}
