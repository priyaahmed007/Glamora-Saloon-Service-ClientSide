"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dashboardPath } from "@/lib/utils";
import { PageLoader } from "@/components/ui/Spinner";

export default function DashboardIndex() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (user) router.replace(dashboardPath(user.role));
  }, [user, router]);
  return <PageLoader label="Opening your dashboard..." />;
}
