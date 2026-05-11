"use client";

import { useActionState, useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { saveNewsAction, type NewsEditorState } from "../actions";
import { RichTextEditor } from "@/app/components/ui/RichTextEditor";

type NewsEditorFormProps = {
  initialData: {
    id?: number;
    title: string;
    bajada: string;
    cuerpo: string;
    category?: string;
    status: "draft" | "published";
    imageUrl?: string | null;
  };
  existingCategories: string[];
};

const initialActionState: NewsEditorState = { status: "idle" };

type ClientFieldErrors = Partial<Record<"title" | "bajada" | "cuerpo" | "image", string>>;

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
}

function validateFormData(formData: FormData): ClientFieldErrors {
  const errors: ClientFieldErrors = {};

  const title = String(formData.get("title") ?? "").trim();
  const bajadaHtml = String(formData.get("bajada") ?? "").trim();
  const cuerpoHtml = String(formData.get("cuerpo") ?? "").trim();
  const fileValue = formData.get("image");
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null;

  if (title.length < 5) errors.title = "El título debe tener al menos 5 caracteres.";
  if (stripHtml(bajadaHtml).length < 10) errors.bajada = "La bajada debe tener al menos 10 caracteres.";
  if (stripHtml(cuerpoHtml).length < 20) errors.cuerpo = "El cuerpo debe tener al menos 20 caracteres.";

  if (file) {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowedTypes.has(file.type)) {
      errors.image = "Formato inválido. Usá JPG, PNG o WEBP.";
    }

    if (file.size > 5 * 1024 * 1024) {
      errors.image = "La imagen supera los 5MB.";
    }
  }

  return errors;
}

function buildExcerpt(bajada: string, cuerpo: string) {
  const trimmedBajada = stripHtml(bajada);
  if (trimmedBajada) {
    return trimmedBajada;
  }

  const plain = stripHtml(cuerpo);
  if (!plain) {
    return "Completá la noticia para ver un extracto.";
  }

  if (plain.length <= 160) {
    return plain;
  }

  return `${plain.slice(0, 157)}...`;
}

export function NewsEditorForm({ initialData, existingCategories }: NewsEditorFormProps) {
  const [state, formAction, isPending] = useActionState(saveNewsAction, initialActionState);
  const [clientErrors, setClientErrors] = useState<ClientFieldErrors>({});
  const [title, setTitle] = useState(initialData.title);
  const [bajada, setBajada] = useState(initialData.bajada);
  const [cuerpo, setCuerpo] = useState(initialData.cuerpo);

  const isInitialCategoryExisting = initialData.category ? existingCategories.includes(initialData.category) : true;
  
  const [isNewCategory, setIsNewCategory] = useState(!isInitialCategoryExisting);
  const [selectedCategory, setSelectedCategory] = useState(
    !isInitialCategoryExisting ? "" : (initialData.category || existingCategories[0])
  );
  const [newCategory, setNewCategory] = useState(!isInitialCategoryExisting ? (initialData.category ?? "") : "");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(initialData.imageUrl ?? null);

  const mergedErrors = useMemo(() => ({ ...state.fieldErrors, ...clientErrors }), [clientErrors, state.fieldErrors]);

  const previewCategory = (isNewCategory ? newCategory.trim() : selectedCategory) || "Sin categoria";
  const previewTitle = title.trim() || "Titulo de la noticia";
  const previewCuerpo = cuerpo.trim();
  const previewExcerpt = buildExcerpt(bajada, cuerpo);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const errors = validateFormData(formData);
    setClientErrors(errors);

    if (Object.keys(errors).length > 0) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-5" noValidate>
      <input type="hidden" name="id" value={initialData.id ?? ""} />
      <input type="hidden" name="existingImage" value={initialData.imageUrl ?? ""} />

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-semibold text-slate-700">
          Título
        </label>
        <input
          id="title"
          name="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título de la noticia"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition-colors focus-visible:border-sky-600 focus-visible:ring-4 focus-visible:ring-sky-100"
          required
          minLength={5}
        />
        {mergedErrors.title ? <p className="text-xs font-medium text-red-600">{mergedErrors.title}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Bajada</label>
        <input type="hidden" name="bajada" value={bajada} />
        <RichTextEditor value={bajada} onChange={setBajada} minHeight="min-h-24" />
        {mergedErrors.bajada ? <p className="text-xs font-medium text-red-600">{mergedErrors.bajada}</p> : null}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-700">Cuerpo</label>
        <input type="hidden" name="cuerpo" value={cuerpo} />
        <RichTextEditor value={cuerpo} onChange={setCuerpo} minHeight="min-h-48" />
        {mergedErrors.cuerpo ? <p className="text-xs font-medium text-red-600">{mergedErrors.cuerpo}</p> : null}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_220px_220px]">
        <div className="space-y-2">
          <label htmlFor="image" className="text-sm font-semibold text-slate-700">
            Imagen principal
          </label>
          <input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (imagePreviewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(imagePreviewUrl);
              }
              if (!file) {
                setImagePreviewUrl(initialData.imageUrl ?? null);
                return;
              }
              setImagePreviewUrl(URL.createObjectURL(file));
            }}
          />
          {mergedErrors.image ? <p className="text-xs font-medium text-red-600">{mergedErrors.image}</p> : null}
          <p className="text-xs text-slate-500">Formatos permitidos: JPG, PNG o WEBP. Tamaño máximo 5MB.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-semibold text-slate-700">
            Categoría
          </label>
          <select
            id="category-select"
            value={isNewCategory ? "NEW_CATEGORY_ACTION" : selectedCategory}
            onChange={(e) => {
              if (e.target.value === "NEW_CATEGORY_ACTION") {
                setIsNewCategory(true);
                setSelectedCategory("");
                setNewCategory("");
              } else {
                setIsNewCategory(false);
                setSelectedCategory(e.target.value);
              }
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus-visible:border-sky-600 focus-visible:ring-4 focus-visible:ring-sky-100"
            name={isNewCategory ? "category_ignore" : "category"}
          >
            {existingCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="NEW_CATEGORY_ACTION" className="font-semibold text-sky-700">
              ➕ Agregar nueva categoría...
            </option>
          </select>
          {isNewCategory && (
            <input
              type="text"
              name="category"
              autoFocus
              placeholder="Nueva categoría..."
              required
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus-visible:border-sky-600 focus-visible:ring-4 focus-visible:ring-sky-100"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
            />
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-semibold text-slate-700">
            Estado
          </label>
          <select
            id="status"
            name="status"
            defaultValue={initialData.status}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus-visible:border-sky-600 focus-visible:ring-4 focus-visible:ring-sky-100"
          >
            <option value="draft">Borrador</option>
            <option value="published">Publicada</option>
          </select>
        </div>
      </div>

      {initialData.imageUrl ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">Imagen actual</p>
          <Image
            src={initialData.imageUrl}
            alt="Imagen principal de la noticia"
            width={640}
            height={352}
            className="h-44 w-full rounded-2xl border border-slate-200 object-cover md:w-80"
          />
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-2 rounded-t-2xl bg-linear-to-r from-secondary via-primary to-gov-green" aria-hidden="true" />
        <div className="p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {previewCategory}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Vista previa</span>
          </div>
          <h3 className="mb-4 font-heading text-2xl text-slate-900 md:text-3xl">{previewTitle}</h3>
          {imagePreviewUrl ? (
            <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200">
              <Image
                src={imagePreviewUrl}
                alt="Vista previa de la imagen principal"
                width={960}
                height={540}
                sizes="(min-width: 768px) 700px, 100vw"
                className="h-56 w-full object-cover md:h-72"
                unoptimized
              />
            </div>
          ) : (
            <div className="mb-5 flex h-48 w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
              Sin imagen principal
            </div>
          )}
          <p className="mb-5 text-sm text-slate-600 md:text-base">{previewExcerpt}</p>
          {previewCuerpo ? (
            <div
              className="prose prose-sm max-w-none text-slate-700 md:prose-base [&_a]:text-sky-600 [&_a]:underline [&_strong]:text-slate-900"
              dangerouslySetInnerHTML={{ __html: previewCuerpo }}
            />
          ) : (
            <p className="text-sm text-slate-400">El cuerpo de la noticia se mostrara aqui.</p>
          )}
        </div>
      </section>

      {state.status === "error" && state.message ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isPending ? "Guardando..." : "Guardar noticia"}
      </button>
    </form>
  );
}
