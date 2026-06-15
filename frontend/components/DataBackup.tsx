'use client';

import { useState } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { dataTransfer } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function DataBackup() {
  const [importing, setImporting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleExport = () => {
    const json = dataTransfer.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-resume-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('数据已导出');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      dataTransfer.importAll(text);
      toast.success('导入成功，页面将刷新');
      setTimeout(() => window.location.reload(), 800);
    } catch {
      toast.error('导入失败：文件格式错误');
    } finally {
      setImporting(false);
    }
  };

  const handleClear = () => {
    dataTransfer.clearAll();
    toast.success('数据已清除，页面将刷新');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="space-y-4 border-b border-border p-6">
      <div>
        <h3 className="text-display-sm text-foreground">数据管理</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          所有数据保存在浏览器本地。清除浏览器数据会丢失简历，请定期备份。
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          导出数据
        </Button>
        <Button variant="outline" size="sm" disabled={importing}>
          <Label className="cursor-pointer gap-1.5">
            <Upload className="h-4 w-4" />
            {importing ? '导入中...' : '导入数据'}
            <input type="file" accept=".json" onChange={handleImport} className="hidden" disabled={importing} />
          </Label>
        </Button>
        <Button variant="destructive" size="sm" onClick={() => setConfirmOpen(true)}>
          <Trash2 className="h-4 w-4" />
          清除所有
        </Button>
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setConfirmOpen(false)}>
          <div className="w-full max-w-sm border border-border bg-popover p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-heading font-bold text-foreground">确认清除</h3>
            <p className="mt-2 text-sm text-muted-foreground">确定要清除所有数据吗？此操作不可恢复。</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)}>取消</Button>
              <Button variant="destructive" size="sm" onClick={handleClear}>确认清除</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
