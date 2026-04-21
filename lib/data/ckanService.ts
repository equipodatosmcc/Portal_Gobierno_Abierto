import Papa from "papaparse";
import { z } from "zod";

const CSV_URL =
  "https://datos.ciudaddecorrientes.gov.ar/dataset/ef335de5-c284-4d03-adac-3abd47e82ca1/resource/407e6a85-da27-4424-b4e3-0b4c8fd4d87d/download/arboles.csv";

const ArbolRowSchema = z.object({
  id_arbol: z.coerce.number().int().positive(),
  direccion: z.string(),
  tipo_vereda: z.string(),
  lado_vereda: z.string(),
  especie: z.string().min(1),
  tipo_tendido: z.string(),
  distancia_entre_ar: z.coerce.number(),
  distancia_al_muro: z.coerce.number(),
  activo: z.string().transform((v) => v.toLowerCase() === "true"),
  lng: z.coerce.number(),
  lat: z.coerce.number(),
});

type ArbolRow = z.infer<typeof ArbolRowSchema>;

export type ChartBar = { label: string; value: number };

export type ArboladoData = {
  topEspecies: ChartBar[];
  totalEspecies: number;
};

const EMPTY_DATA: ArboladoData = { topEspecies: [], totalEspecies: 0 };

function countBy(rows: ArbolRow[], key: keyof ArbolRow): ChartBar[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const val = String(row[key]);
    map.set(val, (map.get(val) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export async function getArboladoData(): Promise<ArboladoData> {
  try {
    const res = await fetch(CSV_URL, { next: { revalidate: 43200 } });
    if (!res.ok) {
      console.error(`[ckanService] HTTP ${res.status} fetching arbolado CSV`);
      return EMPTY_DATA;
    }

    const csvText = await res.text();

    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const rows: ArbolRow[] = [];
    for (const raw of parsed.data) {
      const result = ArbolRowSchema.safeParse(raw);
      if (result.success) {
        rows.push(result.data);
      }
    }

    const allEspecies = countBy(rows, "especie");
    const topEspecies = allEspecies.slice(0, 10);

    return { topEspecies, totalEspecies: allEspecies.length };
  } catch (err) {
    console.error("[ckanService] Failed to load arbolado data:", err);
    return EMPTY_DATA;
  }
}
