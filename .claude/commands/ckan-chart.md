# /ckan-chart — Agregar un nuevo tablero desde CKAN

Scaffold completo de un pipeline CKAN + card en `DashboardsSection` para el portal de Gobierno Abierto.
Funciona con cualquier dataset CSV del portal de datos abiertos municipal y cualquier tipo de gráfico soportado por Recharts.

## Inputs mínimos a pedir al usuario

1. **URL del CSV** — URL de descarga directa (botón "Descargar" en el portal de datos)
2. **URL del dataset** — página del dataset en el portal (para el link "Ver dataset completo")
3. **Slug** — nombre corto en snake_case (`residuos`, `transito`, `arbolado`)

Los demás inputs (tipo de gráfico, columnas a usar, qué historia contar) son **opcionales**: si el usuario no los provee, ejecutar el Paso 0 para inferirlos automáticamente.

---

## Paso 0 — Analizar el dataset y elegir el gráfico (cuando el usuario no especifica)

Descargar y explorar el CSV antes de escribir código. El objetivo es entender la estructura real de los datos y decidir qué visualización aporta más valor.

### 0.1 — Descargar y leer las primeras filas

```bash
curl -L "<URL_CSV>" | head -50
```

O usar `WebFetch` con la URL del CSV y leer los primeros ~50 registros del body.

### 0.2 — Clasificar cada columna

Para cada columna del CSV, determinar:

| Tipo detectado | Criterio |
|----------------|----------|
| **Categórica** | strings repetidos, baja cardinalidad (< 50 valores únicos en la muestra) |
| **Categórica alta cardinalidad** | strings únicos o casi únicos (nombres, direcciones, IDs) — generalmente no graficable directamente |
| **Numérica continua** | números con decimales o rango amplio |
| **Numérica discreta / conteo** | enteros, baja varianza |
| **Fecha / temporal** | formato ISO, dd/mm/yyyy, o similar |
| **Booleana** | "true"/"false", "si"/"no", "1"/"0" |
| **Geoespacial** | lat/lng, coordenadas — no usar en Recharts |

### 0.3 — Elegir el gráfico aplicando estas reglas en orden

Evaluar de arriba hacia abajo y tomar la primera que aplique:

1. **¿Hay una columna de fecha/mes/año + una numérica?**
   → `AreaChart` (serie temporal). Historia: evolución en el tiempo.

2. **¿Hay una categórica con ≤ 8 valores únicos + una numérica (o conteo)?**
   → `PieChart` donut. Historia: distribución de partes de un todo.

3. **¿Hay una categórica con 9–30 valores únicos + conteo?**
   → `BarChart` vertical, top N. Historia: ranking de categorías.

4. **¿Hay una categórica con > 30 valores únicos o nombres muy largos + conteo?**
   → `BarChart` horizontal (`layout="vertical"`), top 10. Historia: ranking con etiquetas largas.

5. **¿Hay dos columnas numéricas continuas?**
   → `ScatterChart`. Historia: correlación o dispersión.

6. **¿Hay dos o más métricas numéricas por categoría?**
   → `BarChart` agrupado con múltiples `<Bar>`. Historia: comparación multidimensional.

> Si el dataset permite más de una historia interesante, elegir la más informativa para el `FullChart` y documentar las alternativas descartadas en un comentario breve.

### 0.4 — Determinar las columnas concretas a usar

Una vez elegido el tipo de gráfico, identificar:
- **Eje X / categoría**: nombre exacto de la columna
- **Eje Y / valor**: nombre exacto de la columna (o "conteo" si se agrupan filas)
- **Top N** (si aplica): 10 para rankings, todos los valores para ≤ 8 categorías
- **Columna de fecha** (si aplica): formato a parsear

### 0.5 — Proponer al usuario antes de implementar

Presentar en 2–3 líneas: el gráfico elegido, las columnas que se van a usar, y la historia que cuenta. Esperar confirmación o corrección antes de continuar con el Paso 1.

Ejemplo:
> "Con este dataset propongo un **AreaChart** mensual: eje X = `fecha_infraccion` (agrupado por mes), eje Y = cantidad de infracciones. Muestra la evolución temporal de multas. ¿Seguimos con esto?"

---

## Paso 1 — Extender `lib/data/ckanService.ts`

Agregar al servicio existente (o crear `lib/data/<slug>Service.ts` separado si el dataset es independiente):

```typescript
const <SLUG>_CSV_URL = "<URL_DESCARGA_CSV>";

const <Dataset>RowSchema = z.object({
  // solo las columnas que se van a usar en el gráfico
  <columna>: z.string(),
  <columna_num>: z.coerce.number(),
  <columna_bool>: z.string().transform(v => v.toLowerCase() === "true"),
  // fecha como string; parsear con new Date() dentro de la función si es necesario
});

type <Dataset>Row = z.infer<typeof <Dataset>RowSchema>;

export type <Dataset>Data = {
  // Adaptar al gráfico elegido:
  // — ranking/barras:  top<Columna>: ChartBar[];  total<Columna>: number;
  // — serie temporal:  byMes: ChartBar[];
  // — donut:           byCategoria: { name: string; value: number }[];
  // — scatter:         points: { x: number; y: number; label?: string }[];
  // — barras múltiples: byCategoria: { label: string; [metrica: string]: number | string }[];
};

const <SLUG>_EMPTY: <Dataset>Data = { /* campos vacíos */ };

export async function get<Dataset>Data(): Promise<<Dataset>Data> {
  try {
    const res = await fetch(<SLUG>_CSV_URL, { next: { revalidate: 43200 } }); // 12h
    if (!res.ok) {
      console.error(`[ckanService] HTTP ${res.status} fetching <slug> CSV`);
      return <SLUG>_EMPTY;
    }
    const csvText = await res.text();
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    const rows: <Dataset>Row[] = [];
    for (const raw of parsed.data) {
      const result = <Dataset>RowSchema.safeParse(raw);
      if (result.success) rows.push(result.data);
    }

    // Lógica de agregación según el gráfico elegido en Paso 0:
    // — ranking:      countBy(rows, "<columna>").slice(0, <N>)
    // — serie temp:   agrupar por mes/año con reduce sobre fecha parseada
    // — donut:        countBy por categoría (todos los valores, no top N)
    // — scatter:      mapear rows → { x: row.<col1>, y: row.<col2>, label: row.<id> }
    // — múltiples:    reduce agrupando por categoría y acumulando métricas

    return { /* resultado */ };
  } catch (err) {
    console.error("[ckanService] Error cargando <slug>:", err);
    return <SLUG>_EMPTY;
  }
}
```

> `countBy(rows, key)` ya existe en el servicio — reutilizarla para cualquier agrupamiento categórico.

---

## Paso 2 — Crear los sub-componentes de gráfico

Cada tablero necesita dos componentes: **CompactChart** (para la card) y **FullChart** (para la vista de detalle). Implementarlos en `DashboardsSection.tsx` o en un archivo separado si son complejos.

**Hydration guard obligatorio en ambos:**
```typescript
function <Slug>CompactChart({ data }: { data: <Dataset>Data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-36 w-full" />;
  // ...
}

function <Slug>FullChart({ data }: { data: <Dataset>Data }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="h-80 w-full" />;
  // ...
}
```

**El CompactChart siempre es un BarChart simple de 144px**, sin labels de eje, independiente del tipo del FullChart. Usar los datos principales (top 5 si es ranking, todos si son ≤ 8, primeros 8 puntos si es serie temporal).

### Patrones de FullChart por tipo de gráfico

**BarChart vertical (ranking, 9–30 categorías):**
```tsx
<ResponsiveContainer width="100%" height={320}>
  <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 64 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
    <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
    <YAxis tick={{ fontSize: 11 }} />
    <Tooltip formatter={(v) => [v, "<unidad>"]} />
    <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]}>
      {data.map((_, i) => <Cell key={i} fill={i === 0 ? "#15803d" : "#16a34a"} />)}
    </Bar>
  </BarChart>
</ResponsiveContainer>
```

**PieChart donut (distribución, ≤ 8 categorías):**
```tsx
const COLORS = ["#16a34a", "#15803d", "#166534", "#14532d", "#22c55e", "#4ade80", "#86efac", "#bbf7d0"];
<ResponsiveContainer width="100%" height={320}>
  <PieChart>
    <Pie data={data} dataKey="value" nameKey="name" innerRadius={72} outerRadius={120}
      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
      {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
    </Pie>
    <Tooltip formatter={(v) => [v, "<unidad>"]} />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

**AreaChart (serie temporal):**
```tsx
<ResponsiveContainer width="100%" height={320}>
  <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
    <YAxis tick={{ fontSize: 11 }} />
    <Tooltip formatter={(v) => [v, "<unidad>"]} />
    <Area type="monotone" dataKey="value" stroke="#16a34a" fill="#16a34a22" strokeWidth={2} />
  </AreaChart>
</ResponsiveContainer>
```

**BarChart horizontal (etiquetas largas o > 30 categorías, top 10):**
```tsx
<ResponsiveContainer width="100%" height={Math.max(256, data.length * 36)}>
  <BarChart data={data} layout="vertical" margin={{ top: 4, right: 32, left: 120, bottom: 4 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
    <XAxis type="number" tick={{ fontSize: 11 }} />
    <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={112} />
    <Tooltip formatter={(v) => [v, "<unidad>"]} />
    <Bar dataKey="value" fill="#16a34a" radius={[0, 4, 4, 0]} />
  </BarChart>
</ResponsiveContainer>
```

**ScatterChart (correlación entre dos numéricas):**
```tsx
<ResponsiveContainer width="100%" height={320}>
  <ScatterChart margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
    <XAxis dataKey="x" name="<nombre X>" tick={{ fontSize: 11 }} />
    <YAxis dataKey="y" name="<nombre Y>" tick={{ fontSize: 11 }} />
    <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v) => [v, ""]} />
    <Scatter data={data} fill="#16a34a" />
  </ScatterChart>
</ResponsiveContainer>
```

**BarChart agrupado (múltiples métricas por categoría):**
```tsx
<ResponsiveContainer width="100%" height={320}>
  <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 64 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#dbe2ea" />
    <XAxis dataKey="label" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
    <YAxis tick={{ fontSize: 11 }} />
    <Tooltip />
    <Legend />
    <Bar dataKey="<metrica1>" fill="#16a34a" radius={[4, 4, 0, 0]} />
    <Bar dataKey="<metrica2>" fill="#15803d" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

---

## Paso 3 — Agregar entrada en `buildDashboards()` dentro de `DashboardsSection.tsx`

```typescript
// Extender el tipo DashboardKey
type DashboardKey = "arbolado" | "<slug>";

// Extender los props
type Props = { arboladoData: ArboladoData; <slug>Data: <Dataset>Data };

// Dentro de buildDashboards(), agregar:
if (<condición de datos válidos>) {
  configs.push({
    key: "<slug>",
    title: "<Título del tablero>",
    description: "Descripción breve del dataset.",
    colorClass: "bg-<color>-50 text-<color>-600",
    miniData: <datos para CompactChart>,
    fullData: <datos para FullChart>,
    stats: [
      { label: "<Métrica principal>", value: <valor>.toLocaleString("es-AR") },
      { label: "<Dato más destacado>", value: <valor> },
      { label: "<Total categorías únicas>", value: String(<slug>Data.total<Columna>) },
    ],
    datasetUrl: "<URL_DATASET>",
  });
}
```

**Convención de stats (siempre 3 ítems, sin "Fuente"):**
- Ítem 1: la métrica más importante (total registros, suma, rango temporal, etc.)
- Ítem 2: el dato más destacado (categoría más frecuente, máximo, mínimo, tendencia, etc.)
- Ítem 3: el total de categorías únicas del dataset completo (no solo del top N ni la muestra)

**Si el gráfico no usa `ChartBar[]`:** extender `DashboardConfig` con campos adicionales tipados para ese dataset. Mantener el resto de la estructura para que la paginación y la vista de detalle sigan funcionando sin cambios.

---

## Paso 4 — Actualizar `app/page.tsx`

```typescript
// Import
import { get<Dataset>Data } from "@/lib/data/ckanService";

// En getHomeData(), extender Promise.all
const [newsRecords, contentRecords, arboladoData, <slug>Data] = await Promise.all([
  findManyNews({ onlyPublished: true }).catch(() => []),
  findManyWebContent({ onlyPublished: true }).catch(() => []),
  getArboladoData(),
  get<Dataset>Data(),
]);

return { news, transparencyContent, arboladoData, <slug>Data };

// En el JSX
<DashboardsSection arboladoData={arboladoData} <slug>Data={<slug>Data} />
```

---

## Convenciones del proyecto

| Aspecto | Regla |
|---------|-------|
| **Caché ISR** | `{ next: { revalidate: 43200 } }` en el fetch (12h); la página se re-renderiza cada 1800s usando el caché |
| **Aggregación** | Siempre server-side en el service; el Client Component solo recibe datos ya procesados |
| **Hydration guard** | Cada sub-chart tiene `useState(false)` + `useEffect(() => setMounted(true), [])` — obligatorio para Recharts en SSR |
| **Colores** | `#16a34a` (verde) barras/líneas/puntos; primer elemento resaltado en `#15803d`; paleta para multi-serie/donut: `["#16a34a","#15803d","#166534","#14532d","#22c55e","#4ade80","#86efac","#bbf7d0"]` |
| **Tokens CSS** | `bg-card`, `border-border`, `text-primary`, `text-foreground`, `text-muted-foreground` |
| **Chart compacto** | Siempre BarChart de 144px, sin labels de eje, tooltip activo — independiente del tipo del FullChart |
| **Chart completo** | 320px mínimo; adaptar altura y márgenes al tipo de gráfico y cantidad de datos |
| **Stats** | 3 ítems: métrica principal · dato más destacado · total categorías únicas. Sin "Fuente" ni mencionar CKAN |
| **Link al dataset** | `datasetUrl` en cada config → se muestra como "Ver dataset completo" en la vista de detalle |
| **Fallback** | `EMPTY_DATA` en catch; `buildDashboards` omite la entrada si no hay datos válidos |
| **Paginación** | `PAGE_SIZE = 3`; "Ver más" aparece solo si hay más de 3 tableros |
| **CORS** | El fetch corre en el servidor de Next.js — no hay problema de CORS |
| **Librería de gráficos** | Recharts — agregar imports a `DashboardsSection.tsx` según el tipo de gráfico elegido |

---

## Ejemplo de invocaciones

**Sin especificar tipo (análisis automático):**
"Agrega un tablero CKAN para el dataset de habilitaciones comerciales. CSV: [URL], dataset: [URL_PÁGINA]."
→ Claude descarga el CSV, analiza columnas, elige el gráfico y propone antes de implementar.

**Especificando tipo (implementación directa):**
"Agrega un tablero de infracciones de tránsito. CSV: [URL], dataset: [URL_PÁGINA], eje X = mes/año de la infracción, eje Y = cantidad mensual, AreaChart."

**Con top N explícito:**
"Agrega un tablero de residuos. CSV: [URL], dataset: [URL_PÁGINA], agrupa por tipo_residuo, top 10."
