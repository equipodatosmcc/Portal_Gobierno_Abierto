"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Plus, Trash2, FileText, BarChart2, Users, Globe } from "lucide-react";

const PRESET_ICONS = [
  { name: "FileText", label: "Documentos", Icon: FileText },
  { name: "BarChart2", label: "Estadísticas", Icon: BarChart2 },
  { name: "Users", label: "Ciudadanos", Icon: Users },
  { name: "Globe", label: "Datos abiertos", Icon: Globe },
];
import { updateTransparencyContent } from "./actions";

type WebContentItem = {
  id?: number;
  slug: string;
  title: string;
  content: string;
  icon?: string | null;
};

type Props = {
  items: WebContentItem[];
};

export function EditorForm({ items }: Props) {
  const [mainItem, setMainItem] = useState<WebContentItem>(
    items.find((i) => i.slug === "transparencia-main") || {
      slug: "transparencia-main",
      title: "Gestion abierta y transparente",
      content: "Creemos en una gestion municipal donde cada ciudadano...",
    }
  );

  const [cards, setCards] = useState<WebContentItem[]>(
    items.filter((i) => i.slug !== "transparencia-main").sort((a, b) => a.slug.localeCompare(b.slug))
  );

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleMainChange = (field: "title" | "content", value: string) => {
    setMainItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleCardChange = (index: number, field: "title" | "content" | "icon", value: string) => {
    setCards((prev) => {
      const newCards = [...prev];
      newCards[index] = { ...newCards[index], [field]: value };
      return newCards;
    });
  };

  const handleAddCard = () => {
    setCards((prev) => [
      ...prev,
      {
        slug: `transparencia-card-${prev.length + 1}`,
        title: "Nueva Tarjeta",
        content: "Descripción de la tarjeta...",
        icon: "FileSearch",
      },
    ]);
  };

  const handleRemoveCard = (index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateTransparencyContent(
        { title: mainItem.title, content: mainItem.content },
        cards.map((c) => ({ title: c.title, content: c.content, icon: c.icon || null }))
      );

      if (result.success) {
        alert("Contenido guardado correctamente.");
        router.refresh();
      } else {
        alert(result.error || "Ocurrió un error");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-slate-900">Sección Transparencia</h3>
        <p className="text-sm text-slate-500">Edita el título principal, texto y agrega o elimina tarjetas informativas.</p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h4 className="mb-4 text-base font-semibold text-slate-900">Encabezado Principal</h4>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Título</label>
              <input
                type="text"
                required
                value={mainItem.title}
                onChange={(e) => handleMainChange("title", e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Texto descriptivo</label>
              <textarea
                required
                rows={3}
                value={mainItem.content}
                onChange={(e) => handleMainChange("content", e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-base font-semibold text-slate-900">Tarjetas Informativas</h4>
            <button
              type="button"
              onClick={handleAddCard}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-200"
            >
              <Plus size={16} /> Añadir Tarjeta
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {cards.map((item, index) => (
              <div key={index} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-emerald-800 uppercase tracking-widest">
                    Tarjeta {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveCard(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Eliminar tarjeta"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Icono</label>
                    <div className="mb-2 grid grid-cols-4 gap-1.5">
                      {PRESET_ICONS.map(({ name, label, Icon }) => {
                        const isActive = item.icon === name;
                        return (
                          <button
                            key={name}
                            type="button"
                            onClick={() => handleCardChange(index, "icon", name)}
                            className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-[10px] transition ${
                              isActive
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-50 text-slate-500 hover:border-emerald-300 hover:bg-emerald-50"
                            }`}
                          >
                            <Icon size={16} />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mb-1 text-[10px] text-slate-400">O ingresa un icono personalizado (Lucide):</p>
                    <input
                      type="text"
                      placeholder="Ej: Shield, Landmark, Scale..."
                      value={item.icon || ""}
                      onChange={(e) => handleCardChange(index, "icon", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">Escribe el nombre del icono en inglés.</p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Título de la tarjeta</label>
                    <input
                      type="text"
                      required
                      value={item.title}
                      onChange={(e) => handleCardChange(index, "title", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Breve descripción</label>
                    <textarea
                      required
                      rows={2}
                      value={item.content}
                      onChange={(e) => handleCardChange(index, "content", e.target.value)}
                      className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
