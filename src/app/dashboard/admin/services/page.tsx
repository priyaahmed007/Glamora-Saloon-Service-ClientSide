"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Pencil, Plus, Power, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAsync, useDebounce } from "@/lib/hooks";
import type { Service } from "@/lib/types";
import { formatDuration, formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { ServiceImage } from "@/components/ui/ServiceImage";

export default function ManageServicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const q = useDebounce(search.trim());
  useEffect(() => setPage(1), [q, status, sort]);

  const { data, loading, error, reload } = useAsync(
    () => api<{ services: Service[]; pages: number; total: number }>("/services/admin/all", { query: { q, status, sort, page, limit: 10 } }),
    [q, status, sort, page]
  );

  const [toDelete, setToDelete] = useState<Service | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = async (s: Service) => {
    try {
      const res = await api<{ message: string }>(`/services/${s._id}/status`, { method: "PATCH", body: { status: s.status === "active" ? "inactive" : "active" } });
      toast.success(res.message);
      reload();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      const res = await api<{ message: string }>(`/services/${toDelete._id}`, { method: "DELETE" });
      toast.success(res.message);
      setToDelete(null);
      reload();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Manage services"
        description="Add, update, activate or remove salon services."
        action={<Link href="/dashboard/admin/services/new" className="btn-primary"><Plus className="h-4 w-4" /> Add service</Link>}
      />

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-plum-300" />
          <input className="input pl-10" placeholder="Search by service name" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search services" />
        </div>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {loading ? (
        <PageLoader label="Loading services..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : data!.services.length === 0 ? (
        <EmptyState title="No services found" message="Try another search or add a new service." action={<Link href="/dashboard/admin/services/new" className="btn-primary">Add service</Link>} />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="border-b border-plum-100 bg-plum-50/60">
                <tr><th className="th">Service</th><th className="th">Category</th><th className="th">Price</th><th className="th">Duration</th><th className="th">Status</th><th className="th">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-plum-100">
                {data!.services.map((s) => (
                  <tr key={s._id}>
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <ServiceImage src={s.image} alt={s.serviceName} className="h-12 w-12 rounded-lg" />
                        <span className="font-semibold">{s.serviceName}</span>
                      </div>
                    </td>
                    <td className="td text-plum-500">{s.category}</td>
                    <td className="td font-semibold">{formatPrice(s.price)}</td>
                    <td className="td whitespace-nowrap">{formatDuration(s.duration)}</td>
                    <td className="td"><StatusBadge value={s.status} /></td>
                    <td className="td">
                      <div className="flex gap-2">
                        <Link href={`/dashboard/admin/services/${s._id}/edit`} className="btn-outline btn-sm" aria-label={`Edit ${s.serviceName}`}><Pencil className="h-3.5 w-3.5" /> Edit</Link>
                        <button className="btn-outline btn-sm" onClick={() => toggle(s)}><Power className="h-3.5 w-3.5" /> {s.status === "active" ? "Deactivate" : "Activate"}</button>
                        <button className="btn-outline btn-sm text-red-600" onClick={() => setToDelete(s)} aria-label={`Delete ${s.serviceName}`}><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data!.pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button className="btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
              <span className="text-sm text-plum-500">Page {page} of {data!.pages}</span>
              <button className="btn-outline" disabled={page >= data!.pages} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this service?"
        message={`"${toDelete?.serviceName}" will be removed permanently. Services with pending or confirmed appointments cannot be deleted - deactivate them instead.`}
        confirmLabel="Delete service"
        danger
        loading={busy}
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
