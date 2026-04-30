import { TennisBallButton } from "@/components/landing/TennisBallButton";
import { AppPreview } from "@/components/landing/AppPreview";

export default function LandingPage() {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden"
      style={{ cursor: "url('/racket-cursor.svg') 20 12, pointer" }}
    >
      {/* Full-screen clay court SVG background */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Clay base gradient - warm terracotta with depth */}
          <linearGradient id="clayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d4714a" />
            <stop offset="40%" stopColor="#c66033" />
            <stop offset="100%" stopColor="#a34e28" />
          </linearGradient>
          {/* Subtle grain texture */}
          <filter id="clayGrain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="4"
              seed="5"
              result="noise"
            />
            <feColorMatrix
              type="saturate"
              values="0"
              in="noise"
              result="grayNoise"
            />
            <feBlend
              in="SourceGraphic"
              in2="grayNoise"
              mode="overlay"
              result="grain"
            />
            <feComponentTransfer in="grain">
              <feFuncA type="linear" slope="1" />
            </feComponentTransfer>
          </filter>
          {/* Vignette effect for depth */}
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="transparent" stopOpacity="0" />
            <stop offset="100%" stopColor="#2d1a0f" stopOpacity="0.5" />
          </radialGradient>
          {/* Spotlight center glow */}
          <radialGradient id="spotlight" cx="50%" cy="50%" r="35%">
            <stop offset="0%" stopColor="#e8845a" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base clay surface */}
        <rect width="1200" height="800" fill="url(#clayGrad)" filter="url(#clayGrain)" />

        {/* Spotlight in center */}
        <rect width="1200" height="800" fill="url(#spotlight)" />

        {/* Court lines - doubles court outline */}
        <rect
          x="120" y="80" width="960" height="640"
          fill="none" stroke="white" strokeWidth="3" opacity="0.35"
        />
        {/* Singles sidelines */}
        <line x1="200" y1="80" x2="200" y2="720" stroke="white" strokeWidth="2" opacity="0.25" />
        <line x1="1000" y1="80" x2="1000" y2="720" stroke="white" strokeWidth="2" opacity="0.25" />
        {/* Service line */}
        <line x1="200" y1="260" x2="1000" y2="260" stroke="white" strokeWidth="2" opacity="0.2" />
        <line x1="200" y1="540" x2="1000" y2="540" stroke="white" strokeWidth="2" opacity="0.2" />
        {/* Center service line */}
        <line x1="600" y1="260" x2="600" y2="540" stroke="white" strokeWidth="2" opacity="0.2" />
        {/* Net line (center horizontal) */}
        <line x1="120" y1="400" x2="1080" y2="400" stroke="white" strokeWidth="3.5" opacity="0.4" />
        {/* Center mark */}
        <line x1="600" y1="80" x2="600" y2="105" stroke="white" strokeWidth="2" opacity="0.25" />
        <line x1="600" y1="695" x2="600" y2="720" stroke="white" strokeWidth="2" opacity="0.25" />

        {/* Vignette overlay */}
        <rect width="1200" height="800" fill="url(#vignette)" />
      </svg>

      {/* Content */}
      <div className="z-10 flex flex-col items-center gap-3 px-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
          테니스 플레이북
        </h1>
        <p className="max-w-sm text-base text-white/85 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
          레슨과 경기에서 느낀 점을 한 줄씩 적으면, 다음 경기 전에 살펴볼
          체크리스트가 자동으로 채워져요.
        </p>
      </div>

      {/* App preview cards */}
      <div className="z-10">
        <AppPreview />
      </div>

      {/* Tennis ball CTA */}
      <div className="z-10">
        <TennisBallButton />
      </div>

      {/* CTA hint */}
      <p className="z-10 animate-[fadeInUp_1s_ease-out] text-sm font-medium tracking-wide text-white/75 drop-shadow-[0_1px_3px_rgba(0,0,0,0.3)]">
        🎾 공을 쳐서 시작하세요!
      </p>
    </main>
  );
}
