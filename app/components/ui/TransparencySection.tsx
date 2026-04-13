import Link from "next/link";
import { Scale, FileSearch, Landmark, Wallet } from "lucide-react";
import { Container } from "@/app/components/ui/Container";
import { HomeWebContentItem } from "@/app/components/ui/home-types";

type TransparencySectionProps = {
  contents: HomeWebContentItem[];
};

type IconType = typeof Scale;

type FallbackItem = {
  icon: IconType;
  title: string;
  text: string;
};

const fallbackItems: FallbackItem[] = [
  {
    icon: Wallet,
    title: "Presupuesto Abierto",
    text: "Consulta la ejecucion presupuestaria de la Municipalidad en tiempo real.",
  },
  {
    icon: FileSearch,
    title: "Compras y Contrataciones",
    text: "Licitaciones publicas, ordenes de compra y proveedores adjudicados.",
  },
  {
    icon: Scale,
    title: "Normativa Municipal",
    text: "Ordenanzas, decretos y resoluciones del Honorable Concejo Deliberante.",
  },
  {
    icon: Landmark,
    title: "Obras Publicas",
    text: "Estado de avance de las obras de infraestructura municipal.",
  },
];

export function TransparencySection({ contents }: TransparencySectionProps) {
  const normalized = contents.slice(0, 4).map((content, index) => ({
    title: content.title,
    text: content.content.slice(0, 120).trimEnd() + (content.content.length > 120 ? "..." : ""),
    icon: fallbackItems[index]?.icon ?? FileSearch,
  }));

  const items = normalized.length > 0 ? normalized : fallbackItems;

  return (
    <section id="transparencia" className="py-24">
      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Transparencia</p>
            <h2 className="mb-6 font-heading text-4xl text-foreground md:text-5xl">
              Gestion abierta y transparente
            </h2>
            <p className="mb-8 leading-relaxed text-muted-foreground">
              Creemos en una gestion municipal donde cada ciudadano pueda acceder a la informacion publica de
              manera simple y directa. Conoce como se administran los recursos de nuestra ciudad.
            </p>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:brightness-110"
            >
              Conocer mas
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
              >
                <item.icon className="mb-3 text-primary" size={28} aria-hidden="true" />
                <h3 className="mb-1 font-heading text-lg text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
