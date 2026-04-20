import { requireSessionManager } from "@/lib/content-auth";
import { findManyCitizenMessages } from "@/lib/services/citizen";
import Papa from "papaparse";

export async function GET() {
  try {
    await requireSessionManager();
  } catch {
    return new Response("Forbidden", { status: 403 });
  }

  const messages = await findManyCitizenMessages();

  const rows = messages.map((m) => ({
    id: m.id,
    fecha: m.createdAt.toISOString(),
    tipo: m.type,
    estado: m.status,
    nombre: m.name,
    email: m.email,
    asunto: m.subject ?? "",
    mensaje: m.message,
    dataset: m.dataset ?? "",
  }));

  const csv = Papa.unparse(rows, { header: true });

  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const filename = `mensajes-ciudadanos-${date}.csv`;

  return new Response("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
