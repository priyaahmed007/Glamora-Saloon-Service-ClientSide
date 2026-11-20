import { ReactNode } from "react";

export function StatCard({ label, value, icon, tone = "mulberry" }: { label: string; value: ReactNode; icon: ReactNode; tone?: "mulberry" | "sage" | "amber" | "red" | "plum" }) {
  const tones = {
    mulberry: "bg-mulberry-50 text-mulberry-600",
    sage: "bg-sage-50 text-sage-600",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-600",
    plum: "bg-plum-100 text-plum-700",
  };
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</span>
      <div>
        <p className="text-2xl font-bold text-plum-950">{value}</p>
        <p className="text-sm text-plum-500">{label}</p>
      </div>
    </div>
  );
}
