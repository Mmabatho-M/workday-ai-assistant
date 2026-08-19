import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Flame,
  ListTodo,
  MessagesSquare,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AiBadge,
  AiDisclaimer,
  EmptyState,
  ErrorState,
  PageHeader,
  PriorityBadge,
  StatCard,
  StatusBadge,
} from "@/components/ui-bits";
import { chatWithCopilot } from "@/lib/ai.functions";
import { buildAiContext, useStore } from "@/lib/store";
import { formatDueDate, formatDuration, isoDate, type CalendarEvent } from "@/lib/demo-data";
import { durationBetween, errorMessage, greeting } from "@/lib/time";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | AI Workday Copilot" },
      {
        name: "description",
        content:
          "See your AI-prioritised workday: today's schedule, high-priority tasks, focus time and AI workplace insights.",
      },
      { property: "og:title", content: "Dashboard | AI Workday Copilot" },
      {
        property: "og:description",
        content: "Your AI workplace assistant for planning, prioritising and focusing.",
      },
    ],
  }),
  component: DashboardPage,
});

type Brief = { recommendation: string; insights: string[] };

function parseBrief(text: string): Brief {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const recommendation =
    lines.find((l) => /^recommendation:/i.test(l))?.replace(/^recommendation:\s*/i, "") ??
    lines[0] ??
    "";
  const insights = lines
    .filter((l) => /^insight:/i.test(l))
    .map((l) => l.replace(/^insight:\s*/i, ""))
    .slice(0, 4);
  return { recommendation, insights };
}

function DashboardPage() {
  const navigate = useNavigate();
  const { tasks, events, updateEvent, updateTask, hydrated } = useStore();
  const today = isoDate(0);

  const todaysEvents = useMemo(
    () => events.filter((e) => e.date === today).sort((a, b) => a.start.localeCompare(b.start)),
    [events, today],
  );
  const openTasks = tasks.filter((t) => t.status !== "Completed");
  const dueToday = tasks.filter((t) => t.dueDate <= today);
  const completed = tasks.filter((t) => t.status === "Completed");
  const focusMinutes = todaysEvents
    .filter((e) => e.type === "focus")
    .reduce((sum, e) => sum + durationBetween(e.start, e.end), 0);
  const priorityTasks = openTasks
    .filter((t) => t.priority === "Critical" || t.priority === "High")
    .slice(0, 4);

  const chat = useServerFn(chatWithCopilot);
  const brief = useMutation({
    mutationFn: async () => {
      const res = await chat({
        data: {
          context: buildAiContext(tasks, events),
          messages: [
            {
              role: "user" as const,
              content:
                "Give me my morning brief. Reply in exactly this format and nothing else:\nRECOMMENDATION: <one specific sentence recommending what to do first today and why, naming the real task and any relevant meeting>\nINSIGHT: <a specific insight about impact, deadlines or focus windows>\nINSIGHT: <a specific insight about what could be moved or deferred>\nINSIGHT: <a specific insight about an available focus window with times>",
            },
          ],
        },
      });
      return parseBrief(res.reply);
    },
  });

  useEffect(() => {
    if (hydrated) brief.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const [editing, setEditing] = useState<CalendarEvent | null>(null);

  return (
    <div className="space-y-7">
      <PageHeader
        title={`${greeting()}, Alex 👋`}
        subtitle="Here's what your workday looks like."
        actions={
          <>
            <Button variant="outline" onClick={() => navigate({ to: "/calendar" })}>
              <CalendarClock className="size-4" aria-hidden /> View schedule
            </Button>
            <Button onClick={() => navigate({ to: "/chat" })}>
              <MessagesSquare className="size-4" aria-hidden /> Ask AI
            </Button>
          </>
        }
      />

      <section className="ai-panel p-5 sm:p-6" aria-label="AI recommendation">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <h2 className="text-sm font-semibold text-foreground">AI Recommendation</h2>
          <AiBadge>Context-aware</AiBadge>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto"
            onClick={() => brief.mutate()}
            disabled={brief.isPending}
          >
            <RefreshCw className={brief.isPending ? "size-4 animate-spin" : "size-4"} aria-hidden />
            Refresh
          </Button>
        </div>

        <div className="mt-4">
          {brief.isPending ? (
            <p className="animate-pulse text-sm text-muted-foreground">
              AI is analysing your workload...
            </p>
          ) : brief.isError ? (
            <ErrorState message={errorMessage(brief.error)} onRetry={() => brief.mutate()} />
          ) : brief.data?.recommendation ? (
            <p className="text-[15px] leading-relaxed text-foreground">
              {brief.data.recommendation}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No recommendation available yet.</p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={!brief.data?.recommendation || !priorityTasks.length}
            onClick={() => {
              const target = priorityTasks[0];
              if (!target) return;
              updateTask(target.id, { status: "In Progress" });
              toast.success(`Applied: "${target.title}" set to In Progress`, {
                description: "You stay in control — you can change this at any time.",
              });
            }}
          >
            Apply recommendation
          </Button>
          <Button size="sm" variant="outline" onClick={() => navigate({ to: "/planner" })}>
            Re-plan my day
          </Button>
          <Button size="sm" variant="ghost" onClick={() => navigate({ to: "/tasks" })}>
            Review tasks
          </Button>
        </div>
        <AiDisclaimer className="mt-4" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Productivity summary">
        <StatCard
          label="Tasks today"
          value={String(dueToday.length)}
          hint={`${openTasks.length} still open`}
          icon={<ListTodo className="size-4" aria-hidden />}
        />
        <StatCard
          label="High priority"
          value={String(openTasks.filter((t) => t.priority === "High" || t.priority === "Critical").length)}
          hint="Needs focused work"
          icon={<Flame className="size-4" aria-hidden />}
        />
        <StatCard
          label="Completed"
          value={String(completed.length)}
          hint="Nice momentum"
          icon={<CheckCircle2 className="size-4" aria-hidden />}
        />
        <StatCard
          label="Focus time"
          value={formatDuration(focusMinutes)}
          hint="Protected blocks today"
          icon={<Clock className="size-4" aria-hidden />}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="surface-card p-5 lg:col-span-3" aria-label="Today's schedule">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Today&apos;s schedule</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/calendar" })}>
              Open calendar
            </Button>
          </div>
          {todaysEvents.length ? (
            <ol className="mt-4 space-y-1.5">
              {todaysEvents.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => setEditing(event)}
                    className="flex w-full items-center gap-3 rounded-lg border border-transparent px-2.5 py-2.5 text-left transition-colors hover:border-border hover:bg-secondary/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <span className="w-12 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
                      {event.start}
                    </span>
                    <span
                      className={`h-8 w-1 shrink-0 rounded-full bg-event-${event.type}`}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {event.title}
                      </span>
                      <span className="block text-xs text-muted-foreground capitalize">
                        {event.type} · {formatDuration(durationBetween(event.start, event.end))}
                      </span>
                    </span>
                    {event.priority ? <PriorityBadge priority={event.priority} /> : null}
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="Nothing scheduled today"
                description="Use the AI Planner to build a realistic schedule around your meetings."
                action={
                  <Button size="sm" onClick={() => navigate({ to: "/planner" })}>
                    Generate a schedule
                  </Button>
                }
              />
            </div>
          )}
        </section>

        <div className="space-y-6 lg:col-span-2">
          <section className="surface-card p-5" aria-label="Priority tasks">
            <h2 className="text-sm font-semibold text-foreground">Priority tasks</h2>
            {priorityTasks.length ? (
              <ul className="mt-4 space-y-3">
                {priorityTasks.map((task) => (
                  <li key={task.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>Due {formatDueDate(task.dueDate)}</span>
                      <span>{formatDuration(task.durationMinutes)}</span>
                      <StatusBadge status={task.status} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No high-priority work open. Add a task to get started.
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => navigate({ to: "/tasks" })}
            >
              Manage tasks
            </Button>
          </section>

          <section className="surface-card p-5" aria-label="AI insights">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">AI insights</h2>
              <AiBadge>Live</AiBadge>
            </div>
            {brief.isPending ? (
              <div className="mt-4 space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-4 animate-pulse rounded bg-secondary" />
                ))}
              </div>
            ) : brief.data?.insights.length ? (
              <ul className="mt-4 space-y-3">
                {brief.data.insights.map((insight) => (
                  <li key={insight} className="flex gap-2 text-sm text-foreground/85">
                    <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Insights will appear once the AI has analysed your day.
              </p>
            )}
            <AiDisclaimer className="mt-4" />
          </section>
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit schedule item</DialogTitle>
            <DialogDescription>Adjust the time or title of this calendar item.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                updateEvent(editing.id, {
                  title: String(data.get("title") || editing.title),
                  start: String(data.get("start") || editing.start),
                  end: String(data.get("end") || editing.end),
                });
                setEditing(null);
                toast.success("Schedule item updated");
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="ev-title">Title</Label>
                <Input id="ev-title" name="title" defaultValue={editing.title} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ev-start">Start</Label>
                  <Input id="ev-start" name="start" type="time" defaultValue={editing.start} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ev-end">End</Label>
                  <Input id="ev-end" name="end" type="time" defaultValue={editing.end} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
