"use client";

import { useActionState, useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent } from "react";
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
    imagePosition?: string | null;
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

function parseImagePosition(raw: string | null | undefined): { x: number; y: number } {
  const match = (raw ?? "50% 50%").match(/^(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  if (match) return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
  return { x: 50, y: 50 };
}

export function NewsEditorForm({ initialData, existingCategories }: NewsEditorFormProps) {
  const [state, formAction, isPending] = useActionState(saveNewsAction, initialActionState);
  const [clientErrors, setClientErrors] = useState<ClientFieldErrors>({});
  const [title, setTitle] = useState(initialData.title);
  const [bajada, setBajada] = useState(initialData.bajada);
  const [cuerpo, setCuerpo] = useState(initialData.cuerpo);
  const [imagePosition, setImagePosition] = useState(() => parseImagePosition(initialData.imagePosition));
  const dragState = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

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

  function handleImageMouseDown(event: MouseEvent<HTMLDivElement>) {
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      posX: imagePosition.x,
      posY: imagePosition.y,
    };
    event.preventDefault();
  }

  function handleImageMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (!dragState.current || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const dx = event.clientX - dragState.current.startX;
    const dy = event.clientY - dragState.current.startY;
    const newX = Math.max(0, Math.min(100, dragState.current.posX - (dx / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, dragState.current.posY - (dy / rect.height) * 100));
    setImagePosition({ x: newX, y: newY });
  }

  function handleImageMouseUp() {
    dragState.current = null;
  }

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
      <input type="hidden" name="imagePosition" value={`${imagePosition.x.toFixed(1)}% ${imagePosition.y.toFixed(1)}%`} />

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
            unoptimized
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
            <div className="mb-5 space-y-1">
              <div
                ref={imageContainerRef}
                className="relative cursor-grab overflow-hidden rounded-2xl border border-slate-200 active:cursor-grabbing"
                onMouseDown={handleImageMouseDown}
                onMouseMove={handleImageMouseMove}
                onMouseUp={handleImageMouseUp}
                onMouseLeave={handleImageMouseUp}
              >
                <Image
                  src={imagePreviewUrl}
                  alt="Vista previa de la imagen principal"
                  width={960}
                  height={540}
                  sizes="(min-width: 768px) 700px, 100vw"
                  className="pointer-events-none h-56 w-full object-cover md:h-72"
                  style={{ objectPosition: `${imagePosition.x.toFixed(1)}% ${imagePosition.y.toFixed(1)}%` }}
                  unoptimized
                  draggable={false}
                />
                <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-2">
                  <span className="rounded-md bg-black/50 px-2 py-1 text-xs text-white">
                    Arrastrá para reencuadrar
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-5 flex h-48 w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
              Sin imagen principal
            </div>
          )}
          <p className="mb-5 text-sm text-slate-600 md:text-base">{previewExcerpt}</p>
          {previewCuerpo ? (
            <div
              className="max-w-none text-slate-700 [&_a]:text-sky-600 [&_a]:underline [&_blockquote]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h3]:mb-3 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-slate-900 [&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:font-semibold [&_h4]:text-slate-900 [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:text-slate-900 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
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
