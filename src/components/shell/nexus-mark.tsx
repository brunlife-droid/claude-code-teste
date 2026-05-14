import { cn } from "@/lib/cn";

interface NexusMarkProps {
  size?: number;
  variant?: "light" | "dark";
  className?: string;
}

export function NexusMark({
  size = 28,
  variant = "light",
  className,
}: NexusMarkProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-md",
        variant === "light"
          ? "bg-[#18181B] text-[#F4F4F2]"
          : "bg-[#F4F4F2] text-[#18181B]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label="Nexus Education"
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.6}
        height={size * 0.6}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
      >
        <path d="M4 20V4l16 16V4" />
      </svg>
    </div>
  );
}
