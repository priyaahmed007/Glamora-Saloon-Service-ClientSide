"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dashboardPath } from "@/lib/utils";
import { PageLoader } from "@/components/ui/Spinner";

// Landing page after Google sign-in: sends the user to the dashboard that matches their role.
export default function AuthRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? dashboardPath(user.role) : "/sign-in");
  }, [user, loading, router]);

  return <PageLoader label="Signing you in..." />;
}
