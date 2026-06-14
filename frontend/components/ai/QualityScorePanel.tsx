'use client';
import { useState } from 'react';
import { getQualityScore, QualityScoreResponse } from '@/lib/ai-api';
import { ClipboardList, Loader2, Search, Lightbulb } from 'lucide-react';

interface Props {
  resumeId: number;
}

export default function QualityScorePanel({ resumeId }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QualityScoreResponse | null>(null);
  const [error, setError] = useState('');

  const handleScore = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getQualityScore(resumeId);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '评分失败');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const scoreBg = (score: number) => {
    if (score >= 80) return 'bg-success/10 border-success/20';
    if (score >= 60) return 'bg-warning/10 border-warning/20';
    return 'bg-destructive/5 border-destructive/20';
  };

  const priorityBadge = (p: string) => {
    const styles: Record<string, string> = {
      high: 'bg-destructive/10 text-destructive',
      medium: 'bg-warning/15 text-warning',
      low: 'bg-primary/10 text-primary/90',
    };
    const labels: Record<string, string> = { high: '高', medium: '中', low: '低' };
    return (
      <span className={`text-[10px] px-1.5 py-0.5 rounded ${styles[p] || styles.medium}`}>
        {labels[p] || p}优先
      </span>
    );
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="flex items-center gap-1.5 font-semibold text-sm"><ClipboardList className="size-4" /> 简历质量评分</h3>
        <button
          onClick={handleScore}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              分析中...
            </>
          ) : (
            <>
              <Search className="size-3.5" />
              开始评分
            </>
          )}
        </button>
      </div>

      {error && <p className="text-sm text-destructive mb-2">{error}</p>}

      {result && (
        <div className="space-y-3">
          {/* Overall score */}
          <div className={`text-center p-4 rounded-lg border ${scoreBg(result.overallScore)}`}>
            <div className={`text-4xl font-bold ${scoreColor(result.overallScore)}`}>
              {result.overallScore}
            </div>
            <div className="text-xs text-muted-foreground mt-1">综合评分 / 100</div>
          </div>

          {/* Summary */}
          {result.summary && (
            <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">{result.summary}</p>
          )}

          {/* Section scores */}
          {result.sectionScores.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">分栏评分</h4>
              <div className="space-y-1.5">
                {result.sectionScores.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-20 text-muted-foreground truncate">{s.sectionName}</span>
                    <div className="flex-1 bg-border rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          s.score >= 80 ? 'bg-success' : s.score >= 60 ? 'bg-warning' : 'bg-destructive'
                        }`}
                        style={{ width: `${s.score}%` }}
                      />
                    </div>
                    <span className={`font-medium w-8 text-right ${scoreColor(s.score)}`}>{s.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">改进建议</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {result.suggestions.map((s, i) => (
                  <div key={i} className="text-xs border rounded p-2">
                    <div className="flex items-center gap-2 mb-1">
                      {priorityBadge(s.priority)}
                      <span className="text-muted-foreground/60">{s.section}</span>
                    </div>
                    <p className="text-foreground">{s.message}</p>
                    {s.example && (
                      <p className="flex items-center gap-1 text-success mt-1 bg-success/10 p-1 rounded text-[11px]"><Lightbulb className="size-3 shrink-0" /> {s.example}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <p className="text-xs text-muted-foreground/60 text-center py-4">点击上方按钮获取简历质量评估</p>
      )}
    </div>
  );
}
