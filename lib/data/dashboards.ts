import type { ArboladoData, ChartBar } from "@/lib/data/ckanService";

export type DashboardKey = "arbolado";

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

export function buildDashboards(arboladoData: ArboladoData): DashboardConfig[] {
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

  return configs;
}
