import Papa from "papaparse";
import { z } from "zod";

// ── helpers ──────────────────────────────────────────────────────────────────

function countByKey<T extends Record<string, unknown>>(rows: T[], key: keyof T): ChartBar[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const val = String(row[key]);
    map.set(val, (map.get(val) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

// ── arbolado ─────────────────────────────────────────────────────────────────

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

    const allEspecies = countByKey(rows, "especie");
    const topEspecies = allEspecies.slice(0, 10);

    return { topEspecies, totalEspecies: allEspecies.length };
  } catch (err) {
    console.error("[ckanService] Failed to load arbolado data:", err);
    return EMPTY_DATA;
  }
}

// ── enfermeria ────────────────────────────────────────────────────────────────

const ENFERMERIA_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS2AwukA-aisw6_kd9RzM9T1s29I_nggq1ZRFAwJJz62HAkHEHVau_gj0qZUKmoWNmVdJLYVQ203lTw/pub?gid=1942481&single=true&output=csv";

const EnfermeriaRowSchema = z.object({
  saps: z.string(),
  fecha: z.string(),
  fecha_mes: z.string(),
  fecha_anio: z.string(),
  id_servicio: z.string(),
  prestacion_categoria: z.string(),
  prestacion_tipo: z.string(),
  consulta_cantidad: z.coerce.number(),
  barrio_operativo: z.string(),
});

type EnfermeriaRow = z.infer<typeof EnfermeriaRowSchema>;

export type EnfermeriaData = {
  topPrestaciones: ChartBar[];
  totalConsultas: number;
  totalSaps: number;
};

const ENFERMERIA_EMPTY: EnfermeriaData = { topPrestaciones: [], totalConsultas: 0, totalSaps: 0 };

export async function getEnfermeriaData(): Promise<EnfermeriaData> {
  try {
    const res = await fetch(ENFERMERIA_CSV_URL, { next: { revalidate: 43200 } });
    if (!res.ok) {
      console.error(`[ckanService] HTTP ${res.status} fetching enfermeria CSV`);
      return ENFERMERIA_EMPTY;
    }
    const csvText = await res.text();
    const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
    const rows: EnfermeriaRow[] = [];
    for (const raw of parsed.data) {
      const result = EnfermeriaRowSchema.safeParse(raw);
      if (result.success) rows.push(result.data);
    }
    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(row.prestacion_tipo, (map.get(row.prestacion_tipo) ?? 0) + row.consulta_cantidad);
    }
    const topPrestaciones = Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
    const totalConsultas = rows.reduce((s, r) => s + r.consulta_cantidad, 0);
    const totalSaps = new Set(rows.map((r) => r.saps)).size;
    return { topPrestaciones, totalConsultas, totalSaps };
  } catch (err) {
    console.error("[ckanService] Failed to load enfermeria data:", err);
    return ENFERMERIA_EMPTY;
  }
}

// ── consultas odontologicas ───────────────────────────────────────────────────

const ODONTOLOGICAS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRwoURQbaCWGURJtCCqUsFJFUSnHlJoIlaBd_hlX0IChLT0VafRtzz7lo7tb3bYH6J051l8OZeE5LkH/pub?gid=608680772&single=true&output=csv";

const OdontologicasRowSchema = z.object({
  saps: z.string(),
  fecha: z.string(),
  fecha_mes: z.string(),
  fecha_anio: z.string(),
  id_servicio: z.string(),
  servicio: z.string(),
  turno: z.string(),
  cod_consulta: z.string(),
  id_rango_etario: z.string(),
  id_sexo: z.string(),
  consulta_cantidad: z.coerce.number(),
  rango_etario: z.string(),
  sexo: z.string(),
  detalle: z.string(),
});

type OdontologicasRow = z.infer<typeof OdontologicasRowSchema>;

export type OdontologicasData = {
  topPracticas: ChartBar[];
  totalConsultas: number;
  totalPracticas: number;
};

const ODONTOLOGICAS_EMPTY: OdontologicasData = { topPracticas: [], totalConsultas: 0, totalPracticas: 0 };

export async function getOdontologicasData(): Promise<OdontologicasData> {
  try {
    const res = await fetch(ODONTOLOGICAS_CSV_URL, { next: { revalidate: 43200 } });
    if (!res.ok) {
      console.error(`[ckanService] HTTP ${res.status} fetching odontologicas CSV`);
      return ODONTOLOGICAS_EMPTY;
    }
    const csvText = await res.text();
    const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
    const rows: OdontologicasRow[] = [];
    for (const raw of parsed.data) {
      const result = OdontologicasRowSchema.safeParse(raw);
      if (result.success) rows.push(result.data);
    }
    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(row.detalle, (map.get(row.detalle) ?? 0) + row.consulta_cantidad);
    }
    const allPracticas = Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
    const topPracticas = allPracticas.slice(0, 10);
    const totalConsultas = rows.reduce((s, r) => s + r.consulta_cantidad, 0);
    const totalPracticas = new Set(rows.map((r) => r.detalle)).size;
    return { topPracticas, totalConsultas, totalPracticas };
  } catch (err) {
    console.error("[ckanService] Failed to load odontologicas data:", err);
    return ODONTOLOGICAS_EMPTY;
  }
}

// ── inmunizaciones ────────────────────────────────────────────────────────────

const INMUNIZACIONES_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS2AwukA-aisw6_kd9RzM9T1s29I_nggq1ZRFAwJJz62HAkHEHVau_gj0qZUKmoWNmVdJLYVQ203lTw/pub?gid=851131482&single=true&output=csv";

const InmunizacionesRowSchema = z.object({
  saps: z.string(),
  fecha: z.string(),
  fecha_mes: z.string(),
  fecha_anio: z.string(),
  vacunas_tipo: z.string(),
  vacunas_cantidad: z.coerce.number(),
  barrio_operativo: z.string(),
});

type InmunizacionesRow = z.infer<typeof InmunizacionesRowSchema>;

export type InmunizacionesData = {
  topVacunas: ChartBar[];
  totalVacunas: number;
  totalTipos: number;
};

const INMUNIZACIONES_EMPTY: InmunizacionesData = { topVacunas: [], totalVacunas: 0, totalTipos: 0 };

export async function getInmunizacionesData(): Promise<InmunizacionesData> {
  try {
    const res = await fetch(INMUNIZACIONES_CSV_URL, { next: { revalidate: 43200 } });
    if (!res.ok) {
      console.error(`[ckanService] HTTP ${res.status} fetching inmunizaciones CSV`);
      return INMUNIZACIONES_EMPTY;
    }
    const csvText = await res.text();
    const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
    const rows: InmunizacionesRow[] = [];
    for (const raw of parsed.data) {
      const result = InmunizacionesRowSchema.safeParse(raw);
      if (result.success) rows.push(result.data);
    }
    const filtered = rows.filter((r) => r.vacunas_tipo.trim() !== "" && r.vacunas_cantidad > 0);
    const map = new Map<string, number>();
    for (const row of filtered) {
      map.set(row.vacunas_tipo, (map.get(row.vacunas_tipo) ?? 0) + row.vacunas_cantidad);
    }
    const allVacunas = Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
    const topVacunas = allVacunas.slice(0, 10);
    const totalVacunas = filtered.reduce((s, r) => s + r.vacunas_cantidad, 0);
    const totalTipos = map.size;
    return { topVacunas, totalVacunas, totalTipos };
  } catch (err) {
    console.error("[ckanService] Failed to load inmunizaciones data:", err);
    return INMUNIZACIONES_EMPTY;
  }
}

// ── sac ───────────────────────────────────────────────────────────────────────

const SAC_CSV_URL =
  "https://datos.ciudaddecorrientes.gov.ar/dataset/98200999-92ae-4346-ba89-833f340825a2/resource/1b70d5ba-a615-43a2-a388-bb7476b70e44/download/sac_2026.csv";

const SacRowSchema = z.object({
  id_contacto: z.string(),
  momento_contacto: z.string(),
  via_contacto: z.string(),
  lng: z.string(),
  lat: z.string(),
  tipo_pedido: z.string(),
  asunto: z.string(),
  id_barrio: z.string(),
  nombre_barrio: z.string(),
});

type SacRow = z.infer<typeof SacRowSchema>;

export type SacData = {
  topAsuntos: ChartBar[];
  viaContacto: ChartBar[];
  totalContactos: number;
  totalBarrios: number;
};

const SAC_EMPTY: SacData = { topAsuntos: [], viaContacto: [], totalContactos: 0, totalBarrios: 0 };

export async function getSacData(): Promise<SacData> {
  try {
    const res = await fetch(SAC_CSV_URL, { next: { revalidate: 43200 } });
    if (!res.ok) {
      console.error(`[ckanService] HTTP ${res.status} fetching SAC CSV`);
      return SAC_EMPTY;
    }
    const csvText = await res.text();
    const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
    const rows: SacRow[] = [];
    for (const raw of parsed.data) {
      const result = SacRowSchema.safeParse(raw);
      if (result.success) rows.push(result.data);
    }
    const topAsuntos = countByKey(rows, "asunto").slice(0, 10);
    const viaContacto = countByKey(rows, "via_contacto");
    const totalContactos = rows.length;
    const totalBarrios = new Set(
      rows.map((r) => r.nombre_barrio).filter((b) => b && b !== "SIN BARRIO"),
    ).size;
    return { topAsuntos, viaContacto, totalContactos, totalBarrios };
  } catch (err) {
    console.error("[ckanService] Failed to load SAC data:", err);
    return SAC_EMPTY;
  }
}

// ── datasets count ────────────────────────────────────────────────────────────

export async function getCKANDatasetsCount(): Promise<number> {
  try {
    const res = await fetch(
      "https://datos.ciudaddecorrientes.gov.ar/api/3/action/package_search?rows=0",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) {
      console.error(`[ckanService] HTTP ${res.status} fetching datasets count`);
      return 0;
    }
    const json = (await res.json()) as {
      success: boolean;
      result: { count: number };
    };
    return json.success ? (json.result.count ?? 0) : 0;
  } catch (err) {
    console.error("[ckanService] Failed to fetch datasets count:", err);
    return 0;
  }
}
