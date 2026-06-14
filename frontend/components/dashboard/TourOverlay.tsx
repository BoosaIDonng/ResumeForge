"use client";

import { useState, useEffect, useCallback } from "react";

const TOUR_KEY = "ai-resume-tour-completed";

const steps = [
  {
    target: "[data-tour='create']",
    title: "创建简历",
    description: "欢迎！点击这里创建你的第一份简历",
    position: "bottom" as const,
  },
  {
    target: "[data-tour='ai-generate']",
    title: "AI 助手",
    description: "使用AI助手优化你的简历",
    position: "bottom" as const,
  },
  {
    target: "[data-tour='templates']",
    title: "模板选择",
    description: "选择不同的模板风格",
    position: "bottom" as const,
  },
  {
    target: "[data-tour='export']",
    title: "导入简历",
    description: "导入 JSON 格式的简历数据，或使用分享功能",
    position: "bottom" as const,
  },
];

export default function TourOverlay() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const completed = localStorage.getItem(TOUR_KEY);
    if (!completed) {
      setActive(true);
    }
  }, []);

  const updateTargetRect = useCallback(() => {
    if (!active || step >= steps.length) return;
    const el = document.querySelector(steps[step].target);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
    }
  }, [active, step]);

  useEffect(() => {
    if (!active) return;
    updateTargetRect();
    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect);
    return () => {
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect);
    };
  }, [active, step, updateTargetRect]);

  function handleNext() {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeTour();
    }
  }

  function handleSkip() {
    completeTour();
  }

  function completeTour() {
    localStorage.setItem(TOUR_KEY, "true");
    setActive(false);
  }

  if (!active || !targetRect) return null;

  const currentStep = steps[step];
  const spotPad = 8;
  const spotX = targetRect.left - spotPad;
  const spotY = targetRect.top - spotPad;
  const spotW = targetRect.width + spotPad * 2;
  const spotH = targetRect.height + spotPad * 2;

  const tooltipTop = targetRect.bottom + 16;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay with spotlight cutout */}
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <mask id="tour-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={spotX}
              y={spotY}
              width={spotW}
              height={spotH}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.5)"
          mask="url(#tour-mask)"
        />
        <rect
          x={spotX}
          y={spotY}
          width={spotW}
          height={spotH}
          rx="8"
          fill="none"
          stroke="white"
          strokeWidth="2"
          className="animate-pulse"
        />
      </svg>

      {/* Tooltip */}
      <div
        className="absolute z-10 w-72 rounded-xl border border-border bg-card p-4 shadow-xl"
        style={{
          top: tooltipTop,
          left: Math.min(
            Math.max(targetRect.left, 16),
            window.innerWidth - 304
          ),
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-primary">
            {step + 1} / {steps.length}
          </span>
          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground/70 hover:text-muted-foreground"
          >
            跳过
          </button>
        </div>
        <h3 className="mt-2 text-sm font-semibold text-foreground">
          {currentStep.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {currentStep.description}
        </p>
        <button
          onClick={handleNext}
          className="mt-3 w-full rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          {step < steps.length - 1 ? "下一步" : "完成"}
        </button>
      </div>
    </div>
  );
}
