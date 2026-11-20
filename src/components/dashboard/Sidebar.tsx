"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, CreditCard, LayoutDashboard, Menu, PlusCircle, Scissors, UserCircle, Users, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Avatar } from "@/components/ui/Avatar";

const CUSTOMER_NAV = [
  { href: "/dashboard/customer", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/dashboard/customer/appointments", label: "My Appointments", Icon: CalendarCheck },
  { href: "/dashboard/customer/profile", label: "My Profile", Icon: UserCircle },
];

const ADMIN_NAV = [
  { href: "/dashboard/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/dashboard/admin/services", label: "Manage Services", Icon: Scissors, exact: true },
  { href: "/dashboard/admin/services/new", label: "Add Service", Icon: PlusCircle },
  { href: "/dashboard/admin/appointments", label: "Manage Appointments", Icon: CalendarCheck },
  { href: "/dashboard/admin/users", label: "Manage Users", Icon: Users },
  { href: "/dashboard/admin/transactions", label: "Transactions", Icon: CreditCard },
  { href: "/dashboard/admin/profile", label: "My Profile", Icon: UserCircle },
];

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const nav = user?.role === "admin" ? ADMIN_NAV : CUSTOMER_NAV;
  const active = (item: (typeof nav)[number]) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));

  const links = (
    <nav className="space-y-1" aria-label="Dashboard">
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active(item) ? "bg-mulberry-600 text-white" : "text-plum-700 hover:bg-plum-50"}`}
        >
          <item.Icon className="h-4 w-4" /> {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-plum-100 bg-white p-3 lg:hidden">
        <div className="flex items-center gap-3">
          <Avatar src={user?.image} name={user?.name} />
          <div>
            <p className="text-sm font-semibold leading-tight">{user?.name}</p>
            <p className="text-xs capitalize text-plum-500">{user?.role} dashboard</p>
          </div>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 hover:bg-plum-50" aria-label="Toggle dashboard menu" aria-expanded={open}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && <div className="mb-4 rounded-xl border border-plum-100 bg-white p-3 lg:hidden">{links}</div>}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="card sticky top-24 p-4">
          <div className="mb-4 flex items-center gap-3 border-b border-plum-100 pb-4">
            <Avatar src={user?.image} name={user?.name} className="h-11 w-11" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="text-xs capitalize text-plum-500">{user?.role}</p>
            </div>
          </div>
          {links}
        </div>
      </aside>
    </>
  );
}
