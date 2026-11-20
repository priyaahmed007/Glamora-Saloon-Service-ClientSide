"use client";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import type { Appointment } from "@/lib/types";
import { formatDate, formatDuration, formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/States";

const FILTERS = ["all", "pending", "confirmed", "cancelled"] as const;

export default function ManageAppointmentsPage() {
  const { data, loading, error, reload } = useAsync(() => api<{ appointments: Appointment[] }>("/appointments"), []);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [search, setSearch] = useState("");
  const [details, setDetails] = useState<Appointment | null>(null);
  const [action, setAction] = useState<{ type: "confirm" | "cancel"; appointment: Appointment } | null>(null);
  const [busy, setBusy] = useState(false);

  const rows = useMemo(() => {
    const s = search.trim().toLowerCase();
    return (data?.appointments || []).filter(
      (a) =>
        (filter === "all" || a.status === filter) &&
        (!s || a.customer?.name?.toLowerCase().includes(s) || a.customer?.email?.toLowerCase().includes(s) || a.service?.serviceName?.toLowerCase().includes(s))
    );
  }, [data, filter, search]);

  if (loading) return <PageLoader label="Loading appointments..." />;
  if (error) return <ErrorState message={error} onRetry={() => reload()} />;

  const run = async () => {
    if (!action) return;
    setBusy(true);
    try {
      const res = await api<{ message: string }>(`/appointments/${action.appointment._id}/${action.type}`, { method: "PATCH" });
      toast.success(res.message);
      setAction(null);
      setDetails(null);
      reload();
    } catch (err: any) {
      toast.error(err.message);
      setAction(null);
      reload();
    } finally {
      setBusy(false);
    }
  };

  const Actions = ({ a }: { a: Appointment }) => (
    <div className="flex flex-wrap gap-2">
      {a.status === "pending" && <button className="btn-primary btn-sm" onClick={() => setAction({ type: "confirm", appointment: a })}>Confirm</button>}
      {(a.status === "pending" || a.status === "confirmed") && <button className="btn-outline btn-sm text-red-600" onClick={() => setAction({ type: "cancel", appointment: a })}>Cancel</button>}
    </div>
  );

  return (
    <>
      <PageHeader title="Manage appointments" description="Review requests, confirm pending ones and cancel when needed." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${filter === f ? "bg-mulberry-600 text-white" : "bg-white text-plum-700 ring-1 ring-inset ring-plum-200 hover:bg-plum-50"}`}>{f}</button>
          ))}
        </div>
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-plum-300" />
          <input className="input pl-10" placeholder="Search customer or service" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search appointments" />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No appointments found" message="Nothing matches the current filter." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-plum-100 bg-plum-50/60">
              <tr><th className="th">Customer</th><th className="th">Service</th><th className="th">Date &amp; time</th><th className="th">Price</th><th className="th">Status</th><th className="th">Payment</th><th className="th">Requested</th><th className="th">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-plum-100">
              {rows.map((a) => (
                <tr key={a._id}>
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <Avatar src={a.customer?.image} name={a.customer?.name} />
                      <div><p className="font-semibold">{a.customer?.name || "Unknown"}</p><p className="text-xs text-plum-500">{a.customer?.email}</p></div>
                    </div>
                  </td>
                  <td className="td">{a.service?.serviceName || "Removed service"}</td>
                  <td className="td whitespace-nowrap">{formatDate(a.appointmentDate)}<br /><span className="text-plum-500">{a.timeSlot}</span></td>
                  <td className="td font-semibold">{formatPrice(a.servicePrice)}</td>
                  <td className="td"><StatusBadge value={a.status} /></td>
                  <td className="td"><StatusBadge value={a.paymentStatus} /></td>
                  <td className="td whitespace-nowrap text-plum-500">{formatDate(a.createdAt)}</td>
                  <td className="td">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-outline btn-sm" onClick={() => setDetails(a)}>Details</button>
                      <Actions a={a} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!details} title="Appointment details" onClose={() => setDetails(null)} wide>
        {details && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-lg bg-plum-50 p-3">
              <Avatar src={details.customer?.image} name={details.customer?.name} className="h-11 w-11" />
              <div className="text-sm">
                <p className="font-semibold">{details.customer?.name}</p>
                <p className="text-plum-500">{details.customer?.email}{details.customer?.phone ? ` - ${details.customer.phone}` : ""}</p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-plum-500">Service</dt><dd className="font-medium">{details.service?.serviceName}</dd></div>
              <div><dt className="text-plum-500">Category</dt><dd className="font-medium">{details.service?.category}</dd></div>
              <div><dt className="text-plum-500">Date</dt><dd className="font-medium">{formatDate(details.appointmentDate)}</dd></div>
              <div><dt className="text-plum-500">Time</dt><dd className="font-medium">{details.timeSlot}</dd></div>
              <div><dt className="text-plum-500">Duration</dt><dd className="font-medium">{formatDuration(details.service?.duration || 0)}</dd></div>
              <div><dt className="text-plum-500">Price</dt><dd className="font-medium">{formatPrice(details.servicePrice)}</dd></div>
              <div><dt className="text-plum-500">Status</dt><dd><StatusBadge value={details.status} /></dd></div>
              <div><dt className="text-plum-500">Payment</dt><dd><StatusBadge value={details.paymentStatus} /></dd></div>
              <div className="col-span-2"><dt className="text-plum-500">Booking request date</dt><dd className="font-medium">{formatDate(details.createdAt)}</dd></div>
              <div className="col-span-2"><dt className="text-plum-500">Customer message</dt><dd className="font-medium">{details.message || "No message provided"}</dd></div>
            </dl>
            <Actions a={details} />
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!action}
        title={action?.type === "confirm" ? "Confirm this appointment?" : "Cancel this appointment?"}
        message={
          action?.type === "confirm"
            ? "The customer will be able to pay for this appointment from their dashboard."
            : action?.appointment.paymentStatus === "paid"
            ? "This appointment is already paid. Cancelling it does not refund the customer automatically - issue the refund in Stripe."
            : "The time slot will be released and the customer will see the appointment as cancelled."
        }
        confirmLabel={action?.type === "confirm" ? "Confirm appointment" : "Cancel appointment"}
        danger={action?.type === "cancel"}
        loading={busy}
        onConfirm={run}
        onClose={() => setAction(null)}
      />
    </>
  );
}
