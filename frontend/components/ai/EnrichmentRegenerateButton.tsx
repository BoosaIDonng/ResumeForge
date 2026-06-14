'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Sparkles, Loader2, Check, Lightbulb } from 'lucide-react';
import { regenerateEnrichment, EnrichmentRegenerateResponse } from '@/lib/ai-api';

interface Props {
  resumeId: number;
  itemType: string;
  itemId: string;
  onApply: (content: string) => void;
}

export default function EnrichmentRegenerateButton({ resumeId, itemType, itemId, onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EnrichmentRegenerateResponse | null>(null);
  const [error, setError] = useState('');

  const handleRegenerate = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await regenerateEnrichment(resumeId, {
        itemType,
        itemId,
        userInstruction: instruction,
      });
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '重新生成失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="xs"
        onClick={() => setOpen(true)}
        className="text-accent hover:text-accent/90 hover:bg-accent/10"
      >
        <Sparkles className="size-3" />
        <span>重新生成</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg rounded-none border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-5 text-accent" />
              重新生成
            </DialogTitle>
            <DialogDescription>
              输入你的要求，AI 将重新生成此内容
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">指令</label>
            <Textarea
              placeholder="例如：更强调技术细节..."
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleRegenerate}
            disabled={loading || !instruction.trim()}
            className="w-full rounded-none"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                重新生成
              </>
            )}
          </Button>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {result && (
            <div className="space-y-3">
              <div className="text-sm border rounded-none p-3 bg-muted/50">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">生成结果</h4>
                <p className="text-foreground whitespace-pre-wrap">{result.enrichedContent}</p>
              </div>

              {result.changes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground">修改详情</h4>
                  {result.changes.map((c, i) => (
                    <div key={i} className="text-xs border rounded-none p-2.5 bg-muted/50">
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
                        <p className="flex items-center gap-1 text-accent mt-1.5 text-[11px]">
                          <Lightbulb className="size-3 shrink-0" /> {c.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Button
                onClick={() => { onApply(result.enrichedContent); setOpen(false); }}
                className="w-full rounded-none"
                variant="default"
              >
                <Check className="size-4" />
                应用
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
