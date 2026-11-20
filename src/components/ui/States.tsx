import { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-plum-200 bg-white px-6 py-14 text-center">
      <Inbox className="h-10 w-10 text-plum-300" />
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-plum-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 py-12 text-center" role="alert">
      <AlertTriangle className="h-9 w-9 text-red-500" />
      <p className="mt-3 max-w-md text-sm text-red-800">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline mt-4">
          Try again
        </button>
      )}
    </div>
  );
}
