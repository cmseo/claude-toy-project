"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function TennisBallButton() {
  const router = useRouter();
  const [isZooming, setIsZooming] = useState(false);

  const handleClick = () => {
    setIsZooming(true);
    setTimeout(() => {
      router.push("/playbook");
    }, 700);
  };

  return (
    <button
      onClick={handleClick}
      aria-label="시작하기"
      className={`group relative cursor-pointer transition-transform duration-700 ease-in-out ${
        isZooming ? "scale-[20] opacity-80" : "hover:scale-110 active:scale-95"
      }`}
    >
      {/* Tennis ball SVG */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <circle cx="60" cy="60" r="56" fill="#c8e620" />
        <circle cx="60" cy="60" r="56" fill="url(#ballGradient)" />
        <circle cx="60" cy="60" r="56" fill="url(#feltTexture)" opacity="0.3" />
        {/* Seam curve - left */}
        <path
          d="M 38 12 C 20 35, 20 85, 38 108"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        {/* Seam curve - right */}
        <path
          d="M 82 12 C 100 35, 100 85, 82 108"
          stroke="white"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <defs>
          <radialGradient id="ballGradient" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#e8ff5a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#9ab800" stopOpacity="0.4" />
          </radialGradient>
          <radialGradient id="feltTexture" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>
      {!isZooming && (
        <span className="absolute -bottom-2 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-black/10 blur-sm group-hover:w-14" />
      )}
    </button>
  );
}
