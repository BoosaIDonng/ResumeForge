'use client';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sparkles, ChevronRight, Check, BarChart3, Key, Scissors, Target, Loader2, Lightbulb } from 'lucide-react';
import { optimizeSection, SectionOptimizeResponse, SectionOptimizeChange } from '@/lib/ai-api';

interface Props {
  sectionType: string;
  currentContent: string;
  onApply: (optimizedContent: string) => void;
}

const GOALS = [
  { value: 'improve_writing', label: '提升写作', icon: Sparkles },
  { value: 'quantify_achievements', label: '量化成果', icon: BarChart3 },
  { value: 'add_keywords', label: '添加关键词', icon: Key },
  { value: 'make_concise', label: '精简表达', icon: Scissors },
  { value: 'tailor_jd', label: '针对JD优化', icon: Target },
];

const SECTION_LABELS: Record<string, string> = {
  summary: '个人总结',
  experience: '工作经历',
  projects: '项目经历',
  education: '教育背景',
  skills: '技能',
  certifications: '证书',
  languages: '语言',
  awards: '奖项',
};

export default function SectionOptimizeButton({ sectionType, currentContent, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState('improve_writing');
  const [jd, setJd] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SectionOptimizeResponse | null>(null);
  const [error, setError] = useState('');

  const handleOptimize = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await optimizeSection({
        sectionType,
        currentContent,
        goal,
        jobDescription: goal === 'tailor_jd' ? jd : undefined,
        userInstructions: instructions || undefined,
      });
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '优化失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="xs"
        onClick={() => setOpen(true)}
        className="border-primary/30 text-primary hover:bg-primary/10"
      >
        <Sparkles className="size-3" />
        <span>AI优化</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-accent" />
              AI 优化 — {SECTION_LABELS[sectionType] || sectionType}
            </DialogTitle>
            <DialogDescription>
              选择优化目标，AI 将为你改写此栏内容
            </DialogDescription>
          </DialogHeader>

          {/* Goal selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">优化目标</label>
            <div className="flex flex-wrap gap-1.5">
              {GOALS.map(g => (
                <Button
                  key={g.value}
                  variant={goal === g.value ? 'default' : 'outline'}
                  size="xs"
                  onClick={() => setGoal(g.value)}
                >
                  <g.icon className="size-3" />
                  <span>{g.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* JD input */}
          {goal === 'tailor_jd' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">职位描述 (JD)</label>
              <Textarea
                placeholder="粘贴目标职位的 JD..."
                value={jd}
                onChange={e => setJd(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {/* Extra instructions */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">额外要求（可选）</label>
            <Input
              placeholder="例如：突出团队管理经验..."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
            />
          </div>

          <Button
            onClick={handleOptimize}
            disabled={loading || !currentContent.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                AI 优化中...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                开始优化
              </>
            )}
          </Button>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-3">
              {/* Score */}
              {result.scoreBefore != null && result.scoreAfter != null && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">质量评分:</span>
                  <Badge variant="destructive">{result.scoreBefore}</Badge>
                  <ChevronRight className="size-4 text-muted-foreground/60" />
                  <Badge variant="default">{result.scoreAfter}</Badge>
                  <span className="text-success text-xs">(+{result.scoreAfter - result.scoreBefore})</span>
                </div>
              )}

              {/* Changes */}
              {result.changes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">修改详情</h4>
                  {result.changes.map((c: SectionOptimizeChange, i: number) => (
                    <div key={i} className="text-xs border rounded-lg p-2.5 bg-muted/50">
                      <div className="font-medium text-muted-foreground mb-1.5">{c.field}</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-destructive/80 font-medium">原文</span>
                          <p className="text-muted-foreground line-clamp-2">{c.before}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-success font-medium">改后</span>
                          <p className="text-foreground line-clamp-2">{c.after}</p>
                        </div>
                      </div>
                      {c.reason && (
                        <p className="flex items-center gap-1 text-accent mt-1.5 text-[11px]"><Lightbulb className="size-3 shrink-0" /> {c.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={() => { onApply(result.optimizedContent); setOpen(false); }}
                className="w-full"
                variant="default"
              >
                <Check className="size-4" />
                应用优化结果
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
