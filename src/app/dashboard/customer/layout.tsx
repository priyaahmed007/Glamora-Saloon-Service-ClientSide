"use client";
import { ReactNode } from "react";
import { AuthGuard } from "@/components/ui/AuthGuard";

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return <AuthGuard roles={["customer"]}>{children}</AuthGuard>;
}
