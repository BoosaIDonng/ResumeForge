"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InterviewQuestion } from "@/lib/types";

type InterviewQuestionCardProps = {
  question: InterviewQuestion;
  index: number;
  onAnswer: (questionId: string, answer: string) => void;
};

export function InterviewQuestionCard({
  question,
  index,
  onAnswer,
}: InterviewQuestionCardProps) {
  const [answer, setAnswer] = useState(question.answer ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(!!question.answer);

  const handleSave = async () => {
    if (!answer.trim()) return;
    setSaving(true);
    try {
      onAnswer(question.id, answer);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-8 h-8 bg-primary/10 text-primary text-sm font-bold">
          {index + 1}
        </span>
        <h3 className="text-lg font-medium text-foreground">
          {question.question}
        </h3>
      </div>

      <textarea
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          setSaved(false);
        }}
        rows={6}
        placeholder="在此输入你的回答..."
        className="w-full rounded-lg border border-border bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary resize-y"
      />

      <div className="flex items-center justify-between mt-4">
        <Button
          onClick={handleSave}
          disabled={saving || !answer.trim()}
        >
          {saving ? "保存中..." : "保存回答"}
        </Button>

        {saved && (
          <span className="flex items-center gap-1 text-sm text-success">
            <Check className="w-4 h-4" aria-hidden="true" />
            已保存
          </span>
        )}
      </div>
    </div>
  );
}
