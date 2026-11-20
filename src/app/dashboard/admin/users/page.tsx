"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useAsync, useDebounce } from "@/lib/hooks";
import type { Me } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/States";

interface Summary { total: number; pending: number; confirmed: number; paid: number }

export default function ManageUsersPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const q = useDebounce(search.trim());
  const { data, loading, error, reload } = useAsync(() => api<{ users: Me[] }>("/users", { query: { q, status } }), [q, status]);

  const [view, setView] = useState<{ user: Me; summary: Summary | null } | null>(null);
  const [target, setTarget] = useState<Me | null>(null);
  const [busy, setBusy] = useState(false);

  const open = async (user: Me) => {
    setView({ user, summary: null });
    try {
      const res = await api<{ user: Me; summary: Summary }>(`/users/${user.id}`);
      setView({ user: res.user, summary: res.summary });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const toggleBlock = async () => {
    if (!target) return;
    setBusy(true);
    try {
      const res = await api<{ message: string }>(`/users/${target.id}/${target.isBlocked ? "unblock" : "block"}`, { method: "PATCH" });
      toast.success(res.message);
      setTarget(null);
      setView(null);
      reload();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Manage users" description="View registered customers and block or unblock accounts." />

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-plum-300" />
          <input className="input pl-10" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" />
        </div>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter users">
          <option value="">All customers</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {loading ? (
        <PageLoader label="Loading customers..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : data!.users.length === 0 ? (
        <EmptyState title="No customers found" message="Registered customers will appear here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-plum-100 bg-plum-50/60">
              <tr><th className="th">Customer</th><th className="th">Phone</th><th className="th">Joined</th><th className="th">Status</th><th className="th">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-plum-100">
              {data!.users.map((u) => (
                <tr key={u.id}>
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <Avatar src={u.image} name={u.name} />
                      <div><p className="font-semibold">{u.name}</p><p className="text-xs text-plum-500">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="td text-plum-500">{u.phone || "-"}</td>
                  <td className="td text-plum-500">{formatDate(u.createdAt)}</td>
                  <td className="td"><StatusBadge value={u.isBlocked ? "blocked" : "active"} /></td>
                  <td className="td">
                    <div className="flex gap-2">
                      <button className="btn-outline btn-sm" onClick={() => open(u)}>View</button>
                      <button className={`btn-outline btn-sm ${u.isBlocked ? "" : "text-red-600"}`} onClick={() => setTarget(u)}>{u.isBlocked ? "Unblock" : "Block"}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!view} title="Customer details" onClose={() => setView(null)}>
        {view && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar src={view.user.image} name={view.user.name} className="h-16 w-16" />
              <div>
                <p className="text-lg font-semibold">{view.user.name}</p>
                <p className="text-sm text-plum-500">{view.user.email}</p>
                <div className="mt-1"><StatusBadge value={view.user.isBlocked ? "blocked" : "active"} /></div>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-plum-500">Phone</dt><dd className="font-medium">{view.user.phone || "-"}</dd></div>
              <div><dt className="text-plum-500">Joined</dt><dd className="font-medium">{formatDate(view.user.createdAt)}</dd></div>
              {view.summary ? (
                <>
                  <div><dt className="text-plum-500">Total appointments</dt><dd className="font-medium">{view.summary.total}</dd></div>
                  <div><dt className="text-plum-500">Pending</dt><dd className="font-medium">{view.summary.pending}</dd></div>
                  <div><dt className="text-plum-500">Confirmed</dt><dd className="font-medium">{view.summary.confirmed}</dd></div>
                  <div><dt className="text-plum-500">Successful payments</dt><dd className="font-medium">{view.summary.paid}</dd></div>
                </>
              ) : (
                <div className="col-span-2 text-plum-500">Loading booking summary...</div>
              )}
            </dl>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!target}
        title={target?.isBlocked ? "Unblock this user?" : "Block this user?"}
        message={target?.isBlocked ? `${target?.name} will be able to use the platform again.` : `${target?.name} will be signed out and lose access to protected features until unblocked.`}
        confirmLabel={target?.isBlocked ? "Unblock user" : "Block user"}
        danger={!target?.isBlocked}
        loading={busy}
        onConfirm={toggleBlock}
        onClose={() => setTarget(null)}
      />
    </>
  );
}
