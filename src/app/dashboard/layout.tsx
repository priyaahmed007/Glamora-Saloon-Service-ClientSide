"use client";
import { ReactNode } from "react";
import { AuthGuard } from "@/components/ui/AuthGuard";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="container-page py-6 lg:flex lg:gap-8 lg:py-10">
        <Sidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </AuthGuard>
  );
}
