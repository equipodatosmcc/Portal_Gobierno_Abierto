import Link from "next/link";

export function SkipLink() {
  return (
    <Link
      href="#main-content"
      className="sr-only z-[100] rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      Saltar al contenido principal
    </Link>
  );
}
