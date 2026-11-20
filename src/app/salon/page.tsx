"use client";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { SALON } from "@/lib/constants";
import { AuthGuard } from "@/components/ui/AuthGuard";

export default function SalonPage() {
  return (
    <AuthGuard>
      <div className="container-page py-12">
        <h1 className="text-4xl font-semibold">About Glamora</h1>
        <p className="mt-3 max-w-2xl text-plum-700">
          Glamora is a small, friendly salon in Banani. Our stylists, skin therapists and nail artists focus on clear consultations, clean tools and results you can maintain at home.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="card p-6">
            <h2 className="text-xl font-semibold">Find us</h2>
            <ul className="mt-4 space-y-3 text-plum-700">
              <li className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 text-mulberry-600" /> {SALON.address}</li>
              <li className="flex gap-3"><Phone className="mt-0.5 h-5 w-5 text-mulberry-600" /> {SALON.phone}</li>
              <li className="flex gap-3"><Mail className="mt-0.5 h-5 w-5 text-mulberry-600" /> {SALON.email}</li>
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold">Opening hours</h2>
            <ul className="mt-4 space-y-3 text-plum-700">
              {SALON.hours.map((h) => (
                <li key={h.days} className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 text-mulberry-600" />
                  <span>{h.days}: <strong>{h.time}</strong></span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <Link href="/services" className="btn-primary">Choose a service to book</Link>
        </div>
      </div>
    </AuthGuard>
  );
}
