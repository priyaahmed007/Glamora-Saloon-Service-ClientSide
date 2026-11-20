"use client";
import { ReactNode } from "react";
import { AuthGuard } from "@/components/ui/AuthGuard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AuthGuard roles={["admin"]}>{children}</AuthGuard>;
}
