import { TennisBallButton } from "@/components/landing/TennisBallButton";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden bg-[#cc6633]">
      {/* Clay court texture overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)] mix-blend-multiply" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
      {/* Court lines */}
      <div className="pointer-events-none absolute inset-x-[10%] inset-y-[15%] border-2 border-white/30" />
      <div className="pointer-events-none absolute inset-x-[10%] top-1/2 h-px bg-white/25" />

      {/* Content */}
      <div className="z-10 flex flex-col items-center gap-3 px-6 text-center">
        <h1 className="text-4xl font-bold text-white drop-shadow-md">
          테니스 플레이북
        </h1>
        <p className="max-w-sm text-white/80">
          레슨과 경기에서 느낀 점을 한 줄씩 적으면, 다음 경기 전에 살펴볼
          체크리스트가 자동으로 채워져요.
        </p>
      </div>

      {/* Tennis ball button */}
      <div className="z-10">
        <TennisBallButton />
      </div>

      {/* CTA hint */}
      <p className="z-10 animate-pulse text-sm font-medium text-white/70">
        🎾 테니스 공을 쳐서 시작하세요!
      </p>
    </main>
  );
}
