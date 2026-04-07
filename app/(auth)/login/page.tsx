import Image from "next/image";
import { LoginForm } from "./login-form";

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

function sanitizeCallbackUrl(callbackUrl: string | undefined) {
  if (!callbackUrl) return "/admin";
  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) return "/admin";
  return callbackUrl;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = sanitizeCallbackUrl(params.callbackUrl);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dcfce7_0%,#eff6ff_45%,#f8fafc_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-28 top-12 h-64 w-64 rounded-full bg-emerald-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-sky-200/70 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-2xl shadow-slate-900/10 backdrop-blur lg:grid-cols-[1.15fr_1fr]">
        <section className="hidden bg-[linear-gradient(150deg,#0f172a_0%,#115e59_45%,#166534_100%)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase text-white/90">
              Acceso interno municipal
            </div>

            <Image
              src="/LA MUNI - BLANCO.png"
              alt="La Muni"
              width={240}
              height={70}
              className="h-auto w-auto"
              priority
            />

            <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-balance">
              Gobierno Abierto Corrientes
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-emerald-50/90">
              Administrá el panel con seguridad y trazabilidad. Este acceso es exclusivo para personal
              autorizado por la Municipalidad.
            </p>
          </div>

          <div className="flex items-end justify-between gap-4 rounded-2xl border border-white/20 bg-white/10 p-5">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-emerald-100">Transparencia</p>
              <p className="mt-1 text-sm text-white/85">Servicios digitales para una gestión abierta y cercana.</p>
            </div>
            <Image
              src="/LOGO VERTICAL.png"
              alt="Municipalidad de Corrientes"
              width={74}
              height={94}
              className="h-auto w-auto rounded-lg bg-white/90 p-2"
            />
          </div>
        </section>

        <section className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <div className="mb-8 space-y-5 lg:hidden">
            <Image
              src="/LA MUNI.png"
              alt="La Muni"
              width={200}
              height={58}
              className="h-auto w-auto"
              priority
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ingreso al panel</h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Iniciá sesión para administrar contenidos y servicios de Gobierno Abierto.
              </p>
            </div>
          </div>

          <div className="hidden space-y-2 lg:block">
            <p className="text-xs font-semibold tracking-widest uppercase text-sky-700">Ingreso seguro</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Acceso al panel administrativo</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Usá tus credenciales institucionales para continuar.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-inner shadow-slate-900/5 sm:p-6">
            <LoginForm callbackUrl={callbackUrl} />
          </div>
        </section>
      </div>
    </main>
  );
}
