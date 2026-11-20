"use client";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAsync } from "@/lib/hooks";
import type { Service } from "@/lib/types";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ServiceForm } from "@/components/dashboard/ServiceForm";
import { PageLoader } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/States";

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, reload } = useAsync(() => api<{ service: Service }>(`/services/${id}`), [id]);

  if (loading) return <PageLoader label="Loading service..." />;
  if (error || !data) return <ErrorState message={error || "Service not found."} onRetry={() => reload()} />;

  return (
    <>
      <PageHeader title="Update service" description={data.service.serviceName} />
      <ServiceForm initial={data.service} />
    </>
  );
}
