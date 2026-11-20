"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronDown, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dashboardPath } from "@/lib/utils";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "./Logo";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setDropdown(false);
  }, [pathname]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setDropdown(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const links = user
    ? [
        { href: "/", label: "Home" },
        { href: "/services", label: "Browse Services" },
        { href: "/salon", label: "Salon Details" },
        { href: dashboardPath(user.role), label: "Dashboard" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/services", label: "Browse Services" },
      ];

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const handleLogout = async () => {
    await logout();
    toast.success("You have been signed out.");
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-plum-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive(l.href) ? "bg-mulberry-50 text-mulberry-700" : "text-plum-700 hover:bg-plum-50"}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <div className="h-9 w-32 animate-pulse rounded-lg bg-plum-100" />
          ) : user ? (
            <div className="relative" ref={ref}>
              <button onClick={() => setDropdown((v) => !v)} className="flex items-center gap-2 rounded-full border border-plum-100 py-1 pl-1 pr-3 hover:bg-plum-50" aria-haspopup="menu" aria-expanded={dropdown}>
                <Avatar src={user.image} name={user.name} />
                <span className="max-w-[120px] truncate text-sm font-medium">{user.name.split(" ")[0]}</span>
                <ChevronDown className="h-4 w-4 text-plum-500" />
              </button>
              {dropdown && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl border border-plum-100 bg-white p-2 shadow-soft" role="menu">
                  <div className="border-b border-plum-100 px-3 pb-2 pt-1">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-plum-500">{user.email}</p>
                  </div>
                  <Link href={dashboardPath(user.role)} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-plum-50" role="menuitem">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50" role="menuitem">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="btn-outline">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button className="rounded-lg p-2 hover:bg-plum-50 md:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={menuOpen}>
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-plum-100 bg-white md:hidden">
          <nav className="container-page flex flex-col gap-1 py-3" aria-label="Mobile">
            {links.map((l) => (
              <Link key={l.href + l.label} href={l.href} className={`rounded-lg px-3 py-2.5 text-sm font-medium ${isActive(l.href) ? "bg-mulberry-50 text-mulberry-700" : "text-plum-700"}`}>
                {l.label}
              </Link>
            ))}
            {!loading && user ? (
              <>
                <div className="mt-2 flex items-center gap-3 border-t border-plum-100 px-3 pt-3">
                  <Avatar src={user.image} name={user.name} />
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                </div>
                <button onClick={handleLogout} className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              !loading && (
                <div className="mt-2 grid grid-cols-2 gap-2 border-t border-plum-100 pt-3">
                  <Link href="/sign-in" className="btn-outline">Sign In</Link>
                  <Link href="/sign-up" className="btn-primary">Sign Up</Link>
                </div>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
