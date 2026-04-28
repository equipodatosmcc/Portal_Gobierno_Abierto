import { Database, Newspaper, BarChart3 } from "lucide-react";
import { Container } from "@/app/components/ui/Container";

type StatsSectionProps = {
  datasetsCount: number;
  dashboardsCount: number;
  newsCount: number;
};

export function StatsSection({
  datasetsCount,
  dashboardsCount,
  newsCount,
}: StatsSectionProps) {
  const stats = [
    { icon: Database, value: `${datasetsCount}+`, label: "Datasets Publicados" },
    { icon: BarChart3, value: `${dashboardsCount}`, label: "Tableros Interactivos" },
    { icon: Newspaper, value: `${newsCount}`, label: "Noticias Publicadas" },
  ];

  return (
    <section id="stats" className="relative -mt-16 z-20">
      <Container>
        <h2 className="sr-only">Indicadores principales</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat, index) => (
            <article
              key={stat.label}
              className="animate-count-up group rounded-xl border border-border bg-card p-6 text-center shadow-lg transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <stat.icon
                className="mx-auto mb-3 text-primary transition-transform duration-300 group-hover:scale-110"
                size={28}
                aria-hidden="true"
              />
              <p className="font-heading text-3xl text-foreground transition-colors duration-300 group-hover:text-primary">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
