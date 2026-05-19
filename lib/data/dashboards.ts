import type {
  ArboladoData,
  ChartBar,
  EnfermeriaData,
  InmunizacionesData,
  OdontologicasData,
  SacData,
} from "@/lib/data/ckanService";

export type DashboardKey = "arbolado" | "enfermeria" | "consultas_odontologicas" | "inmunizaciones" | "sac";

export type DashboardConfig = {
  key: DashboardKey;
  title: string;
  description: string;
  colorClass: string;
  miniData: ChartBar[];
  fullData: ChartBar[];
  stats: Array<{ label: string; value: string }>;
  datasetUrl: string;
};

type BuildDashboardsInput = {
  arboladoData: ArboladoData;
  enfermeriaData: EnfermeriaData;
  odontologicasData: OdontologicasData;
  inmunizacionesData: InmunizacionesData;
  sacData: SacData;
};

export function buildDashboards({
  arboladoData,
  enfermeriaData,
  odontologicasData,
  inmunizacionesData,
  sacData,
}: BuildDashboardsInput): DashboardConfig[] {
  const configs: DashboardConfig[] = [];

  if (arboladoData.topEspecies.length > 0) {
    const top = arboladoData.topEspecies;
    const total = top.reduce((s, b) => s + b.value, 0);
    configs.push({
      key: "arbolado",
      title: "Arbolado Urbano",
      description: "Top 10 especies más frecuentes en el registro público de árboles.",
      colorClass: "bg-green-50 text-green-600",
      miniData: top.slice(0, 5),
      fullData: top,
      stats: [
        { label: "Árboles en top 10", value: total.toLocaleString("es-AR") },
        { label: "Especie más común", value: top[0]?.label ?? "—" },
        { label: "Especies registradas", value: arboladoData.totalEspecies.toLocaleString("es-AR") },
      ],
      datasetUrl: "https://datos.ciudaddecorrientes.gov.ar/dataset/ef335de5-c284-4d03-adac-3abd47e82ca1/",
    });
  }

  if (enfermeriaData.topPrestaciones.length > 0) {
    const top = enfermeriaData.topPrestaciones;
    configs.push({
      key: "enfermeria",
      title: "Servicios de Enfermería",
      description: "Prestaciones más frecuentes en los SAPS municipales.",
      colorClass: "bg-rose-50 text-rose-600",
      miniData: top.slice(0, 5),
      fullData: top,
      stats: [
        { label: "Consultas totales", value: enfermeriaData.totalConsultas.toLocaleString("es-AR") },
        { label: "Prestación más frecuente", value: top[0]?.label ?? "—" },
        { label: "SAPS reportando", value: String(enfermeriaData.totalSaps) },
      ],
      datasetUrl: "https://datos.ciudaddecorrientes.gov.ar/dataset/servicios_enfermeria",
    });
  }

  if (odontologicasData.topPracticas.length > 0) {
    const top = odontologicasData.topPracticas;
    configs.push({
      key: "consultas_odontologicas",
      title: "Consultas Odontológicas",
      description: "Top 10 prácticas odontológicas realizadas en SAPS municipales.",
      colorClass: "bg-sky-50 text-sky-600",
      miniData: top.slice(0, 5),
      fullData: top,
      stats: [
        { label: "Consultas totales", value: odontologicasData.totalConsultas.toLocaleString("es-AR") },
        { label: "Práctica más frecuente", value: top[0]?.label ?? "—" },
        { label: "Prácticas registradas", value: String(odontologicasData.totalPracticas) },
      ],
      datasetUrl: "https://datos.ciudaddecorrientes.gov.ar/dataset/consultas_odontologica",
    });
  }

  if (inmunizacionesData.topVacunas.length > 0) {
    const top = inmunizacionesData.topVacunas;
    configs.push({
      key: "inmunizaciones",
      title: "Inmunizaciones",
      description: "Vacunas más aplicadas en los SAPS municipales.",
      colorClass: "bg-amber-50 text-amber-600",
      miniData: top.slice(0, 5),
      fullData: top,
      stats: [
        { label: "Vacunas aplicadas", value: inmunizacionesData.totalVacunas.toLocaleString("es-AR") },
        { label: "Vacuna más aplicada", value: top[0]?.label ?? "—" },
        { label: "Tipos de vacuna", value: String(inmunizacionesData.totalTipos) },
      ],
      datasetUrl: "https://datos.ciudaddecorrientes.gov.ar/dataset/inmunizaciones",
    });
  }

  if (sacData.topAsuntos.length > 0) {
    const top = sacData.topAsuntos;
    configs.push({
      key: "sac",
      title: "Sistema de Atención al Ciudadano",
      description: "Principales reclamos y pedidos de los vecinos en 2026.",
      colorClass: "bg-violet-50 text-violet-600",
      miniData: sacData.viaContacto,
      fullData: top,
      stats: [
        { label: "Contactos atendidos", value: sacData.totalContactos.toLocaleString("es-AR") },
        { label: "Pedido más frecuente", value: top[0]?.label ?? "—" },
        { label: "Barrios alcanzados", value: String(sacData.totalBarrios) },
      ],
      datasetUrl: "https://datos.ciudaddecorrientes.gov.ar/dataset/sistema-de-atencion-al-ciudadano",
    });
  }

  return configs;
}
