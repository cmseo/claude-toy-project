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
    }, 750);
  };

  return (
    <button
      onClick={handleClick}
      aria-label="시작하기"
      className={`group relative transition-all ease-[cubic-bezier(0.28,0.84,0.42,1)] ${
        isZooming
          ? "animate-[ballHit_0.8s_cubic-bezier(0.16,1,0.3,1)_forwards]"
          : "animate-[ballBounce_2s_ease-in-out_infinite] duration-300 hover:brightness-110 active:scale-90"
      }`}
      style={{ cursor: "inherit" }}
    >
      <svg
        width="70"
        height="70"
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="ball-title"
        className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.3)]"
      >
        <title id="ball-title">테니스 공 - 클릭하여 시작</title>
        <defs>
          {/* Main ball gradient - 3D depth */}
          <radialGradient id="ballBase" cx="38%" cy="32%" r="65%" fx="35%" fy="30%">
            <stop offset="0%" stopColor="#e4ff6b" />
            <stop offset="35%" stopColor="#c9e632" />
            <stop offset="70%" stopColor="#a8c41a" />
            <stop offset="100%" stopColor="#7a9900" />
          </radialGradient>
          {/* Highlight on top-left */}
          <radialGradient id="ballHighlight" cx="30%" cy="25%" r="30%">
            <stop offset="0%" stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          {/* Bottom shadow gradient */}
          <radialGradient id="ballShadow" cx="60%" cy="75%" r="40%">
            <stop offset="0%" stopColor="#4a6600" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#4a6600" stopOpacity="0" />
          </radialGradient>
          {/* Clip path to constrain felt texture within ball */}
          <clipPath id="ballClip">
            <circle cx="70" cy="70" r="62" />
          </clipPath>
          {/* Outer glow for interactivity hint */}
        </defs>

        {/* Ball body */}
        <g clipPath="url(#ballClip)">
          <circle cx="70" cy="70" r="62" fill="url(#ballBase)" />
          {/* Felt texture - subtle speckle pattern */}
          <circle cx="70" cy="70" r="62" fill="#b8d416" opacity="0.15" />
        </g>
        {/* 3D shading layer */}
        <circle cx="70" cy="70" r="62" fill="url(#ballShadow)" />
        {/* Top highlight */}
        <circle cx="70" cy="70" r="62" fill="url(#ballHighlight)" />

        {/* Seam curves - realistic tennis ball pattern */}
        <path
          d="M 40 14 C 22 30, 18 55, 22 70 C 26 85, 32 105, 42 126"
          stroke="white"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M 100 14 C 118 30, 122 55, 118 70 C 114 85, 108 105, 98 126"
          stroke="white"
          strokeWidth="2.8"
          fill="none"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Seam detail - subtle inner lines */}
        <path
          d="M 41 16 C 24 31, 20 55, 24 70 C 28 85, 33 104, 43 124"
          stroke="rgba(150,180,50,0.5)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 99 16 C 116 31, 120 55, 116 70 C 112 85, 107 104, 97 124"
          stroke="rgba(150,180,50,0.5)"
          strokeWidth="1.2"
          fill="none"
          strokeLinecap="round"
        />
        {/* Rim light for depth */}
        <circle
          cx="70"
          cy="70"
          r="61"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="2"
        />
      </svg>

      {/* Ground shadow with bounce sync */}
      {!isZooming && (
        <span className="absolute -bottom-4 left-1/2 h-3 w-20 -translate-x-1/2 animate-[shadowPulse_2s_cubic-bezier(0.28,0.84,0.42,1)_infinite] rounded-full bg-black/20 blur-md" />
      )}
    </button>
  );
}

