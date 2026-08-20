import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { EmptyState, PageHeader, PriorityBadge } from "@/components/ui-bits";
import { useStore } from "@/lib/store";
import { formatDuration, isoDate, type EventType } from "@/lib/demo-data";
import { dayLabel, durationBetween, weekDates } from "@/lib/time";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar | AI Workday Copilot" },
      {
        name: "description",
        content:
          "See your meetings, focus blocks and AI-scheduled tasks across the week, and adjust any slot by hand.",
      },
      { property: "og:title", content: "Calendar | AI Workday Copilot" },
      {
        property: "og:description",
        content: "Day and week views of your AI-assisted workday schedule.",
      },
    ],
  }),
  component: CalendarPage,
});

const EVENT_TYPES: EventType[] = ["meeting", "task", "focus", "break"];

function typeLabel(type: EventType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function CalendarPage() {
  const { events, addEvent, deleteEvent, hydrated } = useStore();
  const [view, setView] = useState<"day" | "week">("day");
  const [selectedDate, setSelectedDate] = useState(isoDate(0));
  const [open, setOpen] = useState(false);

  const dates = view === "day" ? [selectedDate] : weekDates(new Date(`${selectedDate}T00:00:00`));

  return (
    <div className="space-y-7">
      <PageHeader
        title="Calendar"
        subtitle="Your meetings, focus blocks and scheduled tasks — fully editable."
        actions={
          <>
            <div className="flex rounded-lg border border-border p-0.5">
              {(["day", "week"] as const).map((v) => (
                <Button
                  key={v}
                  size="sm"
                  variant={view === v ? "secondary" : "ghost"}
                  onClick={() => setView(v)}
                >
                  {v === "day" ? "Day" : "Week"}
                </Button>
              ))}
            </div>
            <Input
              type="date"
              className="w-auto"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value || isoDate(0))}
              aria-label="Selected date"
            />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4" aria-hidden /> Add event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add calendar event</DialogTitle>
                  <DialogDescription>
                    Manually block time — AI plans respect meetings and breaks you add here.
                  </DialogDescription>
                </DialogHeader>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const data = new FormData(e.currentTarget);
                    const start = String(data.get("start"));
                    const end = String(data.get("end"));
                    if (durationBetween(start, end) <= 0) {
                      toast.error("End time must be after the start time");
                      return;
                    }
                    addEvent({
                      title: String(data.get("title")),
                      date: String(data.get("date")),
                      start,
                      end,
                      type: String(data.get("type")) as EventType,
                    });
                    setOpen(false);
                    toast.success("Event added");
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="ev-title">Title</Label>
                    <Input id="ev-title" name="title" required placeholder="Design review" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="ev-date">Date</Label>
                      <Input id="ev-date" name="date" type="date" defaultValue={selectedDate} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ev-type">Type</Label>
                      <Select name="type" defaultValue="meeting">
                        <SelectTrigger id="ev-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {EVENT_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {typeLabel(t)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ev-start">Start</Label>
                      <Input id="ev-start" name="start" type="time" defaultValue="09:00" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ev-end">End</Label>
                      <Input id="ev-end" name="end" type="time" defaultValue="10:00" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Add event
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </>
        }
      />

      <div className={view === "week" ? "grid gap-4 lg:grid-cols-2" : "space-y-4"}>
        {dates.map((date) => {
          const dayEvents = events
            .filter((e) => e.date === date)
            .sort((a, b) => a.start.localeCompare(b.start));
          return (
            <section key={date} className="surface-card p-5" aria-label={dayLabel(date)}>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">{dayLabel(date)}</h2>
                <span className="text-xs text-muted-foreground">
                  {dayEvents.length} {dayEvents.length === 1 ? "item" : "items"}
                </span>
              </div>
              {hydrated && !dayEvents.length ? (
                <p className="mt-4 text-sm text-muted-foreground">Nothing scheduled.</p>
              ) : (
                <ol className="mt-4 space-y-2.5">
                  {dayEvents.map((e) => (
                    <li
                      key={e.id}
                      className="relative flex items-start gap-3 rounded-xl border border-border p-3.5 pl-5"
                    >
                      <span
                        className={`absolute top-3.5 bottom-3.5 left-0 w-1 rounded-full bg-event-${e.type}`}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-muted-foreground tabular-nums">
                          {e.start}–{e.end} · {formatDuration(durationBetween(e.start, e.end))}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                          {e.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{typeLabel(e.type)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {e.priority ? <PriorityBadge priority={e.priority} /> : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${e.title}`}
                          onClick={() => {
                            deleteEvent(e.id);
                            toast.success("Event removed");
                          }}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>

      {hydrated && !events.length ? (
        <EmptyState
          icon={<CalendarDays className="size-5" aria-hidden />}
          title="Your calendar is empty"
          description="Add an event manually, or generate a schedule in the AI Planner and apply it here."
        />
      ) : null}
    </div>
  );
}
