"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/utils";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { Spinner } from "@/components/ui/Spinner";

interface Payment {
  status: "paid" | "failed" | "processing";
  amount?: number;
  currency?: string;
  serviceName?: string;
  appointmentDate?: string;
  timeSlot?: string;
}

function Success() {
  const sessionId = useSearchParams().get("session_id");
  const [payment, setPayment] = useState<Payment | null>(null);
  const [gaveUp, setGaveUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tries = useRef(0);

  // The webhook is what marks the payment as paid. We only poll until it has been recorded.
  useEffect(() => {
    if (!sessionId) return;
    let stop = false;
    const poll = async () => {
      try {
        const res = await api<{ payment: Payment }>(`/payments/session/${encodeURIComponent(sessionId)}`);
        if (stop) return;
        setPayment(res.payment);
        if (res.payment.status === "processing") {
          tries.current += 1;
          if (tries.current >= 12) return setGaveUp(true);
          setTimeout(poll, 2500);
        }
      } catch (err: any) {
        if (!stop) setError(err.message);
      }
    };
    poll();
    return () => {
      stop = true;
    };
  }, [sessionId]);

  const paid = payment?.status === "paid";
  const failed = payment?.status === "failed";

  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8 text-center">
        {!sessionId || error ? (
          <>
            <XCircle className="mx-auto h-14 w-14 text-red-500" />
            <h1 className="mt-4 text-2xl font-semibold">We couldn&apos;t verify this payment</h1>
            <p className="mt-2 text-sm text-plum-500">{error || "No payment session was found."}</p>
          </>
        ) : paid ? (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-sage-600" />
            <h1 className="mt-4 text-2xl font-semibold">Payment confirmed</h1>
            <p className="mt-2 text-sm text-plum-500">Thank you! Your appointment is paid and booked.</p>
            <dl className="mt-6 space-y-2 rounded-lg bg-plum-50 p-4 text-left text-sm">
              <div className="flex justify-between"><dt className="text-plum-500">Service</dt><dd className="font-medium">{payment?.serviceName}</dd></div>
              <div className="flex justify-between"><dt className="text-plum-500">When</dt><dd className="font-medium">{formatDate(payment?.appointmentDate)}, {payment?.timeSlot}</dd></div>
              <div className="flex justify-between"><dt className="text-plum-500">Amount paid</dt><dd className="font-medium">{formatPrice(payment?.amount || 0, payment?.currency)}</dd></div>
            </dl>
          </>
        ) : failed ? (
          <>
            <XCircle className="mx-auto h-14 w-14 text-red-500" />
            <h1 className="mt-4 text-2xl font-semibold">Payment failed</h1>
            <p className="mt-2 text-sm text-plum-500">Your payment could not be completed. You have not been charged. Please try again from your appointments.</p>
          </>
        ) : gaveUp ? (
          <>
            <Clock className="mx-auto h-14 w-14 text-amber-600" />
            <h1 className="mt-4 text-2xl font-semibold">Still processing</h1>
            <p className="mt-2 text-sm text-plum-500">Stripe has not confirmed your payment yet. Check My Appointments in a minute - the status will change to Paid automatically.</p>
          </>
        ) : (
          <>
            <Spinner className="mx-auto h-12 w-12 text-mulberry-600" />
            <h1 className="mt-4 text-2xl font-semibold">Confirming your payment</h1>
            <p className="mt-2 text-sm text-plum-500">Waiting for Stripe&apos;s confirmation. This usually takes a few seconds.</p>
          </>
        )}
        <Link href="/dashboard/customer/appointments" className="btn-primary mt-6">Go to my appointments</Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <AuthGuard roles={["customer"]}>
      <Suspense fallback={null}>
        <Success />
      </Suspense>
    </AuthGuard>
  );
}
