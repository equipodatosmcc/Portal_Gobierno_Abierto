import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/auth";
import { SignOutButton } from "./sign-out-button";

export default async function AdminPage() {
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-xs font-semibold tracking-widest text-emerald-700 uppercase">Panel de administración</p>
          <SignOutButton />
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Bienvenido al área interna</h1>
        <p className="mt-3 text-base text-slate-600">
          Acceso validado para {session?.user?.email ?? "usuario autenticado"}. Desde aquí podrás gestionar
          contenidos y operaciones del portal.
        </p>
      </div>
    </main>
  );
}
