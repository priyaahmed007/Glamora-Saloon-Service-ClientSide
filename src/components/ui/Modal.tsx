"use client";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { Spinner } from "./Spinner";

export function Modal({ open, title, onClose, children, wide = false }: { open: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-plum-950/50 p-0 sm:items-center sm:p-4" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl ${wide ? "sm:max-w-2xl" : "sm:max-w-md"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-plum-500 hover:bg-plum-50" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} title={title} onClose={loading ? () => {} : onClose}>
      <p className="text-sm text-plum-500">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-outline" onClick={onClose} disabled={loading}>
          Keep it
        </button>
        <button className={danger ? "btn-danger" : "btn-primary"} onClick={onConfirm} disabled={loading}>
          {loading && <Spinner className="h-4 w-4" />} {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
