"use client";

import { useState } from "react";

export default function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];
  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-md bg-beige">
        {main && <img src={main} alt={name} className="h-full w-full object-cover" />}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`h-20 w-20 overflow-hidden rounded-md border-2 transition-colors ${
                i === active ? "border-brown" : "border-transparent opacity-70 hover:opacity-100"
              }`}
              aria-label={`${i + 1}번째 이미지 보기`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
