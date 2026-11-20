"use client";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import type { Transaction } from "@/lib/types";
import { formatDate, formatPrice, shortRef } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/States";

export default function TransactionsPage() {
  const { data, loading, error, reload } = useAsync(() => api<{ transactions: Transaction[] }>("/payments/transactions"), []);

  return (
    <>
      <PageHeader title="Transactions" description="Payments recorded from verified Stripe webhook events. This list is read-only." />
      {loading ? (
        <PageLoader label="Loading transactions..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => reload()} />
      ) : data!.transactions.length === 0 ? (
        <EmptyState title="No transactions yet" message="Payments will appear here once customers pay for confirmed appointments." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="border-b border-plum-100 bg-plum-50/60">
              <tr><th className="th">Customer</th><th className="th">Service</th><th className="th">Appointment date</th><th className="th">Amount</th><th className="th">Currency</th><th className="th">Stripe session</th><th className="th">Status</th><th className="th">Transaction date</th></tr>
            </thead>
            <tbody className="divide-y divide-plum-100">
              {data!.transactions.map((t) => (
                <tr key={t._id}>
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <Avatar src={t.customer?.image} name={t.customer?.name} />
                      <div><p className="font-semibold">{t.customer?.name || "Unknown"}</p><p className="text-xs text-plum-500">{t.customer?.email}</p></div>
                    </div>
                  </td>
                  <td className="td">{t.serviceName || "Removed service"}</td>
                  <td className="td whitespace-nowrap">{formatDate(t.appointmentDate)}{t.timeSlot ? `, ${t.timeSlot}` : ""}</td>
                  <td className="td font-semibold">{formatPrice(t.amount, t.currency)}</td>
                  <td className="td uppercase">{t.currency}</td>
                  <td className="td font-mono text-xs text-plum-500" title={t.stripeSessionId}>{shortRef(t.stripeSessionId)}</td>
                  <td className="td"><StatusBadge value={t.status} /></td>
                  <td className="td whitespace-nowrap text-plum-500">{formatDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
