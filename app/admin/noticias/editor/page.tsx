import Link from "next/link";
import { NewsEditorForm } from "./news-editor-form";
import { getNewsById } from "../data";

type EditorPageProps = {
  searchParams: Promise<{
    id?: string;
  }>;
};

export default async function NewsEditorPage({ searchParams }: EditorPageProps) {
  const params = await searchParams;
  const id = Number(params.id);
  const hasValidId = Number.isInteger(id) && id > 0;
  const existingNews = hasValidId ? await getNewsById(id) : null;

  const initialData = existingNews
    ? {
        id: existingNews.id,
        title: existingNews.title,
        bajada: existingNews.bajada,
        cuerpo: existingNews.cuerpo,
        status: existingNews.published ? ("published" as const) : ("draft" as const),
        imageUrl: existingNews.image,
      }
    : {
        title: "",
        bajada: "",
        cuerpo: "",
        status: "draft" as const,
        imageUrl: null,
      };

  const isEditing = Boolean(existingNews);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-sky-700 uppercase">Editor</p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          {isEditing ? "Editar noticia" : "Redactar noticia"}
        </h2>
        <p className="max-w-3xl text-sm text-slate-600">
          Completá título, bajada, cuerpo y estado. Podés adjuntar una imagen para la portada.
        </p>
      </header>

      {hasValidId && !existingNews ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
          No encontramos la noticia solicitada. Podés crear una nueva desde este formulario.
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <NewsEditorForm initialData={initialData} />
      </div>

      <Link href="/admin/noticias" className="inline-flex text-sm font-semibold text-sky-700 hover:text-sky-800">
        Volver al listado
      </Link>
    </section>
  );
}

