import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2" aria-label="Glamora home">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mulberry-600 font-display text-lg font-semibold text-white">G</span>
      <span className={`font-display text-2xl font-semibold ${light ? "text-white" : "text-plum-950"}`}>Glamora</span>
    </Link>
  );
}
