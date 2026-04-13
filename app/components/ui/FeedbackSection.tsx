"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  MessageSquarePlus,
  RefreshCw,
  Send,
} from "lucide-react";
import { Container } from "@/app/components/ui/Container";

type RequestType = "nuevo_dataset" | "actualizar_dataset" | "reclamo" | "sugerencia";

type FeedbackForm = {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  dataset: string;
};

const requestTypes = [
  {
    value: "nuevo_dataset" as const,
    label: "Solicitar nuevo dataset",
    icon: MessageSquarePlus,
    description: "Pide la publicacion de un conjunto de datos que aun no esta disponible.",
  },
  {
    value: "actualizar_dataset" as const,
    label: "Actualizar dataset existente",
    icon: RefreshCw,
    description: "Solicita actualizar un dataset con datos desactualizados.",
  },
  {
    value: "reclamo" as const,
    label: "Reclamo o error en datos",
    icon: AlertTriangle,
    description: "Reporta un error, inconsistencia o problema en un dataset publicado.",
  },
  {
    value: "sugerencia" as const,
    label: "Sugerencia o idea",
    icon: Lightbulb,
    description: "Comparte ideas para mejorar el portal o las visualizaciones.",
  },
];

const initialForm: FeedbackForm = {
  nombre: "",
  email: "",
  asunto: "",
  mensaje: "",
  dataset: "",
};

export function FeedbackSection() {
  const [selectedType, setSelectedType] = useState<RequestType | "">("");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FeedbackForm>(initialForm);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedType || !form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      return;
    }

    setSubmitted(true);

    timeoutRef.current = setTimeout(() => {
      setSubmitted(false);
      setSelectedType("");
      setForm(initialForm);
    }, 3500);
  };

  return (
    <section id="feedback" className="bg-background py-24">
      <Container className="max-w-4xl">
        <div className="mb-16 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">Tu opinion importa</p>
          <h2 className="mb-4 font-heading text-4xl text-foreground md:text-5xl">Solicitudes y Feedback</h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Ayudanos a mejorar el portal. Puedes pedir nuevos datasets, solicitar actualizaciones,
            reportar errores o compartir ideas.
          </p>
        </div>

        {submitted ? (
          <div className="animate-in py-16 text-center fade-in" aria-live="polite">
            <CheckCircle2 className="mx-auto mb-4 text-primary" size={56} aria-hidden="true" />
            <h3 className="mb-2 font-heading text-2xl text-foreground">Solicitud enviada</h3>
            <p className="text-muted-foreground">Recibimos tu mensaje. Te responderemos a la brevedad.</p>
          </div>
        ) : (
          <>
            <div className="mb-10 grid gap-4 sm:grid-cols-2">
              {requestTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  className={`flex items-start gap-4 rounded-xl border p-5 text-left transition-all duration-200 ${
                    selectedType === type.value
                      ? "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
                      : "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                  }`}
                  aria-pressed={selectedType === type.value}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      selectedType === type.value
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <type.icon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{type.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedType ? (
              <form
                onSubmit={handleSubmit}
                className="animate-in slide-in-from-bottom-4 space-y-5 rounded-xl border border-border bg-card p-8"
                noValidate
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fb-nombre" className="mb-1.5 block text-sm font-medium text-foreground">
                      Nombre completo *
                    </label>
                    <input
                      id="fb-nombre"
                      type="text"
                      required
                      maxLength={100}
                      value={form.nombre}
                      onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label htmlFor="fb-email" className="mb-1.5 block text-sm font-medium text-foreground">
                      Correo electronico *
                    </label>
                    <input
                      id="fb-email"
                      type="email"
                      required
                      maxLength={255}
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                {selectedType === "actualizar_dataset" || selectedType === "reclamo" ? (
                  <div>
                    <label htmlFor="fb-dataset" className="mb-1.5 block text-sm font-medium text-foreground">
                      Nombre del dataset
                    </label>
                    <input
                      id="fb-dataset"
                      type="text"
                      maxLength={200}
                      value={form.dataset}
                      onChange={(event) => setForm({ ...form, dataset: event.target.value })}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                      placeholder="Ej: Presupuesto 2026"
                    />
                  </div>
                ) : null}

                <div>
                  <label htmlFor="fb-asunto" className="mb-1.5 block text-sm font-medium text-foreground">
                    Asunto *
                  </label>
                  <input
                    id="fb-asunto"
                    type="text"
                    required
                    maxLength={200}
                    value={form.asunto}
                    onChange={(event) => setForm({ ...form, asunto: event.target.value })}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                    placeholder="Resumen breve de tu solicitud"
                  />
                </div>

                <div>
                  <label htmlFor="fb-mensaje" className="mb-1.5 block text-sm font-medium text-foreground">
                    Mensaje *
                  </label>
                  <textarea
                    id="fb-mensaje"
                    required
                    maxLength={2000}
                    rows={5}
                    value={form.mensaje}
                    onChange={(event) => setForm({ ...form, mensaje: event.target.value })}
                    className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                    placeholder="Describe con detalle tu solicitud..."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-gov-cyan-light"
                >
                  Enviar solicitud <Send size={16} aria-hidden="true" />
                </button>
              </form>
            ) : null}
          </>
        )}
      </Container>
    </section>
  );
}
