"use client";
import { useState } from "react";

export function Avatar({ src, name, className = "h-9 w-9" }: { src?: string; name?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  if (src && !failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name || "Profile"} onError={() => setFailed(true)} className={`${className} rounded-full object-cover`} />;
  }
  return (
    <span className={`${className} inline-flex shrink-0 items-center justify-center rounded-full bg-mulberry-100 text-xs font-bold text-mulberry-700`}>
      {initials}
    </span>
  );
}
