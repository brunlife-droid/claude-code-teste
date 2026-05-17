import ReactMarkdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/cn";

type LlmMarkdownVariant = "default" | "chat" | "compact";

interface LlmMarkdownProps {
  content: string;
  className?: string;
  variant?: LlmMarkdownVariant;
}

const baseComponents: Components = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn("mt-5 mb-3 text-xl font-semibold leading-tight", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn("mt-5 mb-2 text-lg font-semibold leading-tight", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn("mt-4 mb-2 text-base font-semibold leading-tight", className)}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn("mt-4 mb-2 text-sm font-semibold leading-tight", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p className={cn("my-3 first:mt-0 last:mb-0", className)} {...props} />
  ),
  strong: ({ className, ...props }) => (
    <strong className={cn("font-semibold text-text", className)} {...props} />
  ),
  em: ({ className, ...props }) => (
    <em className={cn("italic text-text-muted", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("my-3 list-disc space-y-1 pl-5", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("my-3 list-decimal space-y-1 pl-5", className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("pl-1 leading-relaxed", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "border-primary-border bg-primary-soft my-4 rounded-r-lg border-l-4 px-4 py-3 text-text-muted",
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, href, children, ...props }) => (
    <a
      className={cn("text-primary underline underline-offset-2", className)}
      href={href}
      rel="noreferrer"
      target={href?.startsWith("/") || href?.startsWith("#") ? undefined : "_blank"}
      {...props}
    >
      {children}
    </a>
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("border-border my-5", className)} {...props} />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "bg-surface-3 rounded px-1.5 py-0.5 font-mono text-[0.92em]",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "bg-neutral-950 text-neutral-50 my-4 overflow-x-auto rounded-lg p-4 text-xs leading-relaxed",
        className,
      )}
      {...props}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table
        className={cn("w-full border-collapse text-left text-sm", className)}
        {...props}
      />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "bg-surface-2 border-b border-border px-3 py-2 text-xs font-semibold text-text-muted",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn("border-b border-border px-3 py-2 align-top", className)}
      {...props}
    />
  ),
};

const compactComponents: Components = {
  ...baseComponents,
  h1: ({ className, ...props }) => (
    <span className={cn("inline font-semibold", className)} {...props} />
  ),
  h2: ({ className, ...props }) => (
    <span className={cn("inline font-semibold", className)} {...props} />
  ),
  h3: ({ className, ...props }) => (
    <span className={cn("inline font-semibold", className)} {...props} />
  ),
  h4: ({ className, ...props }) => (
    <span className={cn("inline font-semibold", className)} {...props} />
  ),
  p: ({ className, ...props }) => (
    <span className={cn("inline", className)} {...props} />
  ),
  ul: ({ className, ...props }) => (
    <span className={cn("inline", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <span className={cn("inline", className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <span className={cn("inline", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <span className={cn("inline italic text-text-muted", className)} {...props} />
  ),
  pre: ({ className, ...props }) => (
    <code className={cn("font-mono text-[0.92em]", className)} {...props} />
  ),
};

export function LlmMarkdown({
  content,
  className,
  variant = "default",
}: LlmMarkdownProps) {
  const body = (
    <ReactMarkdown
      components={variant === "compact" ? compactComponents : baseComponents}
      remarkPlugins={[remarkGfm, remarkBreaks]}
      skipHtml
      urlTransform={safeUrlTransform}
    >
      {content}
    </ReactMarkdown>
  );

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "llm-markdown min-w-0 text-xs leading-relaxed text-text",
          className,
        )}
      >
        {body}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "llm-markdown min-w-0 text-text",
        variant === "chat" && "text-[15px] leading-relaxed",
        variant === "default" && "text-[14px] leading-relaxed",
        className,
      )}
    >
      {body}
    </div>
  );
}

function safeUrlTransform(url: string): string {
  if (url.startsWith("/") || url.startsWith("#")) return url;

  try {
    const parsed = new URL(url);
    if (["http:", "https:", "mailto:"].includes(parsed.protocol)) {
      return url;
    }
  } catch {
    return "";
  }

  return "";
}
