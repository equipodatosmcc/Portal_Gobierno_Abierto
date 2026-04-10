import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type LocalNewsItem = {
  id: number;
  title: string;
  bajada: string;
  cuerpo: string;
  image: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

const NEWS_FILE_PATH = path.join(process.cwd(), "data", "news.json");

const defaultNews: LocalNewsItem[] = [
  {
    id: 1,
    title: "Se presentó el nuevo plan de participación ciudadana",
    bajada: "La Municipalidad anunció una agenda de encuentros abiertos en barrios y delegaciones.",
    cuerpo:
      "El programa busca fortalecer el vínculo con vecinas y vecinos, incorporando herramientas digitales y espacios presenciales de escucha activa.",
    image: null,
    published: true,
    createdAt: "2026-04-07T15:30:00.000Z",
    updatedAt: "2026-04-07T15:30:00.000Z",
  },
  {
    id: 2,
    title: "Convocatoria para mesas de trabajo de Gobierno Abierto",
    bajada: "Se abrió la inscripción para organizaciones e instituciones interesadas en participar.",
    cuerpo:
      "Las mesas abordarán transparencia, innovación y acceso a la información pública con una metodología colaborativa y seguimiento trimestral.",
    image: null,
    published: false,
    createdAt: "2026-04-08T12:00:00.000Z",
    updatedAt: "2026-04-08T12:00:00.000Z",
  },
  {
    id: 3,
    title: "Comenzó la modernización del portal de trámites municipales",
    bajada: "La actualización prioriza accesibilidad, velocidad y simplificación de pasos para la ciudadanía.",
    cuerpo:
      "El equipo técnico inició una etapa de rediseño integral que incorpora mejoras en formularios, seguimiento de expedientes y documentación en lenguaje claro.",
    image: null,
    published: true,
    createdAt: "2026-04-09T09:15:00.000Z",
    updatedAt: "2026-04-09T09:15:00.000Z",
  },
  {
    id: 4,
    title: "Nueva agenda de capacitaciones para referentes barriales",
    bajada: "Habrá encuentros semanales sobre herramientas digitales y acceso a información pública.",
    cuerpo:
      "Las capacitaciones están orientadas a fortalecer redes comunitarias y promover la participación de organizaciones locales en procesos de consulta y co-creación.",
    image: null,
    published: false,
    createdAt: "2026-04-09T10:30:00.000Z",
    updatedAt: "2026-04-09T10:30:00.000Z",
  },
  {
    id: 5,
    title: "Se habilitó un canal único para reportes ciudadanos",
    bajada: "El nuevo canal centraliza reclamos, sugerencias y solicitudes de información.",
    cuerpo:
      "Con esta herramienta, las áreas municipales podrán responder en menor tiempo y ofrecer trazabilidad del estado de cada gestión en una vista unificada.",
    image: null,
    published: true,
    createdAt: "2026-04-09T11:45:00.000Z",
    updatedAt: "2026-04-09T11:45:00.000Z",
  },
];

async function ensureNewsFile() {
  const directory = path.dirname(NEWS_FILE_PATH);
  await mkdir(directory, { recursive: true });

  try {
    await readFile(NEWS_FILE_PATH, "utf-8");
  } catch {
    await writeFile(NEWS_FILE_PATH, JSON.stringify(defaultNews, null, 2), "utf-8");
  }
}

export async function readNewsFile() {
  await ensureNewsFile();

  const fileContent = await readFile(NEWS_FILE_PATH, "utf-8");

  try {
    const parsed = JSON.parse(fileContent) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as LocalNewsItem[];
  } catch {
    return [];
  }
}

export async function writeNewsFile(news: LocalNewsItem[]) {
  await ensureNewsFile();
  await writeFile(NEWS_FILE_PATH, JSON.stringify(news, null, 2), "utf-8");
}
