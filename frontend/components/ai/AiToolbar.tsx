"use client";

import { useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { type LucideIcon, Bot, PenLine, Target, Stethoscope, Mail, Languages, Clock, Palette } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AiChatPanel from "./AiChatPanel";
import CreateResumeDialog from "@/components/dashboard/CreateResumeDialog";
import JdAnalysisDialog from "./JdAnalysisDialog";
import ResumeDiagnosisPanel from "./ResumeDiagnosisPanel";
import CoverLetterDialog from "./CoverLetterDialog";
import TranslateDialog from "./TranslateDialog";
import VersionHistoryPanel from "./VersionHistoryPanel";
import DesignSettingsDialog from "./DesignSettingsDialog";
import type { ResumeData } from "@/components/resume/resumeData";

type ActivePanel =
  | null
  | "chat"
  | "generate"
  | "jd"
  | "diagnosis"
  | "coverLetter"
  | "translate"
  | "versions"
  | "design";

type Props = {
  resumeId?: string;
  resumeData?: string;
  onResumeUpdated?: () => void;
  designData?: ResumeData;
  onDesignChange?: (data: ResumeData) => void;
};

export default function AiToolbar({ resumeId, resumeData, onResumeUpdated, designData, onDesignChange }: Props) {
  const router = useRouter();
  const [active, setActive] = useState<ActivePanel>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const buttons: { key: ActivePanel; icon: LucideIcon; label: string; disabled?: boolean }[] = [
    { key: "chat", icon: Bot, label: "AI助手" },
    { key: "generate", icon: PenLine, label: "生成简历" },
    { key: "jd", icon: Target, label: "JD分析" },
    { key: "diagnosis", icon: Stethoscope, label: "简历诊断" },
    { key: "coverLetter", icon: Mail, label: "求职信" },
    { key: "translate", icon: Languages, label: "翻译" },
    { key: "versions", icon: Clock, label: "版本历史", disabled: !resumeId },
    { key: "design", icon: Palette, label: "设计设置" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2">
        {buttons.map((btn) => (
          <Fragment key={btn.key}>
            {btn.key === "design" && <span className="mx-0.5 h-5 w-px bg-border" />}
            <button
              disabled={btn.disabled}
              onClick={() => {
                if (btn.disabled) return;
                if (btn.key === "generate") { setCreateDialogOpen(true); return; }
                setActive(btn.key);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                btn.disabled
                  ? "opacity-40 cursor-not-allowed"
                  : (btn.key === "generate" ? createDialogOpen : active === btn.key)
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <btn.icon className="h-4 w-4" />
              <span>{btn.label}</span>
            </button>
          </Fragment>
        ))}
      </div>

      <AiChatPanel
        resumeId={resumeId}
        open={active === "chat"}
        onOpenChange={(open) => { if (!open) setActive(null); }}
        onResumeUpdated={onResumeUpdated}
        pendingMessage={pendingMessage}
        onPendingMessageConsumed={() => setPendingMessage(null)}
      />

      <CreateResumeDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onCreated={(resume) => { setCreateDialogOpen(false); router.push(`/resumes/${resume.id}/edit`); }}
        initialTab="ai"
      />

      {active === "jd" && (
        <JdAnalysisDialog
          resumeId={resumeId}
          resumeData={resumeData}
          onClose={() => setActive(null)}
          onSendToChat={(message) => {
            setPendingMessage(message);
            setActive("chat");
          }}
        />
      )}
      {active === "diagnosis" && (
        <ResumeDiagnosisPanel
          resumeId={resumeId}
          resumeData={resumeData}
          onClose={() => setActive(null)}
          onResumeUpdated={onResumeUpdated}
          onSendToChat={(message) => {
            setPendingMessage(message);
            setActive("chat");
          }}
        />
      )}
      {active === "coverLetter" && (
        <CoverLetterDialog onClose={() => setActive(null)} />
      )}
      {active === "translate" && (
        <TranslateDialog
          resumeId={resumeId}
          resumeData={resumeData}
          onClose={() => setActive(null)}
        />
      )}

      <Dialog open={active === "versions" && !!resumeId} onOpenChange={(open) => { if (!open) setActive(null); }}>
        <DialogContent className="sm:max-w-[480px] p-0 flex flex-col max-h-[90vh]">
          <DialogHeader className="p-4 border-b border-border shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> 版本历史
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-y-auto p-4">
            {resumeId && <VersionHistoryPanel resumeId={resumeId} onRestore={() => { setActive(null); onResumeUpdated?.(); }} />}
          </div>
        </DialogContent>
      </Dialog>

      {active === "design" && designData && onDesignChange && (
        <DesignSettingsDialog
          open
          onClose={() => setActive(null)}
          data={designData}
          onChange={onDesignChange}
        />
      )}
    </>
  );
}
