import { Loader2 } from "lucide-react";

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden />;
}

export function PageLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-plum-500" role="status" aria-live="polite">
      <Spinner className="h-8 w-8 text-mulberry-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
