import { cn } from "@/lib/cn";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-end justify-between gap-4 px-8 pt-7 pb-5",
        className,
      )}
    >
      <div>
        <div className="mb-2 h-1 w-12 rounded-full bg-secondary" />
        <h1 className="text-[24px] font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-text-subtle mt-1.5 max-w-3xl text-[13.5px] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  );
}

interface PageBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function PageBody({ children, className }: PageBodyProps) {
  return (
    <div className={cn("flex flex-col gap-5 px-8 pb-8", className)}>
      {children}
    </div>
  );
}
