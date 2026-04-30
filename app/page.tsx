import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">테니스 플레이북</h1>
        <p className="text-muted-foreground">
          레슨과 경기에서 느낀 점을 한 줄씩 적으면, 다음 경기 전에 살펴볼 체크리스트가 자동으로 채워져요.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/playbook">시작하기</Link>
      </Button>
    </main>
  );
}
