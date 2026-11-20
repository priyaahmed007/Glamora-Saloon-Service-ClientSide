const STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-sage-50 text-sage-700 ring-sage-100",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  unpaid: "bg-plum-100 text-plum-700 ring-plum-200",
  paid: "bg-sage-50 text-sage-700 ring-sage-100",
  failed: "bg-red-50 text-red-700 ring-red-200",
  active: "bg-sage-50 text-sage-700 ring-sage-100",
  inactive: "bg-plum-100 text-plum-500 ring-plum-200",
  blocked: "bg-red-50 text-red-700 ring-red-200",
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${
        STYLES[value] || STYLES.unpaid
      }`}
    >
      {value}
    </span>
  );
}
