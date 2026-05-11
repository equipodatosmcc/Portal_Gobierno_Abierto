"use client";

import React, { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Landmark, Scale, MapPin, Users, MessageSquare } from "lucide-react";
import { Container } from "@/app/components/ui/Container";

type PanelItem = {
  slug: string;
  title: string;
  content: string;
  icon?: string | null;
};

type Props = {
  items: PanelItem[];
};

const SLUG_ORDER = [
  "gobierno-abierto-intro",
  "gobierno-abierto-pilares",
  "gobierno-abierto-corrientes",
  "gobierno-abierto-ciudadano",
  "gobierno-abierto-participacion",
];

const DEFAULT_ICONS: Record<string, React.ElementType> = {
  "gobierno-abierto-intro": Landmark,
  "gobierno-abierto-pilares": Scale,
  "gobierno-abierto-corrientes": MapPin,
  "gobierno-abierto-ciudadano": Users,
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
  "gobierno-abierto-pilares": {
    gradient: "from-emerald-500 to-green-600",
    tabActiveBg: "bg-emerald-50",
    tabActiveText: "text-emerald-800",
    tabActiveBorder: "border-emerald-500",
    iconActiveBg: "bg-linear-to-br from-emerald-500 to-green-600",
  },
  "gobierno-abierto-corrientes": {
    gradient: "from-teal-600 to-emerald-700",
    tabActiveBg: "bg-teal-50",
    tabActiveText: "text-teal-800",
    tabActiveBorder: "border-teal-600",
    iconActiveBg: "bg-linear-to-br from-teal-600 to-emerald-700",
  },
  "gobierno-abierto-ciudadano": {
    gradient: "from-emerald-600 to-green-700",
    tabActiveBg: "bg-emerald-50",
    tabActiveText: "text-green-900",
    tabActiveBorder: "border-emerald-600",
    iconActiveBg: "bg-linear-to-br from-emerald-600 to-green-700",
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
    slug: "gobierno-abierto-intro",
    title: "¿Qué es el Gobierno Abierto?",
    content:
      "<p>El Gobierno Abierto es un modelo de gestión que busca transformar la relación entre el Municipio y los vecinos. Se basa en la convicción de que la información pública pertenece a la ciudadanía y que los problemas de la ciudad se resuelven mejor cuando trabajamos juntos. No se trata solo de publicar datos, sino de abrir las puertas de la gestión para que cada correntino tenga una voz activa en el diseño de su comunidad.</p>",
  },
  {
    slug: "gobierno-abierto-pilares",
    title: "Nuestros Pilares",
    content:
      "<p><strong>Transparencia:</strong> Garantizar que la información estratégica de nuestra ciudad sea pública, comprensible y esté al alcance de un clic.</p><p><strong>Participación Ciudadana:</strong> Crear espacios reales para que los vecinos dejen de ser espectadores y pasen a proponer soluciones.</p><p><strong>Colaboración:</strong> Trabajar en equipo con universidades, organizaciones sociales y empresas para mejorar los servicios públicos.</p>",
  },
  {
    slug: "gobierno-abierto-corrientes",
    title: "Gobierno Abierto en Corrientes",
    content:
      "<p>Para la Municipalidad de Corrientes, el Gobierno Abierto es un compromiso con la modernización y la honestidad. Somos parte de <strong>OGP Local</strong> (Alianza para el Gobierno Abierto), una red internacional de ciudades que eligen ser transparentes y rendir cuentas a sus habitantes.</p>",
  },
  {
    slug: "gobierno-abierto-ciudadano",
    title: "¿Para qué te sirve como ciudadano?",
    content:
      "<ul><li><strong>Tomar mejores decisiones:</strong> Usá los datos del portal para tus proyectos, investigaciones o para analizar el mercado local.</li><li><strong>Cuidar tu barrio:</strong> Consultá la ubicación de servicios municipales y verificá que los recursos lleguen a tu zona.</li><li><strong>Influir en la gestión:</strong> Tu opinión cuenta. Podés ayudarnos a decidir las prioridades de tu sector.</li></ul>",
  },
  {
    slug: "gobierno-abierto-participacion",
    title: "Tu participación hace al Portal",
    content:
      "<p>Este portal no es una biblioteca estática; es un espacio vivo de conexión. La sección de Feedback y Sugerencias está diseñada para que seas protagonista del crecimiento de esta plataforma.</p>",
  },
];

export function GobiernoAbiertoSection({ items }: Props) {
  const ordered =
    items.length > 0
      ? SLUG_ORDER.map((slug) => items.find((i) => i.slug === slug)).filter(Boolean) as PanelItem[]
      : FALLBACK_CONTENT;

  const [activeSlug, setActiveSlug] = useState(ordered[0]?.slug ?? "");
  const activePanel = ordered.find((p) => p.slug === activeSlug) ?? ordered[0];

  const ActiveIcon = activePanel
    ? ((LucideIcons as unknown as Record<string, React.ElementType>)[activePanel.icon ?? ""] ??
      DEFAULT_ICONS[activePanel.slug] ??
      LucideIcons.FileText)
    : LucideIcons.FileText;

  const activeTheme = activePanel ? (PANEL_THEMES[activePanel.slug] ?? DEFAULT_THEME) : DEFAULT_THEME;

  return (
    <section id="gobierno-abierto" className="py-24">
      <style>{`
        @keyframes panelFadeSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-panel { animation: panelFadeSlide 0.25s ease-out both; }
      `}</style>
      <Container>
        <div className="mb-12 text-center">
          <h2 className="font-heading text-4xl text-foreground md:text-5xl">Gobierno Abierto</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-0 rounded-2xl border border-border bg-card shadow-sm overflow-hidden md:min-h-130">
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
                  onClick={() => setActiveSlug(panel.slug)}
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
                  <span className={`text-sm leading-tight transition-all duration-200 ${isActive ? "font-semibold" : "font-medium"}`}>
                    {panel.title}
                  </span>
                </button>
              );
            })}
          </aside>

          <article className="flex-1 p-8 md:p-10 overflow-hidden">
            {activePanel && (
              <React.Fragment key={activeSlug}>
                <div className={`animate-panel relative mb-8 -mx-8 -mt-8 md:-mx-10 md:-mt-10 flex items-center gap-5 px-8 py-10 md:px-10 bg-linear-to-br ${activeTheme.gradient}`}>
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-white transition-transform duration-300 hover:scale-110">
                    <ActiveIcon size={32} aria-hidden="true" />
                  </span>
                  <h3 className="font-heading text-2xl font-semibold text-white md:text-3xl">{activePanel.title}</h3>
                </div>
                <div className="animate-panel relative rounded-xl bg-accent/50 p-5 md:p-7">
                  <ActiveIcon size={88} className="absolute bottom-4 right-4 opacity-[0.07] text-primary pointer-events-none" aria-hidden="true" />
                  <div
                    className="relative prose prose-sm max-w-none md:prose-base [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground [&_p]:text-foreground/80 [&_li]:text-foreground/80"
                    dangerouslySetInnerHTML={{ __html: activePanel.content }}
                  />
                </div>
              </React.Fragment>
            )}
          </article>
        </div>
      </Container>
    </section>
  );
}
