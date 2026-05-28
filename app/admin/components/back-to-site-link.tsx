"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function BackToSiteLink() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        setLoading(true);
        router.push("/");
      }}
      disabled={loading}
      className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-800 disabled:opacity-70"
    >
      {loading ? (
        <>
          <Loader2 size={13} className="animate-spin" />
          Cargando…
        </>
      ) : (
        "Volver al sitio público"
      )}
    </button>
  );
}
