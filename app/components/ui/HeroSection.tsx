import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ExternalLink } from "lucide-react";
import { Container } from "@/app/components/ui/Container";

export function HeroSection() {
  return (
    <section id="inicio" className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
      <Image
        src="/images/home/hero-corrientes.jpg"
        alt="Vista aerea de la ciudad de Corrientes"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-gov-dark/90" />
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-primary/20 via-transparent to-transparent" />

      <Container className="relative z-10 px-4 py-32 text-center">
        <div className="animate-fade-in-up mb-6 inline-block rounded-full border border-white/30 bg-white/15 px-4 py-1.5 backdrop-blur-sm">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-white">
            Municipalidad de la Ciudad de Corrientes &mdash; La ciudad que queremos
          </p>
        </div>

        <h1
          className="animate-fade-in-up mb-6 font-heading text-5xl text-white drop-shadow-lg md:text-7xl lg:text-8xl"
          style={{ animationDelay: "0.1s" }}
        >
          Portal de
          <br />
          <span className="text-gradient-cyan">Gobierno Abierto</span>
        </h1>

        <p
          className="animate-fade-in-up mx-auto mb-12 max-w-2xl text-lg text-white drop-shadow md:text-xl"
          style={{ animationDelay: "0.2s" }}
        >
          Transparencia, participacion ciudadana y datos abiertos al servicio de los correntinos.
        </p>

        <div className="animate-fade-in-up flex flex-col justify-center gap-4 sm:flex-row" style={{ animationDelay: "0.3s" }}>
          <Link
            href="#tableros"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-gov-cyan-light"
          >
            Ver Tableros
          </Link>
          <Link
            href="https://datos.ciudaddecorrientes.gov.ar/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/35 bg-white/20 px-8 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30"
          >
            Portal de Datos <ExternalLink size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-16 sm:mt-24 flex justify-center animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Link
            href="#stats"
            className="animate-bounce text-white/80"
            aria-label="Ir a la seccion de estadisticas"
          >
            <ArrowDown size={28} aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
