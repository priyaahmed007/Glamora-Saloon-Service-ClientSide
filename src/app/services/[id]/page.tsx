"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, CalendarDays, Clock, Tag } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import { useAuth } from "@/context/AuthContext";
import { TIME_SLOTS } from "@/lib/constants";
import type { Service } from "@/lib/types";
import { formatDuration, formatPrice, todayISO } from "@/lib/utils";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { PageLoader, Spinner } from "@/components/ui/Spinner";
import { ServiceImage } from "@/components/ui/ServiceImage";

function Details() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { data, loading, error } = useAsync(() => api<{ service: Service }>(`/services/${id}`), [id]);

  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [message, setMessage] = useState("");
  const [booked, setBooked] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadSlots = async (d: string) => {
    if (!d) return;
    setSlotsLoading(true);
    try {
      const res = await api<{ slots: string[] }>("/appointments/booked-slots", { query: { serviceId: id, date: d } });
      setBooked(res.slots);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    setSlot("");
    setBooked([]);
    if (date && user?.role === "customer") loadSlots(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  if (loading) return <PageLoader label="Loading service..." />;
  if (error || !data) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-semibold">Service unavailable</h1>
        <p className="mt-2 max-w-md text-plum-500">{error || "We could not find this service."}</p>
        <Link href="/services" className="btn-primary mt-6">Browse services</Link>
      </div>
    );
  }

  const service = data.service;
  const isCustomer = user?.role === "customer";
  const isActive = service.status === "active";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return toast.error("Please choose an appointment date.");
    if (!slot) return toast.error("Please choose a time slot.");
    setSubmitting(true);
    try {
      const res = await api<{ message: string }>("/appointments", { method: "POST", body: { serviceId: service._id, appointmentDate: date, timeSlot: slot, message } });
      toast.success(res.message);
      router.push("/dashboard/customer/appointments");
    } catch (err) {
      const e2 = err as ApiError;
      toast.error(e2.message);
      if (e2.code === "SLOT_CONFLICT") {
        setSlot("");
        loadSlots(date);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-10">
      <Link href="/services" className="inline-flex items-center gap-1 text-sm font-medium text-plum-500 hover:text-mulberry-700">
        <ArrowLeft className="h-4 w-4" /> Back to services
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <ServiceImage src={service.image} alt={service.serviceName} className="h-72 w-full rounded-2xl sm:h-96" />

        <div>
          <p className="text-sm font-semibold text-mulberry-600">{service.category}</p>
          <h1 className="mt-1 text-4xl font-semibold">{service.serviceName}</h1>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-plum-700">
            <span className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-mulberry-600" /> <strong className="text-xl">{formatPrice(service.price)}</strong></span>
            <span className="inline-flex items-center gap-2"><Clock className="h-4 w-4 text-mulberry-600" /> {formatDuration(service.duration)}</span>
          </div>
          <p className="mt-5 whitespace-pre-line leading-relaxed text-plum-700">{service.description}</p>

          <div className="mt-8">
            {!isActive ? (
              <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">This service is currently inactive and cannot be booked.</p>
            ) : !isCustomer ? (
              <p className="rounded-lg bg-plum-50 p-4 text-sm text-plum-700">You are signed in as an admin. Only customer accounts can request appointments.</p>
            ) : !showForm ? (
              <button className="btn-primary px-6 py-3 text-base" onClick={() => setShowForm(true)}>
                <CalendarDays className="h-5 w-5" /> Book Appointment
              </button>
            ) : (
              <form onSubmit={submit} className="card space-y-5 p-5" noValidate>
                <h2 className="text-xl font-semibold">Request an appointment</h2>
                <div>
                  <label htmlFor="date" className="label">Appointment date</label>
                  <input id="date" type="date" className="input" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>

                <div>
                  <span className="label">Available time slots</span>
                  {!date ? (
                    <p className="text-sm text-plum-500">Pick a date to see open slots.</p>
                  ) : slotsLoading ? (
                    <p className="flex items-center gap-2 text-sm text-plum-500"><Spinner className="h-4 w-4" /> Checking availability...</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {TIME_SLOTS.map((t) => {
                        const taken = booked.includes(t);
                        return (
                          <button
                            type="button"
                            key={t}
                            disabled={taken}
                            onClick={() => setSlot(t)}
                            aria-pressed={slot === t}
                            className={`rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${
                              taken ? "cursor-not-allowed border-plum-100 bg-plum-50 text-plum-300 line-through" : slot === t ? "border-mulberry-600 bg-mulberry-600 text-white" : "border-plum-200 bg-white hover:border-mulberry-400"
                            }`}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="label">Additional message (optional)</label>
                  <textarea id="message" rows={3} maxLength={500} className="input" placeholder="Anything we should know?" value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting && <Spinner className="h-4 w-4" />} {submitting ? "Sending request..." : "Send request"}
                  </button>
                  <button type="button" className="btn-outline" onClick={() => setShowForm(false)} disabled={submitting}>Cancel</button>
                </div>
                <p className="text-xs text-plum-500">Your request starts as pending. You can pay after the salon confirms it.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetailsPage() {
  return (
    <AuthGuard>
      <Details />
    </AuthGuard>
  );
}
