"use client";
import Link from "next/link";
import { BadgeCheck, CalendarCheck, CalendarClock, ClipboardList, DollarSign, Scissors, Users } from "lucide-react";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import type { Appointment } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/States";

interface Stats { customers: number; activeServices: number; total: number; pending: number; confirmed: number; payments: number; revenue: number }

export default function AdminOverview() {
  const stats = useAsync(() => api<{ stats: Stats }>("/stats/admin"), []);
  const list = useAsync(() => api<{ appointments: Appointment[] }>("/appointments"), []);

  if (stats.loading || list.loading) return <PageLoader label="Loading dashboard..." />;
  if (stats.error || list.error) return <ErrorState message={stats.error || list.error || ""} onRetry={() => { stats.reload(); list.reload(); }} />;

  const s = stats.data!.stats;
  const recent = list.data!.appointments.slice(0, 6);

  return (
    <>
      <PageHeader title="Admin overview" description="A snapshot of salon activity." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Registered customers" value={s.customers} icon={<Users className="h-6 w-6" />} />
        <StatCard label="Active services" value={s.activeServices} icon={<Scissors className="h-6 w-6" />} tone="plum" />
        <StatCard label="Appointment requests" value={s.total} icon={<ClipboardList className="h-6 w-6" />} tone="plum" />
        <StatCard label="Pending appointments" value={s.pending} icon={<CalendarClock className="h-6 w-6" />} tone="amber" />
        <StatCard label="Confirmed appointments" value={s.confirmed} icon={<CalendarCheck className="h-6 w-6" />} tone="sage" />
        <StatCard label="Successful payments" value={s.payments} icon={<BadgeCheck className="h-6 w-6" />} tone="sage" />
      </div>
      <div className="card mt-4 flex items-center gap-4 p-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-50 text-sage-600"><DollarSign className="h-6 w-6" /></span>
        <div>
          <p className="text-2xl font-bold">{formatPrice(s.revenue)}</p>
          <p className="text-sm text-plum-500">Total collected through Stripe</p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Latest appointment requests</h2>
        <Link href="/dashboard/admin/appointments" className="text-sm font-semibold text-mulberry-600">Manage all</Link>
      </div>
      <div className="mt-4">
        {recent.length === 0 ? (
          <EmptyState title="No appointment requests yet" />
        ) : (
          <div className="card divide-y divide-plum-100">
            {recent.map((a) => (
              <div key={a._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{a.customer?.name || "Unknown customer"} - {a.service?.serviceName || "Removed service"}</p>
                  <p className="text-sm text-plum-500">{formatDate(a.appointmentDate)} at {a.timeSlot}</p>
                </div>
                <div className="flex gap-2"><StatusBadge value={a.status} /><StatusBadge value={a.paymentStatus} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
