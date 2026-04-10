"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { toggleNewsStatusAction } from "../actions";

type ToggleNewsStatusButtonProps = {
  id: number;
  title: string;
  published: boolean;
};

export function ToggleNewsStatusButton({ id, title, published }: ToggleNewsStatusButtonProps) {
  const nextActionLabel = published ? "Dar de baja" : "Dar de alta";
  const actionLabelLowercase = nextActionLabel.toLowerCase();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isModalMounted, setIsModalMounted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const skipNextConfirmationRef = useRef(false);
  const closeTimeoutRef = useRef<number | null>(null);

  const openConfirmModal = useCallback(() => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    setIsModalMounted(true);
    window.requestAnimationFrame(() => {
      setIsConfirmOpen(true);
    });
  }, []);

  const closeConfirmModal = useCallback(() => {
    setIsConfirmOpen(false);

    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      setIsModalMounted(false);
      closeTimeoutRef.current = null;
    }, 180);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isModalMounted) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeConfirmModal();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeConfirmModal, isModalMounted]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (skipNextConfirmationRef.current) {
      skipNextConfirmationRef.current = false;
      return;
    }

    event.preventDefault();
    openConfirmModal();
  }

  function handleConfirm() {
    skipNextConfirmationRef.current = true;
    closeConfirmModal();
    formRef.current?.requestSubmit();
  }

  return (
    <>
      <form ref={formRef} action={toggleNewsStatusAction} onSubmit={handleSubmit}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className={
            published
              ? "rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
              : "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
          }
        >
          {nextActionLabel}
        </button>
      </form>

      {isModalMounted ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 transition-opacity duration-200 ${
            isConfirmOpen ? "opacity-100" : "opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`toggle-news-title-${id}`}
          onClick={closeConfirmModal}
        >
          <div
            className={`w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl transition-all duration-200 ${
              isConfirmOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id={`toggle-news-title-${id}`} className="text-lg font-semibold text-slate-900">
              Confirmar acción
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              ¿Querés {actionLabelLowercase} la noticia &quot;{title}&quot;?
            </p>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirmModal}
                autoFocus
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={
                  published
                    ? "rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                    : "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                }
              >
                {nextActionLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
