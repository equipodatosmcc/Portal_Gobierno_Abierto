"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/admin",
    label: "Inicio",
    description: "Resumen y accesos rápidos",
    icon: "IN",
    isActive: (pathname: string) => pathname === "/admin",
  },
  {
    href: "/admin/noticias",
    label: "Noticias",
    description: "Listado y estado editorial",
    icon: "NT",
    isActive: (pathname: string) => pathname === "/admin/noticias",
  },
  {
    href: "/admin/noticias/editor",
    label: "Nueva noticia",
    description: "Crear o editar contenido",
    icon: "ED",
    isActive: (pathname: string) => pathname === "/admin/noticias/editor",
  },
];

function getLinkClassName(isActive: boolean) {
  return isActive
    ? "group flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 px-3 py-3 text-left shadow-sm shadow-emerald-800/5"
    : "group flex items-start gap-3 rounded-2xl border border-transparent px-3 py-3 text-left transition-colors hover:border-slate-200 hover:bg-slate-100/90";
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2" aria-label="Navegación del panel">
      {navItems.map((item) => {
        const isActive = item.isActive(pathname);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={getLinkClassName(isActive)}
            aria-current={isActive ? "page" : undefined}
          >
            <span
              className={
                isActive
                  ? "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-[11px] font-bold tracking-wide text-white"
                  : "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-[11px] font-bold tracking-wide text-slate-700 transition-colors group-hover:bg-slate-300"
              }
            >
              {item.icon}
            </span>
            <span className="min-w-0">
              <span className={isActive ? "block text-sm font-semibold text-emerald-900" : "block text-sm font-semibold text-slate-900"}>
                {item.label}
              </span>
              <span className={isActive ? "block text-xs text-emerald-800/90" : "block text-xs text-slate-500"}>
                {item.description}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
