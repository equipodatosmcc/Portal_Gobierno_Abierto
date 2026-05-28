"use client";

import { useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { CalendarArrowDown, GripVertical } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { ToggleNewsStatusButton } from "./toggle-news-status-button";
import type { NewsListItem } from "../data";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const COLS = "grid-cols-[40px_120px_180px_1fr_220px]";

function NewsRow({ item, onDrop }: { item: NewsListItem; onDrop: () => void }) {
  const controls = useDragControls();
  const [dragging, setDragging] = useState(false);

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    controls.start(e);
    setDragging(true);
    const up = () => {
      setDragging(false);
      window.removeEventListener("pointerup", up);
      requestAnimationFrame(() => requestAnimationFrame(onDrop));
    };
    window.addEventListener("pointerup", up);
  }

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      animate={
        dragging
          ? { scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.15)", zIndex: 10, backgroundColor: "#f8fafc" }
          : { scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)", zIndex: 0, backgroundColor: "#ffffff" }
      }
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className={`grid select-none ${COLS} items-center gap-px border-b border-slate-100 last:border-0`}
    >
      <div
        className="flex h-full cursor-grab items-center justify-center px-3 py-3 text-slate-400 active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        style={{ touchAction: "none" }}
      >
        <GripVertical size={16} />
      </div>
      <div className="px-4 py-3">
        <span
          className={
            item.published
              ? "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700"
              : "inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700"
          }
        >
          {item.published ? "Publicada" : "Borrador"}
        </span>
      </div>
      <div className="px-4 py-3 text-sm text-slate-600" suppressHydrationWarning>{dateFormatter.format(item.createdAt)}</div>
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-slate-900">{item.title}</p>
      </div>
      <div className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <ToggleNewsStatusButton id={item.id} title={item.title} published={item.published} />
          <Link
            href={`/admin/noticias/editor?id=${item.id}`}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Editar
          </Link>
        </div>
      </div>
    </Reorder.Item>
  );
}

export function NewsOrderTable({ news: initialNews }: { news: NewsListItem[] }) {
  const [news, setNews] = useState(initialNews);
  const [saveError, setSaveError] = useState<string | null>(null);
  const latestNews = useRef(news);

  function handleReorder(newOrder: NewsListItem[]) {
    setNews(newOrder);
    latestNews.current = newOrder;
  }

  async function saveOrder(ids: number[]) {
    try {
      const res = await fetch("/api/news/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error("No se pudo guardar el orden.");
      setSaveError(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Error al guardar.");
    }
  }

  async function handleSortByDate() {
    const sorted = [...news].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    setNews(sorted);
    latestNews.current = sorted;
    await saveOrder(sorted.map((n) => n.id));
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">
          Arrastrá las filas para cambiar el orden.
        </p>
        <button
          onClick={handleSortByDate}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
        >
          <CalendarArrowDown size={14} />
          Ordenar por fecha
        </button>
      </div>

      {saveError && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{saveError}</p>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-hidden">
          <div className={`grid ${COLS} gap-px border-b border-slate-200 bg-slate-50 px-0`}>
            <div className="px-3 py-3" aria-label="Arrastrar" />
            <div className="px-4 py-3 text-sm font-semibold text-slate-700">Estado</div>
            <div className="px-4 py-3 text-sm font-semibold text-slate-700">Fecha</div>
            <div className="px-4 py-3 text-sm font-semibold text-slate-700">Título</div>
            <div className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Acciones</div>
          </div>

          {news.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">
              Todavía no hay noticias cargadas.
            </div>
          ) : (
            <Reorder.Group axis="y" values={news} onReorder={handleReorder} className="bg-white">
              {news.map((item) => (
                <NewsRow
                  key={item.id}
                  item={item}
                  onDrop={() => saveOrder(latestNews.current.map((n) => n.id))}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>
    </div>
  );
}
