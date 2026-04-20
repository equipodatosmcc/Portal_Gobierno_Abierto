"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { updateCitizenMessageStatusAction } from "@/actions/citizen";
import type { findManyCitizenMessages } from "@/lib/services/citizen";

type Message = Awaited<ReturnType<typeof findManyCitizenMessages>>[number];

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
});

const TYPE_LABELS: Record<string, string> = {
  nuevo_dataset: "Nuevo dataset",
  actualizar_dataset: "Actualizar dataset",
  reclamo: "Reclamo",
  sugerencia: "Sugerencia",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700",
  read: "inline-flex rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700",
  resolved: "inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  read: "Leído",
  resolved: "Resuelto",
};

export function MessagesTable({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalMounted, setIsModalMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openModal = useCallback((message: Message) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setSelectedMessage(message);
    setIsModalMounted(true);
    requestAnimationFrame(() => setIsModalOpen(true));
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    closeTimeoutRef.current = setTimeout(() => {
      setIsModalMounted(false);
      setSelectedMessage(null);
      closeTimeoutRef.current = null;
    }, 180);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isModalMounted) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, isModalMounted]);

  function handleToggleStatus() {
    if (!selectedMessage) return;
    const newStatus = selectedMessage.status === "resolved" ? "pending" : "resolved";
    const optimisticMessage = { ...selectedMessage, status: newStatus };
    setSelectedMessage(optimisticMessage);

    startTransition(async () => {
      await updateCitizenMessageStatusAction(selectedMessage.id, newStatus as "pending" | "resolved");
      router.refresh();
    });
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Estado</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Tipo</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Asunto</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Remitente</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Todavía no hay mensajes recibidos.
                  </td>
                </tr>
              ) : (
                messages.map((item) => (
                  <tr key={item.id} className="align-middle">
                    <td className="px-4 py-3">
                      <span className={STATUS_BADGE[item.status] ?? STATUS_BADGE["pending"]}>
                        {STATUS_LABELS[item.status] ?? item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {dateFormatter.format(item.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {TYPE_LABELS[item.type] ?? item.type}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">
                      {item.subject ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.email}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openModal(item)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalMounted && selectedMessage ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8 transition-opacity duration-200 ${
            isModalOpen ? "opacity-100" : "opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="message-modal-title"
          onClick={closeModal}
        >
          <div
            className={`w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl max-h-[90vh] overflow-y-auto transition-all duration-200 ${
              isModalOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 id="message-modal-title" className="text-lg font-semibold text-slate-900">
                Detalle del mensaje
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Estado + toggle */}
              <div className="flex flex-wrap items-center gap-3">
                <span className={STATUS_BADGE[selectedMessage.status] ?? STATUS_BADGE["pending"]}>
                  {STATUS_LABELS[selectedMessage.status] ?? selectedMessage.status}
                </span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleToggleStatus}
                  className={
                    selectedMessage.status === "resolved"
                      ? "rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      : "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  }
                >
                  {isPending
                    ? "Guardando..."
                    : selectedMessage.status === "resolved"
                      ? "Marcar como pendiente"
                      : "Marcar como resuelto"}
                </button>
              </div>

              {/* Metadata */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <Row label="Tipo" value={TYPE_LABELS[selectedMessage.type] ?? selectedMessage.type} />
                <Row label="Fecha" value={dateFormatter.format(selectedMessage.createdAt)} />
                <Row label="Nombre" value={selectedMessage.name} />
                <Row label="Email" value={selectedMessage.email} />
                {selectedMessage.dataset ? (
                  <Row label="Dataset" value={selectedMessage.dataset} />
                ) : null}
              </div>

              {/* Contenido */}
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Asunto
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {selectedMessage.subject ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Mensaje
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed rounded-xl border border-slate-200 bg-white p-4">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="w-24 shrink-0 font-medium text-slate-500">{label}</span>
      <span className="text-slate-900 break-all">{value}</span>
    </div>
  );
}
