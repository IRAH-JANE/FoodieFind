import {
  CheckCircle,
  Info,
  TriangleAlert,
  X,
  XCircle,
} from "lucide-react";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function iconFor(type: ToastType) {
  if (type === "success") return <CheckCircle size={18} />;
  if (type === "error") return <XCircle size={18} />;
  if (type === "warning") return <TriangleAlert size={18} />;
  return <Info size={18} />;
}

function colorFor(type: ToastType) {
  if (type === "success") return "border-emerald-400/30 bg-emerald-500/15 text-emerald-100";
  if (type === "error") return "border-red-400/30 bg-red-500/15 text-red-100";
  if (type === "warning") return "border-yellow-400/30 bg-yellow-500/15 text-yellow-100";
  return "border-blue-400/30 bg-blue-500/15 text-blue-100";
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function removeToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function showToast(message: string, type: ToastType = "info") {
    const id = crypto.randomUUID();

    setToasts((current) => [
      ...current,
      {
        id,
        type,
        message,
      },
    ]);

    window.setTimeout(() => {
      removeToast(id);
    }, 3500);
  }

  useEffect(() => {
    const originalAlert = window.alert;

    window.alert = (message?: any) => {
      const text = String(message ?? "");
      const lowered = text.toLowerCase();

      const type: ToastType =
        lowered.includes("could not") ||
        lowered.includes("failed") ||
        lowered.includes("error")
          ? "error"
          : "info";

      showToast(text, type);
    };

    return () => {
      window.alert = originalAlert;
    };
  }, []);

  const value = useMemo(() => ({ showToast }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="fixed right-5 top-20 z-[9999] flex w-[min(420px,calc(100vw-2.5rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl ${colorFor(
              toast.type
            )}`}
          >
            <div className="mt-0.5 shrink-0">{iconFor(toast.type)}</div>

            <p className="flex-1 text-sm font-bold leading-6">
              {toast.message}
            </p>

            <button
              onClick={() => removeToast(toast.id)}
              className="rounded-full p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
