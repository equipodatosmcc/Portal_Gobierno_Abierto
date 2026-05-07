"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowLeft, ChevronDown, ExternalLink, Leaf } from "lucide-react";
import { Container } from "@/app/components/ui/Container";
import type { ArboladoData, ChartBar } from "@/lib/data/ckanService";
import { buildDashboards, type DashboardConfig, type DashboardKey } from "@/lib/data/dashboards";

const PAGE_SIZE = 3;

const TOOLS = [
  {
    name: "Looker Studio",
    url: "https://lookerstudio.google.com/",
    description: "Tableros gratuitos conectados a hojas de cálculo, CSV o bases de datos. Sin instalación.",
    badge: "Gratis",
    color: "bg-blue-500",
  },
  {
    name: "Google Sheets",
    url: "https://sheets.google.com/",
    description: "Gráficos rápidos y compartibles directamente desde una hoja de cálculo con los datos descargados.",
    badge: "Gratis",
    color: "bg-green-500",
  },
  {
    name: "Datawrapper",
    url: "https://www.datawrapper.de/",
    description: "Editor web para gráficos y mapas listos para publicación. Muy usado en periodismo de datos.",
    badge: "Gratis",
    color: "bg-blue-600",
  },
  {
    name: "Flourish",
    url: "https://flourish.studio/",
    description: "Visualizaciones animadas e historias de datos interactivas, sin necesidad de código.",
    badge: "Gratis",
    color: "bg-indigo-500",
  },
  {
    name: "Power BI",
    url: "https://powerbi.microsoft.com/",
    description: "Plataforma de Microsoft para análisis y dashboards avanzados. Versión desktop gratuita.",
    badge: "Freemium",
    color: "bg-yellow-500",
  },
  {
    name: "Tableau Public",
    url: "https://public.tableau.com/",
    description: "Versión gratuita de Tableau para crear y publicar visualizaciones online.",
    badge: "Gratis",
    color: "bg-orange-600",
  },
];

function ToolIcon({ name, color }: { name: string; color: string }) {
  const initials = name.split(" ").map(w => w[0]).join("");
  return (
    <div className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-white ${color}`}>
      {initials}
    </div>
  );
}

function CompactChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-36 w-full" />;

  return (
    <ResponsiveContainer width="100%" height={144}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 4 }}>
        <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => [v, "árboles"]}
          contentStyle={{ fontSize: 11 }}
        />
        <Bar dataKey="value" fill="#16a34a" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function FullChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-80 w-full" />;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 64 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11 }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [v, "árboles"]} />
        <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={i === 0 ? "#15803d" : "#16a34a"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

type Props = { arboladoData: ArboladoData };

export function DashboardsSection({ arboladoData }: Props) {
  const [activeDashboard, setActiveDashboard] = useState<DashboardKey | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const dashboards = useMemo(() => buildDashboards(arboladoData), [arboladoData]);

  const active = useMemo(
    () => dashboards.find((d) => d.key === activeDashboard),
    [activeDashboard, dashboards],
  );

  const visibleDashboards = dashboards.slice(0, visibleCount);
  const hasMore = visibleCount < dashboards.length;

  return (
    <section id="tableros" className="bg-gov-warm py-24">
      <Container>
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
            Visualizaciones
          </p>
          <h2 className="mb-4 font-heading text-4xl text-foreground md:text-5xl">
            Tableros de Datos
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Ejemplos construidos a partir de datasets del{" "}
            <Link
              href="https://datos.ciudaddecorrientes.gov.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline underline-offset-2 hover:text-gov-cyan-light"
            >
              Portal de Datos Abiertos
            </Link>
            . Mostramos qué información puede extraerse de los datos crudos y cómo cualquier persona puede reutilizarlos.
          </p>
        </div>

        {active ? (
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-300">
            <button
              type="button"
              onClick={() => setActiveDashboard(null)}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-gov-cyan-light"
            >
              <ArrowLeft size={16} aria-hidden="true" /> Volver a todos los tableros
            </button>

            <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
              <div className="border-b border-border p-8">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${active.colorClass}`}>
                    <Leaf size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl text-foreground">{active.title}</h3>
                    <p className="text-sm text-muted-foreground">{active.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-3">
                <div className="p-8 lg:col-span-2">
                  <FullChart data={active.fullData} />
                </div>
                <div className="border-t border-border p-8 lg:border-l lg:border-t-0">
                  <h4 className="mb-4 font-heading text-lg text-foreground">Indicadores clave</h4>
                  <div className="mb-6 grid grid-cols-2 gap-4">
                    {active.stats.map((stat) => (
                      <div key={stat.label} className="rounded-lg bg-muted/50 p-3">
                        <p className="text-2xl font-bold text-primary">{stat.value}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Datos actualizados cada 12 horas desde el portal de datos abiertos municipal.{" "}
                    <a
                      href={active.datasetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary underline underline-offset-2 hover:text-gov-cyan-light"
                    >
                      Ver dataset completo
                    </a>
                  </p>
                </div>
              </div>
            </article>
          </div>
        ) : (
          <>
            {dashboards.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                Los tableros no están disponibles en este momento.
              </p>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {visibleDashboards.map((dashboard) => (
                    <article
                      key={dashboard.key}
                      className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <button
                        type="button"
                        onClick={() => setActiveDashboard(dashboard.key)}
                        className="w-full text-left"
                        aria-label={`Ver tablero completo de ${dashboard.title}`}
                      >
                        <div className="p-6 pb-2">
                          <div className="mb-3 flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${dashboard.colorClass}`}>
                              <Leaf size={20} aria-hidden="true" />
                            </div>
                            <h3 className="font-heading text-xl text-foreground">
                              {dashboard.title}
                            </h3>
                          </div>
                          <p className="mb-2 text-sm text-muted-foreground">
                            {dashboard.description}
                          </p>
                        </div>
                        <div className="px-4 pb-2">
                          <CompactChart data={dashboard.miniData} />
                        </div>
                        <div className="px-6 pb-5">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all group-hover:gap-2">
                            Ver tablero completo <ExternalLink size={14} aria-hidden="true" />
                          </span>
                        </div>
                      </button>
                    </article>
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-8 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-8 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      Ver más <ChevronDown size={16} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="mt-12 border-t border-border pt-10">
              <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-heading text-2xl text-foreground">
                    Herramientas para crear tus propios tableros
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Descargá cualquier dataset y analizalo con estas herramientas. La mayoría son gratuitas.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {TOOLS.map((tool) => (
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <ToolIcon name={tool.name} color={tool.color} />
                      <span className="flex-1 font-heading text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {tool.badge}
                      </span>
                    </div>
                    <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                      {tool.description}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all group-hover:gap-2">
                      Visitar sitio <ExternalLink size={13} aria-hidden="true" />
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
