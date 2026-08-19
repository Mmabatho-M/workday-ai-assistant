import { AlertTriangle, Info, Loader2, ShieldCheck, Sparkle } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import type { Priority, Status } from "@/lib/demo-data";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold text-foreground sm:text-[1.75rem]">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

const priorityStyles: Record<Priority | "Fixed", string> = {
  Critical: "border-priority-critical/30 bg-priority-critical/10 text-priority-critical",
  High: "border-priority-high/30 bg-priority-high/10 text-priority-high",
  Medium: "border-priority-medium/30 bg-priority-medium/10 text-priority-medium",
  Low: "border-priority-low/30 bg-priority-low/10 text-priority-low",
  Fixed: "border-event-meeting/30 bg-event-meeting/10 text-event-meeting",
};

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const style =
    priorityStyles[(priority as Priority) ?? "Medium"] ?? priorityStyles.Medium;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        style,
        className,
      )}
    >
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    "Not Started": "bg-muted text-muted-foreground",
    "In Progress": "bg-accent text-accent-foreground",
    Completed: "bg-success/12 text-success",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", map[status])}>
      {status}
    </span>
  );
}

export function AiDisclaimer({ className, text }: { className?: string; text?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-px size-3.5 shrink-0" aria-hidden />
      <span>
        {text ??
          "AI-generated. Review before acting — AI can be wrong or incomplete, and results are not guaranteed to be accurate."}
      </span>
    </p>
  );
}

export function AiReasoning({
  label = "Why this recommendation?",
  factors,
  explanation,
}: {
  label?: string;
  factors?: string[];
  explanation?: string;
}) {
  if (!factors?.length && !explanation) return null;
  return (
    <Collapsible>
      <CollapsibleTrigger className="inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-primary transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        <Sparkle className="size-3.5" aria-hidden />
        {label}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 rounded-lg border border-border bg-secondary/60 p-3 text-xs text-muted-foreground">
        {explanation ? <p className="text-foreground/80">{explanation}</p> : null}
        {factors?.length ? (
          <ul className="mt-2 space-y-1">
            {factors.map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-2 text-[11px] italic">Decision factors only — not internal model reasoning.</p>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function LoadingBlock({ message }: { message: string }) {
  return (
    <div className="ai-panel flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
      <p className="text-sm font-medium text-foreground">{message}</p>
      <p className="text-xs text-muted-foreground">This usually takes a few seconds.</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
        <div>
          <p className="text-sm font-medium text-foreground">
            We couldn&apos;t generate a response. Please try again.
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{message}</p>
        </div>
      </div>
      {onRetry ? (
        <Button size="sm" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
        {icon ?? <Sparkle className="size-5" aria-hidden />}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
}) {
  return (
    <div className="surface-card p-5 transition-shadow hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function AiBadge({ children = "AI" }: { children?: ReactNode }) {
  return (
    <Badge variant="outline" className="border-primary/30 bg-primary/8 text-primary">
      <ShieldCheck className="mr-1 size-3" aria-hidden />
      {children}
    </Badge>
  );
}
