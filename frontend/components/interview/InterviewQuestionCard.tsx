"use client";

import { useState } from "react";
import type { InterviewQuestion } from "@/lib/types";

type InterviewQuestionCardProps = {
  question: InterviewQuestion;
  index: number;
  onAnswer: (questionId: number, answer: string) => void;
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
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-bold">
          {index + 1}
        </span>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
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
        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
      />

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handleSave}
          disabled={saving || !answer.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "保存中..." : "保存回答"}
        </button>

        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            已保存
          </span>
        )}
      </div>
    </div>
  );
}
