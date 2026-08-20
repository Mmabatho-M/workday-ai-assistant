import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AlertTriangle, CalendarPlus, RefreshCw, Trash2, WandSparkles } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AiBadge,
  AiDisclaimer,
  AiReasoning,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  PriorityBadge,
} from "@/components/ui-bits";
import { generateSchedule } from "@/lib/ai.functions";
import { useStore } from "@/lib/store";
import { PRIORITIES, formatDuration, isoDate, type EventType } from "@/lib/demo-data";
import { durationBetween, errorMessage } from "@/lib/time";
import type { PlanResult } from "@/lib/ai-schemas";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Planner | AI Workday Copilot" },
      {
        name: "description",
        content:
          "Describe your workload and let AI build a realistic daily or weekly schedule that respects your meetings, breaks and focus time.",
      },
      { property: "og:title", content: "AI Planner | AI Workday Copilot" },
      {
        property: "og:description",
        content: "AI-generated day and week schedules with conflict detection and reasoning.",
      },
    ],
  }),
  component: PlannerPage,
});

type ItemRef = { dayIndex: number; itemIndex: number };

function eventTypeFor(priority: string): EventType {
  const p = priority.toLowerCase();
  if (p === "fixed") return "meeting";
  if (p === "critical" || p === "high") return "focus";
  if (p === "low") return "break";
  return "task";
}

function PlannerPage() {
  const navigate = useNavigate();
  const { tasks, events, replaceDayEvents } = useStore();
  const [workload, setWorkload] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [focusPreference, setFocusPreference] = useState("Morning (deep work before lunch)");
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [editing, setEditing] = useState<ItemRef | null>(null);
  const [lastRange, setLastRange] = useState<"day" | "week">("day");

  const run = useServerFn(generateSchedule);
  const generate = useMutation({
    mutationFn: async (range: "day" | "week") => {
      setLastRange(range);
      return run({
        data: {
          range,
          workload,
          startTime,
          endTime,
          breakMinutes,
          focusPreference,
          tasks: tasks
            .filter((t) => t.status !== "Completed")
            .map((t) => ({
              id: t.id,
              title: t.title,
              priority: t.priority,
              status: t.status,
              dueDate: t.dueDate,
              durationMinutes: t.durationMinutes,
              notes: t.notes || undefined,
            })),
          events: events
            .filter((e) => e.type === "meeting" || e.type === "break")
            .map((e) => ({
              title: e.title,
              date: e.date,
              start: e.start,
              end: e.end,
              type: e.type,
            })),
        },
      });
    },
    onSuccess: (data) => setPlan(data),
  });

  const editingItem =
    editing && plan ? plan.days[editing.dayIndex]?.items[editing.itemIndex] : undefined;

  function patchItem(ref: ItemRef, patch: { title?: string; start?: string; end?: string }) {
    setPlan((current) => {
      if (!current) return current;
      const days = current.days.map((day, di) =>
        di !== ref.dayIndex
          ? day
          : {
              ...day,
              items: day.items.map((item, ii) =>
                ii !== ref.itemIndex
                  ? item
                  : {
                      ...item,
                      ...patch,
                      durationMinutes: durationBetween(
                        patch.start ?? item.start,
                        patch.end ?? item.end,
                      ),
                    },
              ),
            },
      );
      return { ...current, days };
    });
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="AI Planner"
        subtitle="Describe your workload — AI turns it into a realistic schedule around your fixed commitments."
        actions={
          plan ? (
            <Button
              variant="ghost"
              onClick={() => {
                setPlan(null);
                generate.reset();
                toast.info("Schedule cleared");
              }}
            >
              <Trash2 className="size-4" aria-hidden /> Clear schedule
            </Button>
          ) : null
        }
      />

      <section className="surface-card p-5 sm:p-6" aria-label="Workload input">
        <div className="space-y-2">
          <Label htmlFor="workload">Your workload</Label>
          <Textarea
            id="workload"
            rows={5}
            value={workload}
            onChange={(e) => setWorkload(e.target.value)}
            placeholder="Tell me what you need to accomplish today..."
          />
          <p className="text-xs text-muted-foreground">
            Your {tasks.filter((t) => t.status !== "Completed").length} open tasks and existing
            meetings are included automatically.
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="start">Work start</Label>
            <Input id="start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end">Work end</Label>
            <Input id="end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="break">Break duration (min)</Label>
            <Input
              id="break"
              type="number"
              min={0}
              step={5}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="focus">Preferred focus period</Label>
            <Select value={focusPreference} onValueChange={setFocusPreference}>
              <SelectTrigger id="focus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Morning (deep work before lunch)">Morning</SelectItem>
                <SelectItem value="Midday (focus block around lunch)">Midday</SelectItem>
                <SelectItem value="Afternoon (deep work after lunch)">Afternoon</SelectItem>
                <SelectItem value="No preference">No preference</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => generate.mutate("day")} disabled={generate.isPending}>
            <WandSparkles className="size-4" aria-hidden /> Generate today&apos;s schedule
          </Button>
          <Button
            variant="outline"
            onClick={() => generate.mutate("week")}
            disabled={generate.isPending}
          >
            Generate weekly schedule
          </Button>
          <Button variant="ghost" onClick={() => navigate({ to: "/calendar" })}>
            View calendar
          </Button>
        </div>
        <AiDisclaimer
          className="mt-4"
          text="AI-generated schedules may contain errors or miss context. Review the plan before applying it to your calendar."
        />
      </section>

      {generate.isPending ? <LoadingBlock message="Generating your schedule..." /> : null}
      {generate.isError ? (
        <ErrorState
          message={errorMessage(generate.error)}
          onRetry={() => generate.mutate(lastRange)}
        />
      ) : null}

      {!plan && !generate.isPending && !generate.isError ? (
        <EmptyState
          icon={<WandSparkles className="size-5" aria-hidden />}
          title="No schedule generated yet"
          description="Describe your workload above, then generate a day or week plan. AI will protect your meetings and flag anything that doesn't fit."
        />
      ) : null}

      {plan ? (
        <section className="space-y-5" aria-label="Generated schedule">
          <div className="ai-panel p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">AI plan summary</h2>
              <AiBadge>Structured output</AiBadge>
              <div className="ml-auto flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    const items = plan.days[0]?.items ?? [];
                    if (!items.length) return;
                    replaceDayEvents(
                      isoDate(0),
                      items.map((i) => {
                        const known = PRIORITIES.find((p) => p === i.priority);
                        return {
                          title: i.title,
                          start: i.start,
                          end: i.end,
                          type: eventTypeFor(i.priority),
                          ...(known ? { priority: known } : {}),
                        };
                      }),
                    );
                    toast.success("Schedule applied to today's calendar", {
                      description: "Existing items for today were replaced. Nothing else changed.",
                    });
                    navigate({ to: "/calendar" });
                  }}
                >
                  <CalendarPlus className="size-4" aria-hidden /> Apply schedule
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => generate.mutate(lastRange)}
                  disabled={generate.isPending}
                >
                  <RefreshCw className="size-4" aria-hidden /> Regenerate
                </Button>
              </div>
            </div>
            {plan.summary ? (
              <p className="mt-3 text-sm text-foreground/85">{plan.summary}</p>
            ) : null}
            {plan.conflicts.length ? (
              <div className="mt-4 rounded-lg border border-warning/40 bg-warning/10 p-3">
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <AlertTriangle className="size-4 text-warning" aria-hidden />
                  Conflicts &amp; what to move
                </p>
                <ul className="mt-2 space-y-1 text-xs text-foreground/80">
                  {plan.conflicts.map((c) => (
                    <li key={c}>• {c}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {plan.days.map((day, dayIndex) => (
            <div key={`${day.label}-${dayIndex}`} className="surface-card p-5">
              <h3 className="text-sm font-semibold text-foreground">{day.label}</h3>
              <ol className="mt-4 space-y-3">
                {day.items.map((item, itemIndex) => (
                  <li
                    key={`${item.start}-${item.title}`}
                    className="relative rounded-xl border border-border p-4 pl-5"
                  >
                    <span
                      className={`absolute top-4 bottom-4 left-0 w-1 rounded-full bg-event-${eventTypeFor(item.priority)}`}
                      aria-hidden
                    />
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground tabular-nums">
                          {item.start}–{item.end}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-foreground">{item.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={item.priority} />
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(item.durationMinutes || durationBetween(item.start, item.end))}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <AiReasoning
                        label="Why this slot?"
                        explanation={item.reasoning}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing({ dayIndex, itemIndex })}
                      >
                        Edit / move
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
          <AiDisclaimer />
        </section>
      ) : null}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit scheduled item</DialogTitle>
            <DialogDescription>
              You stay in control — adjust the AI&apos;s suggestion before applying it.
            </DialogDescription>
          </DialogHeader>
          {editing && editingItem ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const data = new FormData(e.currentTarget);
                patchItem(editing, {
                  title: String(data.get("title") || editingItem.title),
                  start: String(data.get("start") || editingItem.start),
                  end: String(data.get("end") || editingItem.end),
                });
                setEditing(null);
                toast.success("Item updated");
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="pl-title">Task</Label>
                <Input id="pl-title" name="title" defaultValue={editingItem.title} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="pl-start">Start</Label>
                  <Input id="pl-start" name="start" type="time" defaultValue={editingItem.start} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pl-end">End</Label>
                  <Input id="pl-end" name="end" type="time" defaultValue={editingItem.end} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
