"use client";

import React, { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Landmark, MapPin, MessageSquare, Pencil } from "lucide-react";
import { Container } from "@/app/components/ui/Container";
import { RichTextEditor } from "@/app/components/ui/RichTextEditor";

type PanelItem = {
  id: number;
  slug: string;
  title: string;
  content: string;
  icon?: string | null;
};

type Props = {
  items: PanelItem[];
  canEdit?: boolean;
};

const SLUG_ORDER = [
  "gobierno-abierto-intro",
  "gobierno-abierto-corrientes",
  "gobierno-abierto-participacion",
];

const DEFAULT_ICONS: Record<string, React.ElementType> = {
  "gobierno-abierto-intro": Landmark,
  "gobierno-abierto-corrientes": MapPin,
  "gobierno-abierto-participacion": MessageSquare,
};

const PANEL_THEMES: Record<string, {
  gradient: string;
  tabActiveBg: string;
  tabActiveText: string;
  tabActiveBorder: string;
  iconActiveBg: string;
}> = {
  "gobierno-abierto-intro": {
    gradient: "from-green-600 to-emerald-700",
    tabActiveBg: "bg-green-50",
    tabActiveText: "text-green-800",
    tabActiveBorder: "border-green-600",
    iconActiveBg: "bg-linear-to-br from-green-600 to-emerald-700",
  },
  "gobierno-abierto-corrientes": {
    gradient: "from-teal-600 to-emerald-700",
    tabActiveBg: "bg-teal-50",
    tabActiveText: "text-teal-800",
    tabActiveBorder: "border-teal-600",
    iconActiveBg: "bg-linear-to-br from-teal-600 to-emerald-700",
  },
  "gobierno-abierto-participacion": {
    gradient: "from-green-500 to-teal-600",
    tabActiveBg: "bg-green-50",
    tabActiveText: "text-teal-800",
    tabActiveBorder: "border-green-500",
    iconActiveBg: "bg-linear-to-br from-green-500 to-teal-600",
  },
};

const DEFAULT_THEME = {
  gradient: "from-green-600 to-emerald-700",
  tabActiveBg: "bg-green-50",
  tabActiveText: "text-green-800",
  tabActiveBorder: "border-green-600",
  iconActiveBg: "bg-linear-to-br from-green-600 to-emerald-700",
};

const FALLBACK_CONTENT: PanelItem[] = [
  {
    id: 0,
    slug: "gobierno-abierto-intro",
    title: "¿Qué es el Gobierno Abierto?",
    content:
      "<p>El Gobierno Abierto es un modelo de gestión que busca transformar la relación entre el Municipio y los vecinos. Se basa en la convicción de que la información pública pertenece a la ciudadanía y que los problemas de la ciudad se resuelven mejor cuando trabajamos juntos. No se trata solo de publicar datos, sino de abrir las puertas de la gestión para que cada correntino tenga una voz activa en el diseño de su comunidad.</p><p><strong>Nuestros Pilares:</strong></p><ul><li><strong>Transparencia:</strong> Garantizar que la información estratégica —como indicadores económicos, infraestructura de salud y movilidad urbana— sea pública, comprensible y esté a un clic de distancia. Democratizamos el acceso a la información que nos pertenece a todos.</li><li><strong>Participación Ciudadana:</strong> Crear espacios reales para que los vecinos dejen de ser espectadores y pasen a proponer soluciones, influyendo en las prioridades de sus barrios.</li><li><strong>Colaboración:</strong> Trabajar en equipo con universidades, organizaciones sociales y empresas para usar la tecnología y la creatividad en la mejora de los servicios públicos.</li></ul>",
  },
  {
    id: 0,
    slug: "gobierno-abierto-corrientes",
    title: "Corrientes Abierta: El Impacto en tu Día a Día",
    content:
      "<p>Para la Municipalidad de Corrientes, este modelo es un compromiso con la modernización y la honestidad. Como miembros de <strong>OGP Local</strong> (Alianza para el Gobierno Abierto), no solo abrimos datos, sino que te damos herramientas concretas para tu vida cotidiana:</p><ul><li><strong>Tomar mejores decisiones:</strong> Abrimos información estratégica sobre Economía, Salud y Transporte. Si sos emprendedor, estudiante o periodista, podés usar estos datos para investigar o analizar el mercado local.</li><li><strong>Cuidar tu barrio y gestionar más rápido:</strong> Facilitamos servicios digitales para agilizar tus trámites y te permitimos consultar la ubicación de servicios municipales para verificar que los recursos lleguen a tu zona.</li><li><strong>Influir en la gestión:</strong> A través de nuestras consultas ciudadanas, tu opinión cuenta para decidir, por ejemplo, qué capacitaciones llevar a los Puntos Digitales o priorizar infraestructura en tu sector.</li></ul>",
  },
  {
    id: 0,
    slug: "gobierno-abierto-participacion",
    title: "Co-creá este Portal con Nosotros",
    content:
      "<p>Este portal no es una biblioteca estática; es un espacio vivo de conexión y mejora continua. Hemos sumado una sección de Feedback y Sugerencias para que seas protagonista del crecimiento de esta plataforma.</p><p><strong>¿Qué podés hacer en nuestra sección de interacción?</strong></p><ul><li><strong>Solicitar nuevos Datasets:</strong> Si necesitás información pública que aún no está disponible, podés pedir su apertura.</li><li><strong>Actualizar Información:</strong> Ayudanos a mantener los datos al día informándonos sobre cambios en tu zona o mejoras en los registros.</li><li><strong>Enviar Sugerencias:</strong> Compartí tus ideas para que el portal sea más fácil de usar o para que los datos te resulten más útiles.</li></ul><p>Tu aporte es el motor que nos permite seguir expandiendo el acceso a la información en Corrientes.</p>",
  },
];

export function GobiernoAbiertoSection({ items, canEdit = false }: Props) {
  const [panels, setPanels] = useState<PanelItem[]>(
    items.length > 0
      ? (SLUG_ORDER.map((slug) => items.find((i) => i.slug === slug)).filter(Boolean) as PanelItem[])
      : FALLBACK_CONTENT,
  );
  const ordered = panels;

  const [activeSlug, setActiveSlug] = useState(ordered[0]?.slug ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const activePanel = ordered.find((p) => p.slug === activeSlug) ?? null;

  async function handleSave() {
    if (!activePanel || activePanel.id === 0) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const response = await fetch(`/api/webcontent/${activePanel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: draftTitle.trim(), content: draftContent.trim() }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "No se pudo guardar.");
      setPanels((current) =>
        current.map((p) =>
          p.slug === activeSlug ? { ...p, title: draftTitle.trim(), content: draftContent.trim() } : p,
        ),
      );
      setIsEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "No se pudo guardar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section id="gobierno-abierto" className="py-24">
      <Container>
        <div className="mb-12 text-center">
          <h2 className="font-heading text-4xl text-foreground md:text-5xl">Gobierno Abierto</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-0 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <aside className="md:w-72 shrink-0 flex flex-col divide-y divide-border border-b md:border-b-0 md:border-r border-border">
            {ordered.map((panel) => {
              const isActive = activeSlug === panel.slug;
              const theme = PANEL_THEMES[panel.slug] ?? DEFAULT_THEME;
              const IconComponent =
                (LucideIcons as unknown as Record<string, React.ElementType>)[panel.icon ?? ""] ??
                DEFAULT_ICONS[panel.slug] ??
                LucideIcons.FileText;

              return (
                <button
                  key={panel.slug}
                  type="button"
                  onClick={() => { setActiveSlug(panel.slug); setIsEditing(false); setSaveError(null); }}
                  className={`flex-1 flex items-center gap-3 px-5 py-4 text-left transition-all duration-200 border-l-4 hover:translate-x-1 ${
                    isActive
                      ? `${theme.tabActiveBg} ${theme.tabActiveText} ${theme.tabActiveBorder}`
                      : "border-transparent text-foreground hover:bg-muted/50"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 ${
                      isActive ? `${theme.iconActiveBg} text-white scale-110` : "bg-green-100 text-green-700 scale-100"
                    }`}
                  >
                    <IconComponent size={16} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold leading-tight">
                    {panel.title}
                  </span>
                </button>
              );
            })}
          </aside>

          <article className="flex-1 overflow-hidden">
            <div className="grid">
              {ordered.map((panel) => {
                const isActive = panel.slug === activeSlug;
                const theme = PANEL_THEMES[panel.slug] ?? DEFAULT_THEME;
                const PanelIcon =
                  (LucideIcons as unknown as Record<string, React.ElementType>)[panel.icon ?? ""] ??
                  DEFAULT_ICONS[panel.slug] ??
                  LucideIcons.FileText;

                const isPanelEditing = isActive && isEditing;

                return (
                  <div
                    key={panel.slug}
                    style={{ gridArea: "1 / 1" }}
                    className={`p-8 md:p-10 transition-opacity duration-250 ${isActive ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                  >
                    <div className={`relative mb-8 -mx-8 -mt-8 md:-mx-10 md:-mt-10 flex items-center gap-5 px-8 py-10 md:px-10 bg-linear-to-br ${theme.gradient}`}>
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white transition-transform duration-300 hover:scale-110">
                        <PanelIcon size={32} aria-hidden="true" />
                      </span>
                      <h3 className="font-heading text-2xl font-semibold text-white md:text-3xl">{panel.title}</h3>
                      {canEdit && isActive && panel.id !== 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing((v) => !v);
                            setDraftTitle(panel.title);
                            setDraftContent(panel.content);
                            setSaveError(null);
                          }}
                          className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-white/30"
                          aria-label={`Editar ${panel.title}`}
                        >
                          <Pencil size={12} aria-hidden="true" /> {isPanelEditing ? "Cerrar" : "Editar"}
                        </button>
                      ) : null}
                    </div>
                    {isPanelEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Título
                          </label>
                          <input
                            type="text"
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            Contenido
                          </label>
                          <RichTextEditor value={draftContent} onChange={setDraftContent} minHeight="min-h-48" />
                        </div>
                        {saveError ? <p className="text-sm text-red-500">{saveError}</p> : null}
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-400"
                          >
                            {isSaving ? "Guardando…" : "Guardar"}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsEditing(false); setSaveError(null); }}
                            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-primary/40"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative rounded-xl bg-accent/50 p-5 md:p-7">
                        <PanelIcon size={88} className="absolute bottom-4 right-4 opacity-[0.07] text-primary pointer-events-none" aria-hidden="true" />
                        <div
                          className="relative [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold [&_strong]:text-foreground [&_p]:text-foreground/80 [&_li]:text-foreground/80"
                          dangerouslySetInnerHTML={{ __html: panel.content }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}
