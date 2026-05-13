"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, FileText, BarChart2, Globe, Landmark, MapPin, MessageSquare } from "lucide-react";
import { RichTextEditor } from "@/app/components/ui/RichTextEditor";
import { updateGobiernoAbiertoContent } from "./actions";

const SLUG_ORDER = [
  "gobierno-abierto-intro",
  "gobierno-abierto-corrientes",
  "gobierno-abierto-participacion",
];

const PRESET_ICONS = [
  { name: "Landmark", label: "Edificio", Icon: Landmark },
  { name: "MapPin", label: "Lugar", Icon: MapPin },
  { name: "MessageSquare", label: "Mensajes", Icon: MessageSquare },
  { name: "FileText", label: "Documentos", Icon: FileText },
  { name: "BarChart2", label: "Estadísticas", Icon: BarChart2 },
  { name: "Globe", label: "Datos", Icon: Globe },
];

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
  const [panels, setPanels] = useState<WebContentItem[]>(() => {
    return SLUG_ORDER.map((slug) => {
      const found = items.find((i) => i.slug === slug);
      return found ?? { slug, title: "", content: "", icon: null };
    });
  });

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const updatePanel = (slug: string, field: "title" | "content" | "icon", value: string) => {
    setPanels((prev) => prev.map((p) => (p.slug === slug ? { ...p, [field]: value } : p)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await updateGobiernoAbiertoContent(
        panels.map((p) => ({
          slug: p.slug,
          title: p.title,
          content: p.content,
          icon: p.icon ?? null,
        }))
      );

      if (result.success) {
        alert("Contenido guardado correctamente.");
        router.refresh();
      } else {
        alert(result.error || "Ocurrió un error");
      }
    });
  };

  const panelLabels: Record<string, string> = {
    "gobierno-abierto-intro": "¿Qué es el Gobierno Abierto?",
    "gobierno-abierto-corrientes": "Corrientes Abierta: El Impacto en tu Día a Día",
    "gobierno-abierto-participacion": "Co-creá este Portal con Nosotros",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-slate-900">Sección Gobierno Abierto</h3>
        <p className="text-sm text-slate-500">Editá el título, ícono y contenido de cada panel del acordeón.</p>
      </div>

      <div className="space-y-6">
        {panels.map((panel) => (
          <div key={panel.slug} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-800">
              {panelLabels[panel.slug] ?? panel.slug}
            </h4>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Título del panel</label>
                <input
                  type="text"
                  required
                  value={panel.title}
                  onChange={(e) => updatePanel(panel.slug, "title", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ícono</label>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {PRESET_ICONS.map(({ name, label, Icon }) => {
                    const isActive = panel.icon === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => updatePanel(panel.slug, "icon", name)}
                        className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 text-[10px] transition ${
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
                <input
                  type="text"
                  placeholder="Ej: Shield, Landmark, Scale..."
                  value={panel.icon ?? ""}
                  onChange={(e) => updatePanel(panel.slug, "icon", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <p className="mt-1 text-[10px] text-slate-400">Nombre de ícono Lucide (en inglés).</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Contenido</label>
                <RichTextEditor
                  value={panel.content}
                  onChange={(html) => updatePanel(panel.slug, "content", html)}
                  minHeight="min-h-36"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-4">
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
