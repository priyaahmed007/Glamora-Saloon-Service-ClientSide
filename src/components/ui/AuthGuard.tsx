"use client";
import { ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/types";
import { dashboardPath } from "@/lib/utils";
import { PageLoader } from "./Spinner";

export function AuthGuard({ children, roles }: { children: ReactNode; roles?: Role[] }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading || !user) return <PageLoader label="Checking your session..." />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="container-page flex min-h-[50vh] flex-col items-center justify-center text-center">
        <ShieldAlert className="h-12 w-12 text-mulberry-600" />
        <h1 className="mt-4 text-2xl font-semibold">You don&apos;t have access to this page</h1>
        <p className="mt-2 max-w-md text-plum-500">This area is reserved for {roles.join(" / ")} accounts.</p>
        <Link href={dashboardPath(user.role)} className="btn-primary mt-6">
          Go to my dashboard
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
