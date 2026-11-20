"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CreditCard } from "lucide-react";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import type { Appointment, Transaction } from "@/lib/types";
import { formatDate, formatDuration, formatPrice, shortRef } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmDialog, Modal } from "@/components/ui/Modal";
import { PageLoader, Spinner } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { ServiceImage } from "@/components/ui/ServiceImage";

const FILTERS = ["all", "pending", "confirmed", "cancelled"] as const;

export default function MyAppointmentsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const { data, loading, error, reload } = useAsync(() => api<{ appointments: Appointment[] }>("/appointments/my"), []);
  const payments = useAsync(() => api<{ transactions: Transaction[] }>("/payments/my"), []);

  const [details, setDetails] = useState<Appointment | null>(null);
  const [toCancel, setToCancel] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [payingId, setPayingId] = useState<string | null>(null);

  if (loading) return <PageLoader label="Loading your appointments..." />;
  if (error) return <ErrorState message={error} onRetry={() => reload()} />;

  const all = data!.appointments;
  const rows = filter === "all" ? all : all.filter((a) => a.status === filter);

  const cancel = async () => {
    if (!toCancel) return;
    setCancelling(true);
    try {
      const res = await api<{ message: string }>(`/appointments/${toCancel._id}/cancel`, { method: "PATCH" });
      toast.success(res.message);
      setToCancel(null);
      reload();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const pay = async (a: Appointment) => {
    setPayingId(a._id);
    try {
      const res = await api<{ url: string }>(`/payments/checkout/${a._id}`, { method: "POST" });
      window.location.href = res.url;
    } catch (err: any) {
      toast.error(err.message);
      setPayingId(null);
    }
  };

  return (
    <>
      <PageHeader title="My appointments" description="Track your requests, cancel pending ones and pay for confirmed bookings." />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${filter === f ? "bg-mulberry-600 text-white" : "bg-white text-plum-700 ring-1 ring-inset ring-plum-200 hover:bg-plum-50"}`}>
            {f}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No appointments here" message="Appointments you request will show up in this list." action={<Link href="/services" className="btn-primary">Browse services</Link>} />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-plum-100 bg-plum-50/60">
              <tr>
                <th className="th">Service</th>
                <th className="th">Date &amp; time</th>
                <th className="th">Price</th>
                <th className="th">Status</th>
                <th className="th">Payment</th>
                <th className="th">Requested</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-plum-100">
              {rows.map((a) => (
                <tr key={a._id}>
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <ServiceImage src={a.service?.image} alt={a.service?.serviceName || "Service"} className="h-12 w-12 rounded-lg" />
                      <div>
                        <p className="font-semibold">{a.service?.serviceName || "Removed service"}</p>
                        <p className="text-xs text-plum-500">{a.service?.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td whitespace-nowrap">{formatDate(a.appointmentDate)}<br /><span className="text-plum-500">{a.timeSlot}</span></td>
                  <td className="td font-semibold">{formatPrice(a.servicePrice)}</td>
                  <td className="td"><StatusBadge value={a.status} /></td>
                  <td className="td"><StatusBadge value={a.paymentStatus} /></td>
                  <td className="td whitespace-nowrap text-plum-500">{formatDate(a.createdAt)}</td>
                  <td className="td">
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-outline btn-sm" onClick={() => setDetails(a)}>Details</button>
                      {a.status === "pending" && <button className="btn-outline btn-sm text-red-600" onClick={() => setToCancel(a)}>Cancel</button>}
                      {a.status === "confirmed" && a.paymentStatus === "unpaid" && (
                        <button className="btn-primary btn-sm" onClick={() => pay(a)} disabled={payingId === a._id}>
                          {payingId === a._id ? <Spinner className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
                          {payingId === a._id ? "Redirecting..." : "Pay Now"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mb-4 mt-10 text-xl font-semibold">Payment history</h2>
      {payments.loading ? (
        <PageLoader label="Loading payments..." />
      ) : payments.error ? (
        <ErrorState message={payments.error} onRetry={() => payments.reload()} />
      ) : payments.data!.transactions.length === 0 ? (
        <EmptyState title="No payments yet" message="Paid appointments will be listed here." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-plum-100 bg-plum-50/60">
              <tr><th className="th">Service</th><th className="th">Amount</th><th className="th">Status</th><th className="th">Reference</th><th className="th">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-plum-100">
              {payments.data!.transactions.map((t) => (
                <tr key={t._id}>
                  <td className="td font-medium">{t.serviceName || "Removed service"}</td>
                  <td className="td">{formatPrice(t.amount, t.currency)}</td>
                  <td className="td"><StatusBadge value={t.status} /></td>
                  <td className="td font-mono text-xs text-plum-500">{shortRef(t.stripeSessionId)}</td>
                  <td className="td text-plum-500">{formatDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!details} title="Appointment details" onClose={() => setDetails(null)} wide>
        {details && (
          <div className="space-y-4">
            <ServiceImage src={details.service?.image} alt={details.service?.serviceName || "Service"} className="h-44 w-full rounded-xl" />
            <div>
              <p className="text-xs font-semibold text-mulberry-600">{details.service?.category}</p>
              <h3 className="text-xl font-semibold">{details.service?.serviceName}</h3>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-plum-500">Date</dt><dd className="font-medium">{formatDate(details.appointmentDate)}</dd></div>
              <div><dt className="text-plum-500">Time</dt><dd className="font-medium">{details.timeSlot}</dd></div>
              <div><dt className="text-plum-500">Duration</dt><dd className="font-medium">{formatDuration(details.service?.duration || 0)}</dd></div>
              <div><dt className="text-plum-500">Price</dt><dd className="font-medium">{formatPrice(details.servicePrice)}</dd></div>
              <div><dt className="text-plum-500">Status</dt><dd><StatusBadge value={details.status} /></dd></div>
              <div><dt className="text-plum-500">Payment</dt><dd><StatusBadge value={details.paymentStatus} /></dd></div>
              <div className="col-span-2"><dt className="text-plum-500">Requested on</dt><dd className="font-medium">{formatDate(details.createdAt)}</dd></div>
              <div className="col-span-2"><dt className="text-plum-500">Your message</dt><dd className="font-medium">{details.message || "No message"}</dd></div>
            </dl>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toCancel}
        title="Cancel this request?"
        message="Your pending appointment request will be cancelled and the time slot released."
        confirmLabel="Cancel request"
        danger
        loading={cancelling}
        onConfirm={cancel}
        onClose={() => setToCancel(null)}
      />
    </>
  );
}
