"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Container } from "@/app/components/ui/Container";

const navItems = [
  { label: "Inicio", href: "#inicio" },
  { label: "Portal de Datos", href: "https://datos.ciudaddecorrientes.gov.ar/", external: true },
  { label: "Tableros", href: "#tableros" },
  { label: "Transparencia", href: "#transparencia" },
  { label: "Novedades", href: "#novedades" },
  { label: "Feedback", href: "#feedback" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 bg-gov-dark shadow-lg transition-all duration-300 ${
        scrolled ? "bg-gov-dark/95 backdrop-blur-md" : ""
      }`}
    >
      <Container className="flex h-16 items-center justify-between">
        <Link href="#inicio" className="flex items-center gap-3" aria-label="Ir al inicio">
          <Image
            src="/LA MUNI - BLANCO.png"
            alt="La Muni - Municipalidad de Corrientes"
            width={88}
            height={52}
            className="h-9 w-auto"
            priority
          />
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-white/70">Portal de Gobierno Abierto</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegacion principal">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                item.external
                  ? "inline-flex items-center gap-1 bg-white/10 text-white hover:bg-white/20"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
              {item.external ? <ExternalLink size={12} aria-hidden="true" /> : null}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="rounded-md p-2 text-white lg:hidden"
          aria-label={open ? "Cerrar menu de navegacion" : "Abrir menu de navegacion"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>
      </Container>

      {open ? (
        <nav
          id="mobile-menu"
          className="border-t border-white/10 bg-secondary/95 pb-4 backdrop-blur"
          aria-label="Navegacion movil"
        >
          <Container>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-3 text-white/90 transition-colors hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </Container>
        </nav>
      ) : null}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-3 h-3 bg-linear-to-b from-gov-dark/85 to-transparent"
      />
    </header>
  );
}
