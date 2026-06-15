'use client';
import { useState, useEffect, useCallback } from 'react';
import { listVersions, createVersion, restoreVersion, VersionInfo } from '@/lib/ai-api';
import { Clock, Save, RotateCcw } from 'lucide-react';

interface Props {
  resumeId: string;
  onRestore?: () => void;
}

export default function VersionHistoryPanel({ resumeId, onRestore }: Props) {
  const [versions, setVersions] = useState<VersionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [desc, setDesc] = useState('');
  const [error, setError] = useState('');

  const loadVersions = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listVersions(resumeId);
      setVersions(list);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [resumeId]);

  useEffect(() => { loadVersions(); }, [loadVersions]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await createVersion(resumeId, desc || '手动保存');
      setDesc('');
      await loadVersions();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('确定要恢复到此版本吗？当前内容将先备份。')) return;
    setRestoring(versionId);
    setError('');
    try {
      await restoreVersion(resumeId, versionId);
      await loadVersions();
      onRestore?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '恢复失败');
    } finally {
      setRestoring(null);
    }
  };

  const formatDate = (s: string) => {
    try {
      const d = new Date(s);
      return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch {
      return s;
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="flex items-center gap-1.5 font-semibold text-sm mb-3"><Clock className="size-4" /> 版本历史</h3>

      {/* Save new version */}
      <div className="flex gap-2 mb-3">
        <input
          className="flex-1 border rounded px-2 py-1.5 text-xs"
          placeholder="版本说明（可选）"
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary-hover disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          {saving ? '...' : <><Save className="size-3.5" /> 保存版本</>}
        </button>
      </div>

      {error && <p className="text-xs text-destructive mb-2">{error}</p>}

      {/* Version list */}
      {loading ? (
        <p className="text-xs text-muted-foreground/60 text-center py-3">加载中...</p>
      ) : versions.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 text-center py-3">暂无版本记录</p>
      ) : (
        <div className="space-y-1.5 max-h-80 overflow-y-auto">
          {versions.map(v => (
            <div key={v.id} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/50 hover:bg-muted transition-colors">
              <span className="text-primary font-mono font-medium w-8">v{v.versionNumber}</span>
              <div className="flex-1 min-w-0">
                <div className="text-foreground truncate">{v.changeDescription}</div>
                <div className="text-[10px] text-muted-foreground/60">{formatDate(v.createdAt)}</div>
              </div>
              <button
                onClick={() => handleRestore(v.id)}
                disabled={restoring === v.id}
                className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-card border rounded text-muted-foreground hover:text-primary hover:border-primary/80 transition-colors whitespace-nowrap"
              >
                {restoring === v.id ? '...' : <><RotateCcw className="size-3" /> 恢复</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
