'use client';
import { useRef, useState } from 'react';
import { importDocx } from '@/lib/ai-api';
import { useRouter } from 'next/navigation';
import { Loader2, FileText } from 'lucide-react';

export default function DocxImportButton() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.docx')) {
      setError('请选择 .docx 文件');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await importDocx(file);
      router.push(`/resumes/${result.id}/edit`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '导入失败');
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileRef}
        type="file"
        accept=".docx"
        onChange={handleFile}
        className="hidden"
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg hover:bg-muted/50 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>导入中...</span>
          </>
        ) : (
          <>
            <FileText className="size-4" />
            <span>导入 DOCX</span>
          </>
        )}
      </button>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}
