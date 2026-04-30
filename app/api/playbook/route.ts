import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { DiaryEntry, PlaybookItem } from "@/types/diary";
import { buildPrompt } from "@/lib/playbook";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const entries: DiaryEntry[] = body.entries;

    if (!Array.isArray(entries) || entries.length === 0) {
      return Response.json(
        { error: "기록이 비어 있습니다." },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(entries);

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
    });

    const parsed = JSON.parse(text.replace(/```json\n?|```/g, "").trim());

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return Response.json(
        { error: "AI 응답을 파싱할 수 없습니다." },
        { status: 500 }
      );
    }

    const items: PlaybookItem[] = parsed.slice(0, 5).map(
      (text: string, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        text: String(text),
      })
    );

    return Response.json({
      items,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return Response.json({ error: message }, { status: 500 });
  }
}
