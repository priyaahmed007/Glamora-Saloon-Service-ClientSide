"use client";
import Link from "next/link";
import { CalendarCheck, CalendarClock, CalendarX2, ClipboardList } from "lucide-react";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { useAuth } from "@/context/AuthContext";
import type { Appointment } from "@/lib/types";
import { formatDate, formatPrice } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { StatusBadge } from "@/components/ui/Badge";
import { PageLoader } from "@/components/ui/Spinner";
import { EmptyState, ErrorState } from "@/components/ui/States";

export default function CustomerOverview() {
  const { user } = useAuth();
  const stats = useAsync(() => api<{ stats: { total: number; pending: number; confirmed: number; cancelled: number } }>("/stats/customer"), []);
  const list = useAsync(() => api<{ appointments: Appointment[] }>("/appointments/my"), []);

  if (stats.loading || list.loading) return <PageLoader label="Loading your dashboard..." />;
  if (stats.error || list.error) return <ErrorState message={stats.error || list.error || ""} onRetry={() => { stats.reload(); list.reload(); }} />;

  const s = stats.data!.stats;
  const recent = list.data!.appointments.slice(0, 5);

  return (
    <>
      <PageHeader title={`Hello, ${user?.name.split(" ")[0]}`} description="Here is a summary of your appointment requests." action={<Link href="/services" className="btn-primary">Book a service</Link>} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total requests" value={s.total} icon={<ClipboardList className="h-6 w-6" />} tone="plum" />
        <StatCard label="Pending" value={s.pending} icon={<CalendarClock className="h-6 w-6" />} tone="amber" />
        <StatCard label="Confirmed" value={s.confirmed} icon={<CalendarCheck className="h-6 w-6" />} tone="sage" />
        <StatCard label="Cancelled" value={s.cancelled} icon={<CalendarX2 className="h-6 w-6" />} tone="red" />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent appointments</h2>
        <Link href="/dashboard/customer/appointments" className="text-sm font-semibold text-mulberry-600">View all</Link>
      </div>
      <div className="mt-4">
        {recent.length === 0 ? (
          <EmptyState title="No appointments yet" message="Choose a service and request your first appointment." action={<Link href="/services" className="btn-primary">Browse services</Link>} />
        ) : (
          <div className="card divide-y divide-plum-100">
            {recent.map((a) => (
              <div key={a._id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{a.service?.serviceName || "Removed service"}</p>
                  <p className="text-sm text-plum-500">{formatDate(a.appointmentDate)} at {a.timeSlot} - {formatPrice(a.servicePrice)}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge value={a.status} />
                  <StatusBadge value={a.paymentStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
