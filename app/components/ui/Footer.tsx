import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Container } from "@/app/components/ui/Container";

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <Container className="py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <div className="mb-4">
              <Image
                src="/LOGO VERTICAL.png"
                alt="Municipalidad de Corrientes - La ciudad que queremos"
                width={140}
                height={94}
                className="h-20 w-auto"
              />
            </div>
            <p className="text-sm leading-relaxed text-secondary-foreground/80">
              Portal de Gobierno Abierto de la Municipalidad de la Ciudad de Corrientes. Transparencia,
              datos abiertos y participacion ciudadana.
            </p>
          </div>

          <nav aria-label="Enlaces del sitio">
            <h2 className="mb-4 font-heading text-lg">Enlaces</h2>
            <ul className="space-y-2 text-sm text-secondary-foreground/85">
              <li>
                <Link href="#tableros" className="transition-colors hover:text-primary">
                  Tableros de Datos
                </Link>
              </li>
              <li>
                <Link href="#transparencia" className="transition-colors hover:text-primary">
                  Transparencia
                </Link>
              </li>
              <li>
                <Link href="#novedades" className="transition-colors hover:text-primary">
                  Novedades
                </Link>
              </li>
              <li>
                <Link href="#feedback" className="transition-colors hover:text-primary">
                  Solicitudes y Feedback
                </Link>
              </li>
              <li>
                <Link
                  href="https://datos.ciudaddecorrientes.gov.ar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-primary"
                >
                  Portal de Datos <ExternalLink size={12} aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </nav>

          <address className="not-italic">
            <h2 className="mb-4 font-heading text-lg">Contacto</h2>
            <p className="mb-3 text-sm font-medium text-secondary-foreground">
              Direccion General de Innovacion Publica y Gobierno Abierto
            </p>
            <ul className="space-y-2 text-sm text-secondary-foreground/85">
              <li>25 de Mayo 1182, Corrientes</li>
              <li>CP 3400, Argentina</li>
              <li>innovacionpublica@ciudaddecorrientes.gov.ar</li>
              <li>(0379) 447-3000</li>
            </ul>
          </address>
        </div>
      </Container>

      <div className="border-t border-gov-dark-light/30">
        <Container className="flex flex-col items-center justify-between gap-2 py-5 text-xs text-secondary-foreground/80 sm:flex-row">
          <p>© 2026 Municipalidad de la Ciudad de Corrientes. Todos los derechos reservados.</p>
          <p>Direccion General de Innovacion Publica y Gobierno Abierto</p>
        </Container>
      </div>
    </footer>
  );
}
