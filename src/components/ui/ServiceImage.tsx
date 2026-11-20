"use client";
import { useState } from "react";
import { Scissors } from "lucide-react";

export function ServiceImage({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-mulberry-100 to-plum-100 text-mulberry-600 ${className}`} aria-label={alt}>
        <Scissors className="h-8 w-8 opacity-60" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
