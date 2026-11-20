"use client";
import Link from "next/link";
import { Clock, Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { SALON } from "@/lib/constants";
import { Logo } from "./Logo";
import { useAuth } from "@/context/AuthContext";

export function Footer() {
  const { user } = useAuth();
  return (
    <footer className="mt-16 bg-plum-950 text-plum-200">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-plum-300">
            A neighbourhood salon for hair, skin, nails and calm. Book your visit online and pay securely once we confirm your time.
          </p>
          <div className="mt-5 flex gap-3">
            {[
              { Icon: Facebook, label: "Facebook" },
              { Icon: Instagram, label: "Instagram" },
              { Icon: Twitter, label: "Twitter" },
              { Icon: Youtube, label: "YouTube" },
            ].map(({ Icon, label }) => (
              <a key={label} href="#" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full bg-plum-900 text-plum-200 hover:bg-mulberry-600 hover:text-white">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-sans text-sm font-semibold text-white">Quick links</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              ["/", "Home"],
              ["/services", "Browse Services"],
              ["/sign-in", "Sign In"],
              ["/sign-up", "Create an account"],
              ["/dashboard", "My Dashboard"],
            ]
              .filter(([href]) => !(user && (href === "/sign-in" || href === "/sign-up")))
              .map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-white">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-sans text-sm font-semibold text-white">Visit us</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mulberry-400" /> {SALON.address}</li>
            <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-mulberry-400" /> {SALON.phone}</li>
            <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-mulberry-400" /> {SALON.email}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-sans text-sm font-semibold text-white">Opening hours</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {SALON.hours.map((h) => (
              <li key={h.days} className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-mulberry-400" />
                <span>
                  {h.days}
                  <br />
                  <span className="text-plum-300">{h.time}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-plum-900 py-5 text-center text-xs text-plum-300">
        &copy; {new Date().getFullYear()} Glamora Salon. All rights reserved.
      </div>
    </footer>
  );
}
