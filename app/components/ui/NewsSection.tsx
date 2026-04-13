"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { Container } from "@/app/components/ui/Container";
import { HomeNewsItem } from "@/app/components/ui/home-types";

type NewsSectionProps = {
  news: HomeNewsItem[];
  initialDisplayCount?: number;
  incrementBy?: number;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function extractExcerpt(content: string, fallback: string) {
  if (fallback.trim().length > 0) {
    return fallback;
  }

  const plain = content.replace(/\s+/g, " ").trim();
  if (plain.length <= 160) {
    return plain;
  }

  return `${plain.slice(0, 157)}...`;
}

export function NewsSection({ news, initialDisplayCount = 3, incrementBy = 3 }: NewsSectionProps) {
  const [activeArticleId, setActiveArticleId] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(initialDisplayCount);

  const normalizedNews = useMemo(
    () =>
      news.map((item) => ({
        ...item,
        excerpt: extractExcerpt(item.content, item.excerpt),
      })),
    [news],
  );

  const visibleNews = useMemo(() => normalizedNews.slice(0, displayCount), [displayCount, normalizedNews]);

  const active = useMemo(
    () => (activeArticleId === null ? null : normalizedNews.find((item) => item.id === activeArticleId) ?? null),
    [activeArticleId, normalizedNews],
  );

  const isDetailOpen = active !== null;
  const hasMore = displayCount < normalizedNews.length;

  function handleShowMore() {
    setDisplayCount((current) => Math.min(current + incrementBy, normalizedNews.length));
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
                onClick={() => setActiveArticleId(null)}
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-gov-cyan-light"
              >
                <ArrowLeft size={16} aria-hidden="true" /> Volver a novedades
              </button>

              <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-slate-900/10">
                <div className="h-2 bg-linear-to-r from-secondary via-primary to-gov-green" aria-hidden="true" />
                <div className="p-8 md:p-12">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {active.tag}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar size={12} aria-hidden="true" /> {formatDate(active.createdAt)}
                    </span>
                  </div>
                  <h3 className="mb-6 font-heading text-3xl text-foreground md:text-4xl">{active.title}</h3>
                  <div className="prose prose-sm max-w-none md:prose-base">
                    {active.content.split("\n\n").map((paragraph, index) => (
                      <p key={`${active.id}-${index}`} className="mb-5 leading-relaxed text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}
                  </div>
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
