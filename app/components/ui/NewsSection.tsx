"use client";

import { useMemo, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Calendar, Pencil } from "lucide-react";
import { Container } from "@/app/components/ui/Container";
import { HomeNewsItem } from "@/app/components/ui/home-types";
import { serializeNewsContent } from "@/app/admin/noticias/content-format";
import { RichTextEditor } from "@/app/components/ui/RichTextEditor";

type NewsSectionProps = {
  news: HomeNewsItem[];
  initialDisplayCount?: number;
  incrementBy?: number;
  canEditNews?: boolean;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function extractExcerpt(content: string, fallback: string | undefined) {
  if (fallback && fallback.trim().length > 0) {
    return fallback;
  }

  const plain = stripHtml(content);
  if (plain.length <= 160) {
    return plain;
  }

  return `${plain.slice(0, 157)}...`;
}

export function NewsSection({
  news,
  initialDisplayCount = 3,
  incrementBy = 3,
  canEditNews = false,
}: NewsSectionProps) {
  const [newsItems, setNewsItems] = useState<HomeNewsItem[]>(news);
  const [activeArticleId, setActiveArticleId] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftImagePosition, setDraftImagePosition] = useState({ x: 50, y: 50 });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const imageDragState = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const normalizedNews = useMemo(
    () =>
      newsItems.map((item) => ({
        ...item,
        excerpt: extractExcerpt(item.content, item.excerpt),
      })),
    [newsItems],
  );

  const visibleNews = useMemo(() => normalizedNews.slice(0, displayCount), [displayCount, normalizedNews]);

  const active = useMemo(
    () => (activeArticleId === null ? null : normalizedNews.find((item) => item.id === activeArticleId) ?? null),
    [activeArticleId, normalizedNews],
  );

  const isDetailOpen = active !== null;
  const hasMore = displayCount < normalizedNews.length;

  function parseImagePos(pos: string): { x: number; y: number } {
    const match = pos.match(/^(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
    if (match) return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
    return { x: 50, y: 50 };
  }

  function handleImageMouseDown(event: MouseEvent<HTMLDivElement>) {
    imageDragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      posX: draftImagePosition.x,
      posY: draftImagePosition.y,
    };
    event.preventDefault();
  }

  function handleImageMouseMove(event: MouseEvent<HTMLDivElement>) {
    if (!imageDragState.current || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const dx = event.clientX - imageDragState.current.startX;
    const dy = event.clientY - imageDragState.current.startY;
    const newX = Math.max(0, Math.min(100, imageDragState.current.posX - (dx / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, imageDragState.current.posY - (dy / rect.height) * 100));
    setDraftImagePosition({ x: newX, y: newY });
  }

  function handleImageMouseUp() {
    imageDragState.current = null;
  }

  function handleShowMore() {
    setDisplayCount((current) => Math.min(current + incrementBy, normalizedNews.length));
  }

  async function handleSave() {
    if (!active) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const imagePositionValue = `${draftImagePosition.x.toFixed(1)}% ${draftImagePosition.y.toFixed(1)}%`;
      const response = await fetch(`/api/news/${active.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draftTitle.trim(),
          content: serializeNewsContent({
            bajada: active.bajada,
            cuerpo: draftBody.trim(),
          }),
          imagePosition: imagePositionValue,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo guardar la noticia.");
      }

      const savedImagePosition = `${draftImagePosition.x.toFixed(1)}% ${draftImagePosition.y.toFixed(1)}%`;
      setNewsItems((current) =>
        current.map((item) =>
          item.id === active.id
            ? {
                ...item,
                title: draftTitle.trim(),
                content: draftBody.trim(),
                excerpt: item.bajada,
                imagePosition: savedImagePosition,
              }
            : item,
        ),
      );
      setIsEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "No se pudo guardar la noticia.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section id="novedades" className="bg-gov-warm py-24">
      <Container>
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Actualidad</p>
          <h2 className="mb-4 font-heading text-4xl text-foreground md:text-5xl">Novedades</h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Mantente informado sobre las ultimas novedades de gobierno abierto y transparencia municipal.
          </p>
        </div>

        <div
          className={`mx-auto max-w-6xl overflow-hidden transition-all duration-500 ease-out ${
            isDetailOpen ? "max-h-none translate-y-0 opacity-100" : "pointer-events-none max-h-0 -translate-y-4 opacity-0"
          }`}
          aria-hidden={!isDetailOpen}
        >
          {active ? (
            <div className="news-detail-surface">
              <button
                type="button"
                onClick={() => {
                  setActiveArticleId(null);
                  setIsEditing(false);
                  setSaveError(null);
                }}
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-gov-cyan-light"
              >
                <ArrowLeft size={16} aria-hidden="true" /> Volver a novedades
              </button>

              <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-slate-900/10">
                <div className="h-2 bg-linear-to-r from-secondary via-primary to-gov-green" aria-hidden="true" />
                <div className="p-8 md:p-12">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {active.tag}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar size={12} aria-hidden="true" /> {formatDate(active.createdAt)}
                      </span>
                    </div>
                    {canEditNews ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing((current) => !current);
                          setDraftTitle(active.title);
                          setDraftBody(active.content);
                          setDraftImagePosition(parseImagePos(active.imagePosition));
                          setSaveError(null);
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/20"
                        aria-label={`Editar noticia ${active.title}`}
                      >
                        <Pencil size={12} aria-hidden="true" /> {isEditing ? "Cerrar" : "Editar"}
                      </button>
                    ) : null}
                  </div>
                  {isEditing ? (
                    <div className="mb-6 space-y-4">
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Titulo
                        </label>
                        <input
                          type="text"
                          value={draftTitle}
                          onChange={(event) => setDraftTitle(event.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          Texto
                        </label>
                        <RichTextEditor value={draftBody} onChange={setDraftBody} minHeight="min-h-40" />
                      </div>
                      {saveError ? <p className="text-sm text-red-500">{saveError}</p> : null}
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-400"
                        >
                          {isSaving ? "Guardando" : "Guardar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setDraftTitle(active.title);
                            setDraftBody(active.content);
                            setDraftImagePosition(parseImagePos(active.imagePosition));
                            setSaveError(null);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-primary/40"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <h3 className="mb-6 font-heading text-3xl text-foreground md:text-4xl">{active.title}</h3>
                  )}
                  {active.image ? (
                    <div className="mb-6 space-y-1">
                      {isEditing ? (
                        <div
                          ref={imageContainerRef}
                          className="relative cursor-grab overflow-hidden rounded-2xl border border-border active:cursor-grabbing"
                          onMouseDown={handleImageMouseDown}
                          onMouseMove={handleImageMouseMove}
                          onMouseUp={handleImageMouseUp}
                          onMouseLeave={handleImageMouseUp}
                        >
                          <Image
                            src={active.image}
                            alt={`Imagen de ${active.title}`}
                            width={960}
                            height={540}
                            unoptimized
                            className="pointer-events-none h-64 w-full object-cover md:h-80"
                            style={{ objectPosition: `${draftImagePosition.x.toFixed(1)}% ${draftImagePosition.y.toFixed(1)}%` }}
                            draggable={false}
                          />
                          <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-2">
                            <span className="rounded-md bg-black/50 px-2 py-1 text-xs text-white">
                              Arrastrá para reencuadrar
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="overflow-hidden rounded-2xl border border-border">
                          <Image
                            src={active.image}
                            alt={`Imagen de ${active.title}`}
                            width={960}
                            height={540}
                            unoptimized
                            className="h-64 w-full object-cover md:h-80"
                            style={{ objectPosition: active.imagePosition }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-6 flex h-56 w-full items-center justify-center rounded-2xl border border-dashed border-border bg-muted text-sm text-muted-foreground">
                      Sin imagen principal
                    </div>
                  )}
                  {!isEditing ? (
                    <>
                      {(() => {
                        const bajadaText = stripHtml(active.bajada);
                        return bajadaText ? (
                          <p className="mb-6 border-l-4 border-primary/60 pl-4 font-heading text-lg leading-relaxed text-foreground md:text-xl">
                            {bajadaText}
                          </p>
                        ) : null;
                      })()}
                      <div
                        className="max-w-none text-muted-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:mb-4 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_h3]:mb-3 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-foreground [&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:font-semibold [&_h4]:text-foreground [&_li]:mb-1 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:text-foreground [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
                        dangerouslySetInnerHTML={{ __html: active.content }}
                      />
                    </>
                  ) : null}
                </div>
              </article>
            </div>
          ) : null}
        </div>

        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${
            isDetailOpen ? "pointer-events-none max-h-0 -translate-y-4 opacity-0" : "max-h-none translate-y-0 opacity-100"
          }`}
          aria-hidden={isDetailOpen}
        >
          <div className="grid gap-6 md:grid-cols-3">
            {visibleNews.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="h-2 bg-linear-to-r from-secondary via-primary to-gov-green" aria-hidden="true" />
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={`Imagen de ${item.title}`}
                      width={640}
                      height={360}
                      unoptimized
                      className="h-full w-full object-cover"
                      style={{ objectPosition: item.imagePosition }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {item.tag}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar size={12} aria-hidden="true" /> {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <h3 className="mb-2 font-heading text-lg text-foreground transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{item.excerpt}</p>

                  <button
                    type="button"
                    onClick={() => setActiveArticleId(item.id)}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all hover:gap-2"
                    aria-label={`Leer mas sobre ${item.title}`}
                  >
                    Leer mas <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>

          {hasMore ? (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleShowMore}
                className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-6 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary/20"
              >
                Ver mas novedades ({normalizedNews.length - displayCount} mas)
              </button>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
