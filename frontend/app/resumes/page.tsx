"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";
import type { Resume } from "@/lib/types";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    try {
      const data = await apiGet<Resume[]>("/api/resumes");
      setResumes(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await apiPost<Resume>("/api/resumes", { title: newTitle.trim(), master: true });
      setNewTitle("");
      await fetchResumes();
    } catch {
      // ignore
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-500">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Resumes</h1>

      {/* Create form */}
      <div className="mb-8 flex gap-3">
        <input
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          placeholder="New resume title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newTitle.trim()}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Resume"}
        </button>
      </div>

      {/* Resume list */}
      {resumes.length === 0 ? (
        <p className="text-gray-500">No resumes yet. Create one to get started.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Link
              key={resume.id}
              href={`/resumes/${resume.id}/edit`}
              className="block rounded border border-gray-200 p-4 transition hover:border-blue-300 hover:shadow-sm"
            >
              <h2 className="text-base font-semibold text-gray-800 truncate">{resume.title}</h2>
              <p className="mt-1 text-xs text-gray-500">
                Updated: {new Date(resume.updatedAt).toLocaleDateString()}
              </p>
              {resume.master && (
                <span className="mt-2 inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Master
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
