"use client";

type Props = {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

export function InkRing({ value, size = 40, strokeWidth = 3.5, className = "" }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}
      role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={`完整度 ${value}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-semibold tabular-nums text-foreground">
        {clamped}
      </span>
    </div>
  );
}
