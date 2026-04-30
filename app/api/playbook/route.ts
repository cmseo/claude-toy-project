import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { DiaryEntry, PlaybookItem } from "@/types/diary";
import { buildPrompt } from "@/lib/playbook";

const MAX_ENTRIES = 100;
const MAX_NOTES_LENGTH = 2000;

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

    if (entries.length > MAX_ENTRIES) {
      return Response.json(
        { error: "기록이 너무 많습니다." },
        { status: 400 }
      );
    }

    const sanitized = entries.map((e) => ({
      ...e,
      notes: typeof e.notes === "string" ? e.notes.slice(0, MAX_NOTES_LENGTH) : "",
    }));

    const prompt = buildPrompt(sanitized);

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
    });

    let parsed: unknown;
    try {
      parsed = JSON.parse(text.replace(/```json\n?|```/g, "").trim());
    } catch {
      return Response.json(
        { error: "AI 응답을 파싱할 수 없습니다." },
        { status: 500 }
      );
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return Response.json(
        { error: "AI 응답을 파싱할 수 없습니다." },
        { status: 500 }
      );
    }

    const items: PlaybookItem[] = parsed.slice(0, 5).map(
      (content: unknown, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        text: String(content),
      })
    );

    return Response.json({
      items,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return Response.json(
      { error: "플레이북 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
