"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { DiaryEntryType, MatchResult } from "@/types/diary";

export interface RecordFormValues {
  type: DiaryEntryType;
  date: string;
  duration: number;
  notes: string;
  score?: string;
  result?: MatchResult;
}

interface RecordFormProps {
  initialValues?: Partial<RecordFormValues>;
  submitLabel?: string;
  onSubmit: (values: RecordFormValues) => void;
  onCancel?: () => void;
}

interface Errors {
  date?: string;
  duration?: string;
}

function defaultDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function RecordForm({
  initialValues,
  submitLabel = "저장",
  onSubmit,
  onCancel,
}: RecordFormProps) {
  const [type, setType] = useState<DiaryEntryType>(initialValues?.type ?? "lesson");
  const [date, setDate] = useState(initialValues?.date ?? defaultDate());
  const [duration, setDuration] = useState<string>(
    initialValues?.duration ? String(initialValues.duration) : "",
  );
  const [notes, setNotes] = useState(initialValues?.notes ?? "");
  const [score, setScore] = useState(initialValues?.score ?? "");
  const [result, setResult] = useState<MatchResult | "">(initialValues?.result ?? "");
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!date) next.date = "날짜를 입력하세요";
    const durationNum = Number(duration);
    if (!duration || Number.isNaN(durationNum) || durationNum <= 0) {
      next.duration = "소요 시간을 입력하세요";
    }
    if (next.date || next.duration) {
      setErrors(next);
      return;
    }
    setErrors({});
    onSubmit({
      type,
      date,
      duration: durationNum,
      notes,
      score: type === "match" ? score : undefined,
      result: type === "match" && result !== "" ? result : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        <Field>
          <FieldLabel>유형</FieldLabel>
          <ToggleGroup
            type="single"
            value={type}
            onValueChange={(v) => v && setType(v as DiaryEntryType)}
            variant="outline"
            aria-label="유형"
          >
            <ToggleGroupItem value="lesson">레슨</ToggleGroupItem>
            <ToggleGroupItem value="match">경기</ToggleGroupItem>
          </ToggleGroup>
        </Field>

        <Field data-invalid={errors.date ? true : undefined}>
          <FieldLabel htmlFor="record-date">날짜</FieldLabel>
          <Input
            id="record-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={errors.date ? true : undefined}
          />
          {errors.date && <FieldError>{errors.date}</FieldError>}
        </Field>

        <Field data-invalid={errors.duration ? true : undefined}>
          <FieldLabel htmlFor="record-duration">소요 시간(분)</FieldLabel>
          <Input
            id="record-duration"
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="예: 60"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            aria-invalid={errors.duration ? true : undefined}
          />
          {errors.duration && <FieldError>{errors.duration}</FieldError>}
        </Field>

        {type === "match" && (
          <>
            <Field>
              <FieldLabel htmlFor="record-score">스코어</FieldLabel>
              <Input
                id="record-score"
                type="text"
                placeholder="예: 6-4 6-3"
                value={score}
                onChange={(e) => setScore(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>결과</FieldLabel>
              <ToggleGroup
                type="single"
                value={result}
                onValueChange={(v) => setResult((v ?? "") as MatchResult | "")}
                variant="outline"
                aria-label="결과"
              >
                <ToggleGroupItem value="win">승</ToggleGroupItem>
                <ToggleGroupItem value="lose">패</ToggleGroupItem>
              </ToggleGroup>
            </Field>
          </>
        )}

        <Field>
          <FieldLabel htmlFor="record-notes">느낀점</FieldLabel>
          <Textarea
            id="record-notes"
            rows={5}
            placeholder="오늘 배운 점, 다음에 시도할 것 등"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <FieldDescription>한 문장씩 적으면 플레이북 항목이 됩니다.</FieldDescription>
        </Field>

        <Field orientation="horizontal">
          <Button type="submit">{submitLabel}</Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          )}
        </Field>
      </FieldGroup>
    </form>
  );
}
