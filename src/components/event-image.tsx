"use client";

import Image from "next/image";
import { useState } from "react";
import { Calendar } from "lucide-react";

interface EventImageProps {
  src: string | null;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export function EventImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
  className = "",
}: EventImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 ${className}`}
      >
        <div className="flex flex-col items-center gap-2 text-white/80">
          <Calendar className="h-10 w-10" />
          <span className="text-xs font-medium uppercase tracking-widest">
            Imagem em breve
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      unoptimized
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
