import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ListTodo, Pencil, Plus, Search, Sparkles, Trash2, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AiBadge,
  AiDisclaimer,
  AiReasoning,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  PriorityBadge,
  StatusBadge,
} from "@/components/ui-bits";
import { prioritizeTasks } from "@/lib/ai.functions";
import { useStore } from "@/lib/store";
import {
  PRIORITIES,
  STATUSES,
  formatDueDate,
  formatDuration,
  isoDate,
  type Priority,
  type Status,
  type Task,
} from "@/lib/demo-data";
import { errorMessage } from "@/lib/time";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "My Tasks | AI Workday Copilot" },
      {
        name: "description",
        content:
          "Create, edit and filter your work tasks, then let AI recommend the order to tackle them in and explain why.",
      },
      { property: "og:title", content: "My Tasks | AI Workday Copilot" },
      {
        property: "og:description",
        content: "Task management with AI prioritisation and transparent reasoning.",
      },
    ],
  }),
  component: TasksPage,
});

type Draft = {
  title: string;
  notes: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  durationMinutes: number;
};

const emptyDraft: Draft = {
  title: "",
  notes: "",
  priority: "Medium",
  status: "Not Started",
  dueDate: isoDate(0),
  durationMinutes: 30,
};

function TasksPage() {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, reorderTasks } = useStore();
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [confirmDelete, setConfirmDelete] = useState<Task | null>(null);

  const filtered = useMemo(
    () =>
      tasks.filter((t) => {
        const q = query.trim().toLowerCase();
        const matchesQuery =
          !q || t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q);
        const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
        const matchesStatus = statusFilter === "all" || t.status === statusFilter;
        return matchesQuery && matchesPriority && matchesStatus;
      }),
    [tasks, query, priorityFilter, statusFilter],
  );

  const runPrioritize = useServerFn(prioritizeTasks);
  const prioritize = useMutation({
    mutationFn: async () => {
      const open = tasks.filter((t) => t.status !== "Completed");
      if (!open.length) throw new Error("There are no open tasks to prioritise.");
      return runPrioritize({
        data: {
          today: isoDate(0),
          tasks: open.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            status: t.status,
            dueDate: t.dueDate,
            durationMinutes: t.durationMinutes,
            notes: t.notes || undefined,
          })),
        },
      });
    },
  });

  function openCreate() {
    setEditingId(null);
    setDraft({ ...emptyDraft });
    setDialogOpen(true);
  }

  function openEdit(task: Task) {
    setEditingId(task.id);
    setDraft({
      title: task.title,
      notes: task.notes,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      durationMinutes: task.durationMinutes,
    });
    setDialogOpen(true);
  }

  function submit() {
    if (!draft.title.trim()) {
      toast.error("Please give the task a title.");
      return;
    }
    if (editingId) {
      updateTask(editingId, draft);
      toast.success("Task updated");
    } else {
      addTask(draft);
      toast.success("Task added");
    }
    setDialogOpen(false);
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="My Tasks"
        subtitle="Everything on your plate, with AI help deciding what comes first."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => prioritize.mutate()}
              disabled={prioritize.isPending}
            >
              <WandSparkles className="size-4" aria-hidden />
              {prioritize.isPending ? "Prioritising..." : "Prioritise with AI"}
            </Button>
            <Button onClick={openCreate}>
              <Plus className="size-4" aria-hidden /> Add task
            </Button>
          </>
        }
      />

      {prioritize.isPending ? <LoadingBlock message="AI is analysing your workload..." /> : null}
      {prioritize.isError ? (
        <ErrorState message={errorMessage(prioritize.error)} onRetry={() => prioritize.mutate()} />
      ) : null}
      {prioritize.data ? (
        <section className="ai-panel p-5" aria-label="AI recommended order">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">AI recommended order</h2>
            <AiBadge>Prioritisation</AiBadge>
            <div className="ml-auto flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  reorderTasks(prioritize.data.order.map((o) => o.id));
                  toast.success("Task order applied", {
                    description: "You can still reorder or ignore this at any time.",
                  });
                }}
              >
                Apply order
              </Button>
              <Button size="sm" variant="ghost" onClick={() => prioritize.reset()}>
                Dismiss
              </Button>
            </div>
          </div>
          {prioritize.data.summary ? (
            <p className="mt-3 text-sm text-foreground/85">{prioritize.data.summary}</p>
          ) : null}
          <ol className="mt-4 space-y-3">
            {prioritize.data.order.map((item) => (
              <li key={item.id} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {item.rank}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                    <div className="mt-2">
                      <AiReasoning
                        label="Why did AI prioritise this?"
                        factors={item.factors}
                      />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <AiDisclaimer className="mt-4" />
        </section>
      ) : null}

      <section className="surface-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks and notes"
              aria-label="Search tasks"
              className="pl-9"
            />
          </div>
          <div className="flex gap-3">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40" aria-label="Filter by priority">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-5">
          {filtered.length ? (
            <ul className="space-y-3">
              {filtered.map((task) => (
                <li
                  key={task.id}
                  className="rounded-xl border border-border p-4 transition-shadow hover:shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.status === "Completed"}
                      onCheckedChange={() => toggleTask(task.id)}
                      aria-label={`Mark "${task.title}" ${task.status === "Completed" ? "incomplete" : "complete"}`}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={
                            task.status === "Completed"
                              ? "text-sm font-medium text-muted-foreground line-through"
                              : "text-sm font-medium text-foreground"
                          }
                        >
                          {task.title}
                        </p>
                        <PriorityBadge priority={task.priority} />
                        <StatusBadge status={task.status} />
                      </div>
                      {task.notes ? (
                        <p className="mt-1.5 text-xs text-muted-foreground">{task.notes}</p>
                      ) : null}
                      <p className="mt-2 text-xs text-muted-foreground">
                        Due {formatDueDate(task.dueDate)} · {formatDuration(task.durationMinutes)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${task.title}`}
                            onClick={() => openEdit(task)}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit task</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${task.title}`}
                            onClick={() => setConfirmDelete(task)}
                          >
                            <Trash2 className="size-4 text-destructive" aria-hidden />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete task</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : tasks.length ? (
            <EmptyState
              icon={<Search className="size-5" aria-hidden />}
              title="No tasks match your filters"
              description="Try a different search term, or clear the priority and status filters."
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setPriorityFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<ListTodo className="size-5" aria-hidden />}
              title="No tasks yet"
              description="Add your first task or ask AI to help you create a plan."
              action={
                <Button size="sm" onClick={openCreate}>
                  <Plus className="size-4" aria-hidden /> Add your first task
                </Button>
              }
            />
          )}
        </div>
      </section>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit task" : "New task"}</DialogTitle>
            <DialogDescription>
              Give the AI good inputs — deadlines and estimates make its plans far more useful.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="task-title">Task name</Label>
              <Input
                id="task-title"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="e.g. Draft Q4 client proposal"
                required
                autoFocus
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={draft.priority}
                  onValueChange={(v) => setDraft({ ...draft, priority: v as Priority })}
                >
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-status">Status</Label>
                <Select
                  value={draft.status}
                  onValueChange={(v) => setDraft({ ...draft, status: v as Status })}
                >
                  <SelectTrigger id="task-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-due">Due date</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={draft.dueDate}
                  onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-duration">Estimated minutes</Label>
                <Input
                  id="task-duration"
                  type="number"
                  min={5}
                  step={5}
                  value={draft.durationMinutes}
                  onChange={(e) =>
                    setDraft({ ...draft, durationMinutes: Number(e.target.value) || 5 })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-notes">Notes</Label>
              <Textarea
                id="task-notes"
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                placeholder="Context, dependencies, links..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <Sparkles className="size-4" aria-hidden />
                {editingId ? "Save changes" : "Add task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{confirmDelete?.title}&quot; will be removed permanently. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) {
                  deleteTask(confirmDelete.id);
                  toast.success("Task deleted");
                }
                setConfirmDelete(null);
              }}
            >
              Delete task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
