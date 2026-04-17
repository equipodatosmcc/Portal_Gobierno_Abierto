"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  Bus,
  Droplets,
  ExternalLink,
  GraduationCap,
  HeartPulse,
  Shield,
  TrendingUp,
} from "lucide-react";
import { Container } from "@/app/components/ui/Container";

type DashboardKey = "salud" | "educacion" | "transporte" | "ambiente" | "seguridad" | "economia";

type ChartPoint = {
  label: string;
  value: number;
};

type DashboardConfig = {
  key: DashboardKey;
  icon: typeof HeartPulse;
  title: string;
  description: string;
  colorClass: string;
  stats: Array<{ label: string; value: string }>;
  insight: string;
  miniData: ChartPoint[];
  fullData: ChartPoint[];
  chartType: "bar" | "line" | "area" | "pie";
};

const PIE_COLORS = ["#1E7BA4", "#1D2E3F", "#3FA674", "#2D9BC8"];

const dashboards: DashboardConfig[] = [
  {
    key: "salud",
    icon: HeartPulse,
    title: "Salud Publica",
    description: "Consultas mensuales en centros de atencion primaria.",
    colorClass: "bg-red-50 text-red-600",
    stats: [
      { label: "Total consultas 2026", value: "57.100" },
      { label: "Centros activos", value: "34" },
      { label: "Promedio mensual", value: "4.758" },
      { label: "Crecimiento interanual", value: "+12%" },
    ],
    insight:
      "Se observa un incremento sostenido en las consultas durante el primer semestre, con pico en junio.",
    miniData: [
      { label: "Ene", value: 4200 },
      { label: "Feb", value: 3800 },
      { label: "Mar", value: 5100 },
      { label: "Abr", value: 4600 },
      { label: "May", value: 4900 },
      { label: "Jun", value: 5300 },
    ],
    fullData: [
      { label: "Ene", value: 4200 },
      { label: "Feb", value: 3800 },
      { label: "Mar", value: 5100 },
      { label: "Abr", value: 4600 },
      { label: "May", value: 4900 },
      { label: "Jun", value: 5300 },
      { label: "Jul", value: 4800 },
      { label: "Ago", value: 5000 },
      { label: "Sep", value: 5400 },
      { label: "Oct", value: 5100 },
      { label: "Nov", value: 4700 },
      { label: "Dic", value: 4300 },
    ],
    chartType: "bar",
  },
  {
    key: "educacion",
    icon: GraduationCap,
    title: "Educacion",
    description: "Distribucion de matricula escolar por nivel educativo.",
    colorClass: "bg-blue-50 text-blue-600",
    stats: [
      { label: "Matricula total", value: "100.000" },
      { label: "Establecimientos", value: "187" },
      { label: "Docentes", value: "6.200" },
      { label: "Cobertura", value: "96%" },
    ],
    insight:
      "La matricula primaria representa el mayor volumen, seguida por secundaria con crecimiento sostenido.",
    miniData: [
      { label: "Inicial", value: 18000 },
      { label: "Primaria", value: 42000 },
      { label: "Secundaria", value: 31000 },
      { label: "Tecnica", value: 9000 },
    ],
    fullData: [
      { label: "Inicial", value: 18000 },
      { label: "Primaria", value: 42000 },
      { label: "Secundaria", value: 31000 },
      { label: "Tecnica", value: 9000 },
    ],
    chartType: "pie",
  },
  {
    key: "transporte",
    icon: Bus,
    title: "Transporte",
    description: "Millones de pasajeros transportados por mes.",
    colorClass: "bg-amber-50 text-amber-600",
    stats: [
      { label: "Pasajeros anuales", value: "30.4M" },
      { label: "Lineas activas", value: "28" },
      { label: "Unidades", value: "312" },
      { label: "Cobertura territorial", value: "89%" },
    ],
    insight:
      "La movilidad muestra tendencia creciente por ampliacion de recorridos y mejora de frecuencias.",
    miniData: [
      { label: "Ene", value: 2.1 },
      { label: "Feb", value: 1.9 },
      { label: "Mar", value: 2.4 },
      { label: "Abr", value: 2.3 },
      { label: "May", value: 2.5 },
      { label: "Jun", value: 2.7 },
    ],
    fullData: [
      { label: "Ene", value: 2.1 },
      { label: "Feb", value: 1.9 },
      { label: "Mar", value: 2.4 },
      { label: "Abr", value: 2.3 },
      { label: "May", value: 2.5 },
      { label: "Jun", value: 2.7 },
      { label: "Jul", value: 2.6 },
      { label: "Ago", value: 2.8 },
      { label: "Sep", value: 3.0 },
      { label: "Oct", value: 2.9 },
      { label: "Nov", value: 2.7 },
      { label: "Dic", value: 2.5 },
    ],
    chartType: "line",
  },
  {
    key: "ambiente",
    icon: Droplets,
    title: "Medio Ambiente",
    description: "Indice de calidad del agua (0-100).",
    colorClass: "bg-emerald-50 text-emerald-600",
    stats: [
      { label: "Promedio anual", value: "88.8" },
      { label: "Puntos de muestreo", value: "42" },
      { label: "Mejor mes", value: "Octubre" },
      { label: "Tendencia", value: "Estable" },
    ],
    insight:
      "La calidad del agua se mantiene en niveles optimos durante todo el ano con picos en el ultimo trimestre.",
    miniData: [
      { label: "Ene", value: 85 },
      { label: "Feb", value: 82 },
      { label: "Mar", value: 88 },
      { label: "Abr", value: 91 },
      { label: "May", value: 87 },
      { label: "Jun", value: 93 },
    ],
    fullData: [
      { label: "Ene", value: 85 },
      { label: "Feb", value: 82 },
      { label: "Mar", value: 88 },
      { label: "Abr", value: 91 },
      { label: "May", value: 87 },
      { label: "Jun", value: 93 },
      { label: "Jul", value: 90 },
      { label: "Ago", value: 88 },
      { label: "Sep", value: 92 },
      { label: "Oct", value: 94 },
      { label: "Nov", value: 89 },
      { label: "Dic", value: 86 },
    ],
    chartType: "area",
  },
  {
    key: "seguridad",
    icon: Shield,
    title: "Seguridad",
    description: "Evolucion de camaras de monitoreo activas.",
    colorClass: "bg-purple-50 text-purple-600",
    stats: [
      { label: "Camaras activas", value: "510" },
      { label: "Centros de monitoreo", value: "5" },
      { label: "Operadores 24/7", value: "48" },
      { label: "Crecimiento anual", value: "+59%" },
    ],
    insight:
      "La red de videovigilancia crecio de forma sostenida en corredores comerciales y espacios publicos.",
    miniData: [
      { label: "Ene", value: 320 },
      { label: "Feb", value: 340 },
      { label: "Mar", value: 355 },
      { label: "Abr", value: 370 },
      { label: "May", value: 390 },
      { label: "Jun", value: 412 },
    ],
    fullData: [
      { label: "Ene", value: 320 },
      { label: "Feb", value: 340 },
      { label: "Mar", value: 355 },
      { label: "Abr", value: 370 },
      { label: "May", value: 390 },
      { label: "Jun", value: 412 },
      { label: "Jul", value: 430 },
      { label: "Ago", value: 445 },
      { label: "Sep", value: 460 },
      { label: "Oct", value: 478 },
      { label: "Nov", value: 495 },
      { label: "Dic", value: 510 },
    ],
    chartType: "area",
  },
  {
    key: "economia",
    icon: TrendingUp,
    title: "Economia",
    description: "Ejecucion presupuestaria por area (millones).",
    colorClass: "bg-teal-50 text-teal-600",
    stats: [
      { label: "Presupuesto total", value: "$12.300M" },
      { label: "Ejecucion", value: "87%" },
      { label: "Obras en ejecucion", value: "23" },
      { label: "Variacion vs 2025", value: "+18%" },
    ],
    insight:
      "Obras Publicas y Salud concentran el mayor volumen de ejecucion presupuestaria municipal.",
    miniData: [
      { label: "Obras", value: 3200 },
      { label: "Salud", value: 2800 },
      { label: "Educ.", value: 2100 },
      { label: "Segur.", value: 1800 },
      { label: "Cultura", value: 900 },
      { label: "Otros", value: 1500 },
    ],
    fullData: [
      { label: "Obras", value: 3200 },
      { label: "Salud", value: 2800 },
      { label: "Educ.", value: 2100 },
      { label: "Segur.", value: 1800 },
      { label: "Cultura", value: 900 },
      { label: "Otros", value: 1500 },
    ],
    chartType: "bar",
  },
];

function ChartContent({ dashboard, compact }: { dashboard: DashboardConfig; compact?: boolean }) {
  const height = compact ? 140 : 350;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ height: height, width: "100%" }} />;
  }

  if (dashboard.chartType === "pie") {
    const pieData = compact ? dashboard.miniData : dashboard.fullData;
    const outerRadius = compact ? 55 : 130;
    const innerRadius = compact ? 0 : 60;

    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius={outerRadius}
            innerRadius={innerRadius}
            label={
              compact
                ? true
                : ({ name, value }: { name?: string; value?: number | string }) => `${name}: ${value}`
            }
            labelLine={!compact}
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          {!compact ? <Legend /> : null}
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (dashboard.chartType === "line") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={compact ? dashboard.miniData : dashboard.fullData}>
          {!compact ? <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" /> : null}
          <XAxis dataKey="label" tick={{ fontSize: compact ? 10 : 12 }} axisLine={!compact} tickLine={!compact} />
          <YAxis tick={{ fontSize: compact ? 10 : 12 }} hide={compact} />
          <Tooltip />
          {!compact ? <Legend /> : null}
          <Line type="monotone" dataKey="value" stroke="#1E7BA4" strokeWidth={2} dot={{ r: compact ? 3 : 4 }} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (dashboard.chartType === "area") {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={compact ? dashboard.miniData : dashboard.fullData}>
          {!compact ? <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" /> : null}
          <XAxis dataKey="label" tick={{ fontSize: compact ? 10 : 12 }} axisLine={!compact} tickLine={!compact} />
          <YAxis tick={{ fontSize: compact ? 10 : 12 }} hide={compact} />
          <Tooltip />
          {!compact ? <Legend /> : null}
          <Area type="monotone" dataKey="value" stroke="#3FA674" fill="#3FA674" fillOpacity={0.22} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={compact ? dashboard.miniData : dashboard.fullData} layout={dashboard.key === "economia" ? "vertical" : "horizontal"}>
        {!compact ? <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" /> : null}
        {dashboard.key === "economia" ? (
          <>
            <XAxis type="number" tick={{ fontSize: compact ? 10 : 12 }} axisLine={!compact} tickLine={!compact} />
            <YAxis
              dataKey="label"
              type="category"
              tick={{ fontSize: compact ? 10 : 12 }}
              axisLine={!compact}
              tickLine={!compact}
              width={compact ? 45 : 60}
            />
          </>
        ) : (
          <>
            <XAxis dataKey="label" tick={{ fontSize: compact ? 10 : 12 }} axisLine={!compact} tickLine={!compact} />
            <YAxis tick={{ fontSize: compact ? 10 : 12 }} hide={compact} />
          </>
        )}
        <Tooltip />
        {!compact ? <Legend /> : null}
        <Bar dataKey="value" fill="#1E7BA4" radius={dashboard.key === "economia" ? [0, 4, 4, 0] : [4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DashboardsSection() {
  const [activeDashboard, setActiveDashboard] = useState<DashboardKey | null>(null);

  const active = useMemo(
    () => dashboards.find((dashboard) => dashboard.key === activeDashboard),
    [activeDashboard],
  );

  return (
    <section id="tableros" className="bg-gov-warm py-24">
      <Container>
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Visualizaciones</p>
          <h2 className="mb-4 font-heading text-4xl text-foreground md:text-5xl">Tableros de Datos</h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Explora las visualizaciones interactivas elaboradas junto a las secretarias municipales con datos de
            <Link
              href="https://datos.ciudaddecorrientes.gov.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 font-semibold text-primary underline underline-offset-2 hover:text-gov-cyan-light"
            >
              datos.ciudaddecorrientes.gov.ar
            </Link>
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
                <div className="mb-2 flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${active.colorClass}`}>
                    <active.icon size={24} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl text-foreground">{active.title}</h3>
                    <p className="text-sm text-muted-foreground">{active.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-3">
                <div className="p-8 lg:col-span-2">
                  <ChartContent dashboard={active} />
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
                  <h4 className="mb-2 font-heading text-lg text-foreground">Analisis</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground">{active.insight}</p>
                </div>
              </div>
            </article>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {dashboards.map((dashboard) => (
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
                          <dashboard.icon size={20} aria-hidden="true" />
                        </div>
                        <h3 className="font-heading text-xl text-foreground">{dashboard.title}</h3>
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground">{dashboard.description}</p>
                    </div>
                    <div className="px-4 pb-2">
                      <ChartContent dashboard={dashboard} compact />
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

            <div className="mt-12 text-center">
              <Link
                href="https://datos.ciudaddecorrientes.gov.ar/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-secondary px-8 py-3 font-semibold text-secondary-foreground transition-colors hover:bg-gov-dark-light"
              >
                Ir al Portal de Datos Abiertos <ExternalLink size={16} aria-hidden="true" />
              </Link>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
