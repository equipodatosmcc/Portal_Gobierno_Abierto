"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowLeft,
  Bus,
  ChevronDown,
  ExternalLink,
  IdCard,
  Leaf,
  MessageSquare,
  Smile,
  Stethoscope,
  Syringe,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/app/components/ui/Container";
import type {
  ActasInfraccionData,
  ArboladoData,
  ChartBar,
  EnfermeriaData,
  HabChoferesData,
  HabTransporteData,
  InmunizacionesData,
  OdontologicasData,
  RetirosViaPublicaData,
  SacData,
  StackedDatum,
} from "@/lib/data/ckanService";
import { buildDashboards, type DashboardConfig, type DashboardKey } from "@/lib/data/dashboards";

const PAGE_SIZE = 3;

const DASHBOARD_ICONS: Record<DashboardKey, LucideIcon> = {
  arbolado: Leaf,
  enfermeria: Stethoscope,
  consultas_odontologicas: Smile,
  inmunizaciones: Syringe,
  sac: MessageSquare,
  actas_infraccion: AlertTriangle,
  habilitaciones_choferes: IdCard,
  habilitaciones_transporte: Bus,
  retiros_via_publica: Truck,
};

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

const ARBOLADO_COLORS = ["#15803d", "#16a34a", "#22c55e", "#4ade80", "#86efac"];

function ArboladoCompactChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-36 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={144}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius={30} outerRadius={58}>
          {data.map((_, i) => (
            <Cell key={i} fill={ARBOLADO_COLORS[i % ARBOLADO_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => [v, "árboles"]} contentStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function ArboladoFullChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-80 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 64 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [v, "árboles"]} />
        <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? "#15803d" : "#16a34a"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── enfermeria charts ─────────────────────────────────────────────────────────

function EnfermeriaCompactChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-36 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={144}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="label" tick={{ fontSize: 8 }} />
        <Radar dataKey="value" fill="#e11d48" fillOpacity={0.6} stroke="#e11d48" />
        <Tooltip formatter={(v) => [v, "consultas"]} contentStyle={{ fontSize: 11 }} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function EnfermeriaFullChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-80 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="label" tick={{ fontSize: 11 }} />
        <Radar dataKey="value" fill="#e11d48" fillOpacity={0.6} stroke="#e11d48" name="Consultas" />
        <Tooltip formatter={(v) => [v, "consultas"]} />
        <Legend />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function CustomBarTooltip({ active, payload, unit }: { active?: boolean; payload?: { value: unknown; payload: { fullLabel?: string } }[]; unit: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 6, padding: "6px 10px", fontSize: 11, maxWidth: 260 }}>
      {payload[0].payload.fullLabel && (
        <p style={{ marginBottom: 2, fontWeight: 600, wordBreak: "break-word" }}>{payload[0].payload.fullLabel}</p>
      )}
      <p>{String(payload[0].value)} {unit}</p>
    </div>
  );
}

// ── odontologicas charts ──────────────────────────────────────────────────────

function OdontologicasCompactChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-36 w-full" />;
  const truncated = data.map((d) => ({
    ...d,
    fullLabel: d.label,
    label: d.label.length > 25 ? `${d.label.slice(0, 22)}…` : d.label,
  }));
  return (
    <ResponsiveContainer width="100%" height={144}>
      <BarChart data={truncated} layout="vertical" margin={{ top: 4, right: 8, left: 4, bottom: 4 }}>
        <XAxis type="number" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" width={80} tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomBarTooltip unit="consultas" />} />
        <Bar dataKey="value" fill="#0284c7" radius={[0, 3, 3, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function OdontologicasFullChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-80 w-full" />;
  const truncated = data.map((d) => ({
    ...d,
    fullLabel: d.label,
    label: d.label.length > 40 ? `${d.label.slice(0, 37)}…` : d.label,
  }));
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={truncated} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="label" width={180} tick={{ fontSize: 10 }} />
        <Tooltip content={<CustomBarTooltip unit="consultas" />} />
        <Bar dataKey="value" fill="#0284c7" radius={[0, 4, 4, 0]}>
          {truncated.map((_, i) => (
            <Cell key={i} fill={i === 0 ? "#0369a1" : "#0284c7"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── inmunizaciones charts ─────────────────────────────────────────────────────

function InmunizacionesCompactChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-36 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={144}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 4 }}>
        <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v) => [v, "vacunas"]} contentStyle={{ fontSize: 11 }} />
        <Bar dataKey="value" fill="#d97706" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function InmunizacionesFullChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-80 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 64 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [v, "vacunas"]} />
        <Bar dataKey="value" fill="#d97706" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? "#b45309" : "#d97706"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── sac charts ────────────────────────────────────────────────────────────────

const SAC_COLORS = ["#7c3aed", "#a855f7", "#c084fc", "#ddd6fe", "#ede9fe"];

function SacCompactChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-36 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={144}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={58}>
          {data.map((_, i) => (
            <Cell key={i} fill={SAC_COLORS[i % SAC_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v) => [v, "contactos"]} contentStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function SacFullChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-80 w-full" />;
  const truncated = data.map((d) => ({
    ...d,
    fullLabel: d.label,
    label: d.label.length > 40 ? `${d.label.slice(0, 37)}…` : d.label,
  }));
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={truncated} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
        <XAxis type="number" tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="label" width={180} tick={{ fontSize: 10 }} />
        <Tooltip content={<CustomBarTooltip unit="contactos" />} />
        <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]}>
          {truncated.map((_, i) => (
            <Cell key={i} fill={i === 0 ? "#6d28d9" : "#7c3aed"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── actas infraccion charts (AreaChart) ───────────────────────────────────────

function ActasInfraccionCompactChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-36 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={144}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 4 }}>
        <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v) => [v, "actas"]} contentStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="value" stroke="#dc2626" fill="#dc262633" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ActasInfraccionFullChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-80 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 48 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" interval={2} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [v, "actas"]} />
        <Area type="monotone" dataKey="value" stroke="#dc2626" fill="#dc262633" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── habilitaciones choferes charts (LineChart) ────────────────────────────────

function HabChoferesCompactChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-36 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={144}>
      <LineChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 4 }}>
        <XAxis dataKey="label" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <Tooltip formatter={(v) => [v, "habilitaciones"]} contentStyle={{ fontSize: 11 }} />
        <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3, fill: "#4f46e5" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function HabChoferesFullChart({ data }: { data: ChartBar[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-80 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [v, "habilitaciones"]} />
        <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5, fill: "#4f46e5" }} activeDot={{ r: 7 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ── habilitaciones transporte charts (Stacked BarChart) ───────────────────────

function HabTransporteCompactChart({ data }: { data: StackedDatum[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-36 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={144}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 4 }}>
        <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontSize: 11, backgroundColor: "#0f766e", border: "none", borderRadius: 6 }} labelStyle={{ color: "#99f6e4" }} itemStyle={{ color: "#ffffff" }} />
        <Bar dataKey="Definitivo" stackId="a" fill="#0f766e" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Provisorio" stackId="a" fill="#14b8a6" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function HabTransporteFullChart({ data }: { data: StackedDatum[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-80 w-full" />;
  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 56 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ fontSize: 11, backgroundColor: "#0f766e", border: "none", borderRadius: 6 }} labelStyle={{ color: "#99f6e4" }} itemStyle={{ color: "#ffffff" }} />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
          <Bar dataKey="Definitivo" stackId="a" fill="#0f766e" />
          <Bar dataKey="Provisorio" stackId="a" fill="#14b8a6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">ETPPE:</strong> Empresa de Transporte Privado por Plataforma Electrónica
        {" · "}
        <strong className="text-foreground">STE:</strong> Servicio de Triciclos Eléctricos
      </p>
    </div>
  );
}

// ── retiros via publica charts (Grouped BarChart) ─────────────────────────────

function RetirosViaPublicaCompactChart({ data }: { data: StackedDatum[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-36 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={144}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 4 }} barGap={1}>
        <XAxis dataKey="label" tick={false} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ fontSize: 11, backgroundColor: "#0e7490", border: "none", borderRadius: 6 }} labelStyle={{ color: "#a5f3fc" }} itemStyle={{ color: "#ffffff" }} />
        <Bar dataKey="Auto" fill="#0e7490" radius={[2, 2, 0, 0]} />
        <Bar dataKey="Moto" fill="#06b6d4" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function RetirosViaPublicaFullChart({ data }: { data: StackedDatum[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-80 w-full" />;
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 56 }} barGap={2}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" interval={1} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={{ fontSize: 11, backgroundColor: "#0e7490", border: "none", borderRadius: 6 }} labelStyle={{ color: "#a5f3fc" }} itemStyle={{ color: "#ffffff" }} />
        <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
        <Bar dataKey="Auto" fill="#0e7490" radius={[3, 3, 0, 0]} />
        <Bar dataKey="Moto" fill="#06b6d4" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ── dashboard key → chart resolver ───────────────────────────────────────────

function DashboardCompactChart({ dashboard }: { dashboard: DashboardConfig }) {
  switch (dashboard.key) {
    case "arbolado": return <ArboladoCompactChart data={dashboard.miniData} />;
    case "enfermeria": return <EnfermeriaCompactChart data={dashboard.miniData} />;
    case "consultas_odontologicas": return <OdontologicasCompactChart data={dashboard.miniData} />;
    case "inmunizaciones": return <InmunizacionesCompactChart data={dashboard.miniData} />;
    case "sac": return <SacCompactChart data={dashboard.miniData} />;
    case "actas_infraccion": return <ActasInfraccionCompactChart data={dashboard.miniData} />;
    case "habilitaciones_choferes": return <HabChoferesCompactChart data={dashboard.miniData} />;
    case "habilitaciones_transporte": return <HabTransporteCompactChart data={dashboard.miniMulti ?? []} />;
    case "retiros_via_publica": return <RetirosViaPublicaCompactChart data={dashboard.miniMulti ?? []} />;
    default: return <ArboladoCompactChart data={dashboard.miniData} />;
  }
}

function DashboardFullChart({ dashboard }: { dashboard: DashboardConfig }) {
  switch (dashboard.key) {
    case "arbolado": return <ArboladoFullChart data={dashboard.fullData} />;
    case "enfermeria": return <EnfermeriaFullChart data={dashboard.fullData} />;
    case "consultas_odontologicas": return <OdontologicasFullChart data={dashboard.fullData} />;
    case "inmunizaciones": return <InmunizacionesFullChart data={dashboard.fullData} />;
    case "sac": return <SacFullChart data={dashboard.fullData} />;
    case "actas_infraccion": return <ActasInfraccionFullChart data={dashboard.fullData} />;
    case "habilitaciones_choferes": return <HabChoferesFullChart data={dashboard.fullData} />;
    case "habilitaciones_transporte": return <HabTransporteFullChart data={dashboard.fullMulti ?? []} />;
    case "retiros_via_publica": return <RetirosViaPublicaFullChart data={dashboard.fullMulti ?? []} />;
    default: return <ArboladoFullChart data={dashboard.fullData} />;
  }
}

type Props = {
  arboladoData: ArboladoData;
  enfermeriaData: EnfermeriaData;
  odontologicasData: OdontologicasData;
  inmunizacionesData: InmunizacionesData;
  sacData: SacData;
  actasInfraccionData: ActasInfraccionData;
  habChoferesData: HabChoferesData;
  habTransporteData: HabTransporteData;
  retirosViaPublicaData: RetirosViaPublicaData;
};

export function DashboardsSection({
  arboladoData,
  enfermeriaData,
  odontologicasData,
  inmunizacionesData,
  sacData,
  actasInfraccionData,
  habChoferesData,
  habTransporteData,
  retirosViaPublicaData,
}: Props) {
  const [activeDashboard, setActiveDashboard] = useState<DashboardKey | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeDashboard && activeRef.current) {
      setTimeout(() => {
        activeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 80);
    }
  }, [activeDashboard]);

  const dashboards = useMemo(
    () =>
      buildDashboards({
        arboladoData,
        enfermeriaData,
        odontologicasData,
        inmunizacionesData,
        sacData,
        actasInfraccionData,
        habChoferesData,
        habTransporteData,
        retirosViaPublicaData,
      }),
    [
      arboladoData,
      enfermeriaData,
      odontologicasData,
      inmunizacionesData,
      sacData,
      actasInfraccionData,
      habChoferesData,
      habTransporteData,
      retirosViaPublicaData,
    ],
  );

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
          <div ref={activeRef} className="animate-in slide-in-from-bottom-4 fade-in duration-300">
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
                    {(() => {
                      const ActiveIcon = DASHBOARD_ICONS[active.key] ?? Leaf;
                      return <ActiveIcon size={24} aria-hidden="true" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl text-foreground">{active.title}</h3>
                    <p className="text-sm text-muted-foreground">{active.description}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-3">
                <div className="p-8 lg:col-span-2">
                  <DashboardFullChart dashboard={active} />
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
                  {visibleDashboards.map((dashboard) => {
                    const DashboardIcon = DASHBOARD_ICONS[dashboard.key] ?? Leaf;
                    return (
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
                              <DashboardIcon size={20} aria-hidden="true" />
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
                          <DashboardCompactChart dashboard={dashboard} />
                        </div>
                        <div className="px-6 pb-5">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-all group-hover:gap-2">
                            Ver tablero completo <ExternalLink size={14} aria-hidden="true" />
                          </span>
                        </div>
                      </button>
                    </article>
                    );
                  })}
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
