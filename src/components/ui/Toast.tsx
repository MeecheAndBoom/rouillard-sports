"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Toast = {
  id: string;
  message: string;
  type?: "success" | "info" | "error";
  timeout?: number;
};

type ToastContextValue = {
  show: (message: string, opts?: Partial<Omit<Toast, "id" | "message">>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const ICONS: Record<NonNullable<Toast["type"]>, string> = {
  success: "fa-check",
  info: "fa-circle-info",
  error: "fa-triangle-exclamation",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const show = useCallback(
    (message: string, opts: Partial<Omit<Toast, "id" | "message">> = {}) => {
      const id = String(++idRef.current);
      const toast: Toast = {
        id,
        message,
        type: opts.type ?? "success",
        timeout: opts.timeout ?? 3200,
      };
      setToasts((prev) => [...prev, toast]);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-[76px] z-[60] flex flex-col items-center gap-2 px-4"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  useEffect(() => {
    const timeout = toast.timeout ?? 3200;
    if (timeout > 0) {
      const id = setTimeout(onDismiss, timeout);
      return () => clearTimeout(id);
    }
  }, [toast.timeout, onDismiss]);

  const tone =
    toast.type === "error"
      ? "border-danger/50 text-danger"
      : toast.type === "info"
        ? "border-line text-paper"
        : "border-gold/60 text-paper";

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-[440px] items-center gap-3 border ${tone} bg-panel px-4 py-3 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.9)]`}
    >
      <span
        className={`grid h-6 w-6 shrink-0 place-items-center ${
          toast.type === "error" ? "bg-danger text-pit" : "bg-gold text-gold-ink"
        }`}
      >
        <i
          className={`fa-solid ${ICONS[toast.type ?? "success"]} text-[11px]`}
          aria-hidden="true"
        />
      </span>
      <p className="flex-1 text-[13.5px] leading-[1.4] text-paper">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fermer"
        className="grid h-6 w-6 shrink-0 place-items-center text-muted transition-colors hover:text-paper"
      >
        <i className="fa-solid fa-xmark text-[11px]" aria-hidden="true" />
      </button>
    </div>
  );
}
