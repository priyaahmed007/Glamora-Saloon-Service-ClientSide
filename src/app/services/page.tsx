"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useAsync, useDebounce } from "@/lib/hooks";
import { CATEGORIES } from "@/lib/constants";
import type { Service } from "@/lib/types";
import { ServiceCard, ServiceCardSkeleton } from "@/components/ui/ServiceCard";
import { EmptyState, ErrorState } from "@/components/ui/States";

const LIMIT = 9;

function Browse() {
  const params = useSearchParams();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(params.get("category") || "");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const q = useDebounce(search.trim(), 400);

  useEffect(() => setPage(1), [q, category, sort]);

  const { data, loading, error, reload } = useAsync(
    () => api<{ services: Service[]; total: number; pages: number }>("/services", { auth: false, query: { q, category, sort, page, limit: LIMIT } }),
    [q, category, sort, page]
  );

  return (
    <div className="container-page py-12">
      <h1 className="text-4xl font-semibold">Browse services</h1>
      <p className="mt-2 text-plum-500">Search by name, filter by category and sort by price.</p>

      <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-plum-300" />
          <input className="input pl-10" placeholder="Search services by name" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search services" />
        </div>
        <select className="input md:w-56" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort services">
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {["", ...CATEGORIES].map((c) => (
          <button
            key={c || "all"}
            onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${category === c ? "bg-mulberry-600 text-white" : "bg-white text-plum-700 ring-1 ring-inset ring-plum-200 hover:bg-plum-50"}`}
          >
            {c || "All categories"}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={() => reload()} />
        ) : data && data.services.length ? (
          <>
            <p className="mb-4 text-sm text-plum-500">
              Showing {data.services.length} of {data.total} services
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.services.map((s) => (
                <ServiceCard key={s._id} service={s} />
              ))}
            </div>
            {data.pages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button className="btn-outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <span className="text-sm text-plum-500">
                  Page {page} of {data.pages}
                </span>
                <button className="btn-outline" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title="No services match your search"
            message="Try a different name or choose another category."
            action={
              <button className="btn-primary" onClick={() => { setSearch(""); setCategory(""); }}>
                Clear filters
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="container-page py-12">Loading services...</div>}>
      <Browse />
    </Suspense>
  );
}
