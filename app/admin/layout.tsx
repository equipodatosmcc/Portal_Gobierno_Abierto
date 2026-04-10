import type { ReactNode } from "react";
import Link from "next/link";
import { SidebarNav } from "./components/sidebar-nav";
import { SignOutButton } from "./sign-out-button";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-5 px-4 py-5 md:grid-cols-[300px_1fr] md:px-6 md:py-6">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/5 md:sticky md:top-6 md:p-5">
          <div className="rounded-2xl bg-[linear-gradient(145deg,#0f172a_0%,#134e4a_55%,#065f46_100%)] p-4 text-white">
            <p className="text-[11px] font-semibold tracking-widest text-emerald-100 uppercase">Gobierno Abierto</p>
            <h1 className="mt-2 text-xl font-bold tracking-tight">Panel de comunicación</h1>
            <p className="mt-2 text-sm leading-relaxed text-emerald-50/95">
              Gestioná noticias y contenidos editoriales desde un único espacio.
            </p>
          </div>

          <div className="mt-5">
            <p className="mb-2 px-1 text-[11px] font-semibold tracking-widest text-slate-500 uppercase">Navegación</p>
            <SidebarNav />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">Acceso público</p>
            <Link href="/" className="mt-1 inline-flex text-sm font-semibold text-sky-700 hover:text-sky-800">
              Ver sitio principal
            </Link>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <SignOutButton />
          </div>
        </aside>

        <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
