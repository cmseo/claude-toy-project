"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const VISITED_KEY = "tennis-playbook:hasVisited:v1";

export default function LandingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const visited = typeof window !== "undefined" && localStorage.getItem(VISITED_KEY) === "1";
    if (visited) {
      router.replace("/playbook");
      return;
    }
    setReady(true);
  }, [router]);

  function handleStart() {
    localStorage.setItem(VISITED_KEY, "1");
  }

  if (!ready) return null;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold">테니스 플레이북</h1>
        <p className="text-muted-foreground">
          레슨과 경기에서 느낀 점을 한 줄씩 적으면, 다음 경기 전에 살펴볼 체크리스트가 자동으로 채워져요.
        </p>
      </div>
      <Button asChild size="lg" onClick={handleStart}>
        <Link href="/playbook">시작하기</Link>
      </Button>
    </main>
  );
}
