"use client";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { AuthGuard } from "@/components/ui/AuthGuard";

export default function PaymentCancelPage() {
  return (
    <AuthGuard roles={["customer"]}>
      <div className="container-page flex min-h-[60vh] items-center justify-center py-12">
        <div className="card w-full max-w-md p-8 text-center">
          <XCircle className="mx-auto h-14 w-14 text-amber-600" />
          <h1 className="mt-4 text-2xl font-semibold">Payment cancelled</h1>
          <p className="mt-2 text-sm text-plum-500">No money was taken. Your appointment is still confirmed and you can pay whenever you are ready.</p>
          <Link href="/dashboard/customer/appointments" className="btn-primary mt-6">Back to my appointments</Link>
        </div>
      </div>
    </AuthGuard>
  );
}
