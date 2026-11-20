"use client";
import Link from "next/link";
import { ArrowRight, CalendarCheck, CreditCard, Send } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { dashboardPath } from "@/lib/utils";
import { useAsync } from "@/lib/hooks";
import { CATEGORY_BLURBS, HERO_IMAGE } from "@/lib/constants";
import type { Service } from "@/lib/types";
import { ServiceCard, ServiceCardSkeleton } from "@/components/ui/ServiceCard";
import { ErrorState, EmptyState } from "@/components/ui/States";

export default function HomePage() {
  const { user } = useAuth();
  const dashboardHref = user ? dashboardPath(user.role) : "/sign-up";
  const featured = useAsync(() => api<{ services: Service[] }>("/services", { auth: false, query: { limit: 6, sort: "newest" } }), []);
  const categories = useAsync(() => api<{ categories: { name: string; count: number }[] }>("/services/categories", { auth: false }), []);

  return (
    <>
      {/* Banner */}
      <section
        className="relative isolate overflow-hidden bg-plum-950"
        style={{ backgroundImage: `linear-gradient(90deg, rgba(31,18,38,0.92) 0%, rgba(31,18,38,0.7) 55%, rgba(31,18,38,0.35) 100%), url(${HERO_IMAGE})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="container-page py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <h1 className="font-display text-4xl font-semibold leading-[1.1] text-white sm:text-5xl lg:text-6xl">
              Your next hair, skin and spa visit, booked in a minute
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-plum-200">
              Pick a service, choose a time that suits you and we will confirm your appointment. You only pay once your booking is confirmed.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services" className="btn-primary px-6 py-3 text-base">
                Explore Salon Services
              </Link>
              <Link href={dashboardHref} className="btn bg-white/10 px-6 py-3 text-base text-white ring-1 ring-inset ring-white/30 hover:bg-white/20">
                {user ? "Go to my dashboard" : "Create an account"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured services */}
      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold">Featured salon services</h2>
            <p className="mt-2 text-plum-500">A few of the treatments our clients book most.</p>
          </div>
          <Link href="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-mulberry-600 hover:text-mulberry-700">
            View all services <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8">
          {featured.loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : featured.error ? (
            <ErrorState message={featured.error} onRetry={() => featured.reload()} />
          ) : featured.data?.services.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.data.services.map((s) => (
                <ServiceCard key={s._id} service={s} />
              ))}
            </div>
          ) : (
            <EmptyState title="No services yet" message="Our menu is being updated. Please check back soon." />
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-plum-50 py-16">
        <div className="container-page">
          <h2 className="text-3xl font-semibold">Shop the menu by category</h2>
          <p className="mt-2 text-plum-500">Know what you are after? Jump straight to it.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.loading
              ? Array.from({ length: 7 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-plum-100" />)
              : (categories.data?.categories || []).map((c) => (
                  <Link
                    key={c.name}
                    href={`/services?category=${encodeURIComponent(c.name)}`}
                    className="card group flex flex-col justify-between p-5 transition-colors hover:border-mulberry-200"
                  >
                    <div>
                      <h3 className="text-lg font-semibold group-hover:text-mulberry-700">{c.name}</h3>
                      <p className="mt-1 text-sm text-plum-500">{CATEGORY_BLURBS[c.name]}</p>
                    </div>
                    <p className="mt-4 text-xs font-semibold text-mulberry-600">
                      {c.count} {c.count === 1 ? "service" : "services"}
                    </p>
                  </Link>
                ))}
          </div>
          {categories.error && <div className="mt-4"><ErrorState message={categories.error} onRetry={() => categories.reload()} /></div>}
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16">
        <h2 className="text-3xl font-semibold">How booking works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            { Icon: Send, title: "Request a time", text: "Choose a service, a date and one of our open time slots. Add a note if you have special requests." },
            { Icon: CalendarCheck, title: "We confirm it", text: "The salon reviews your request and confirms it. You can follow the status in your dashboard." },
            { Icon: CreditCard, title: "Pay securely", text: "Once confirmed, pay online with Stripe from your appointments page. Cards are never stored by us." },
          ].map(({ Icon, title, text }, i) => (
            <li key={title} className="card p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mulberry-50 text-mulberry-600">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-plum-500">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-plum-500">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-page pb-4">
        <div className="rounded-2xl bg-mulberry-700 px-6 py-12 text-center sm:px-12">
          <h2 className="text-3xl font-semibold text-white">Ready for a fresh look?</h2>
          <p className="mx-auto mt-3 max-w-lg text-mulberry-100">
            {user ? "Browse our services and send your next appointment request." : "Create a free account and send your first appointment request today."}
          </p>
          <Link href={user ? "/services" : "/sign-up"} className="btn mt-6 bg-white px-6 py-3 text-mulberry-700 hover:bg-mulberry-50">
            {user ? "Book a service" : "Get started"}
          </Link>
        </div>
      </section>
    </>
  );
}
