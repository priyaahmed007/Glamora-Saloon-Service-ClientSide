import Link from "next/link";
import { Clock } from "lucide-react";
import type { Service } from "@/lib/types";
import { formatDuration, formatPrice } from "@/lib/utils";
import { ServiceImage } from "./ServiceImage";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <ServiceImage src={service.image} alt={service.serviceName} className="h-48 w-full" />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold text-mulberry-600">{service.category}</p>
        <h3 className="mt-1 text-lg font-semibold leading-snug">{service.serviceName}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-plum-500">{service.description}</p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-lg font-bold text-plum-950">{formatPrice(service.price)}</span>
          <span className="inline-flex items-center gap-1 text-plum-500">
            <Clock className="h-4 w-4" /> {formatDuration(service.duration)}
          </span>
        </div>
        <Link href={`/services/${service._id}`} className="btn-primary mt-4 w-full">
          View Details
        </Link>
      </div>
    </article>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden>
      <div className="h-48 animate-pulse bg-plum-100" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-plum-100" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-plum-100" />
        <div className="h-3 w-full animate-pulse rounded bg-plum-100" />
        <div className="h-10 w-full animate-pulse rounded bg-plum-100" />
      </div>
    </div>
  );
}
