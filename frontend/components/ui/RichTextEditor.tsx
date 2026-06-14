"use client";

import { useRef, useCallback, useState, useEffect } from "react";

type RichTextEditorProps = {
  value: string;  // HTML string
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
};

export default function RichTextEditor({ value, onChange, placeholder = "输入内容...", minHeight = "80px" }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync external value changes into the editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [handleInput]);

  const toolbarButtons = [
    { command: "bold", icon: "B", title: "粗体" },
    { command: "italic", icon: "I", title: "斜体" },
    { command: "underline", icon: "U", title: "下划线" },
    { command: "insertUnorderedList", icon: "•", title: "无序列表" },
    { command: "insertOrderedList", icon: "1.", title: "有序列表" },
  ];

  return (
    <div className={`rounded-lg border transition-colors ${isFocused ? "border-ring ring-2 ring-ring/20" : "border-input"}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-input bg-muted/50 px-2 py-1 rounded-t-lg">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.command}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCommand(btn.command); }}
            className="rounded px-2 py-1 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            title={btn.title}
          >
            {btn.icon}
          </button>
        ))}
      </div>
      {/* Editor area */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full px-3 py-2 text-sm text-foreground outline-none min-h-[80px] prose prose-sm max-w-none"
        style={{ minHeight }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      {/* Placeholder styling */}
      <style jsx>{`
        div[data-placeholder]:empty::before {
          content: attr(data-placeholder);
          color: var(--color-muted-foreground);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
