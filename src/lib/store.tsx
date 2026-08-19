import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  demoEvents,
  demoTasks,
  isoDate,
  type CalendarEvent,
  type Task,
} from "./demo-data";

const STORAGE_KEY = "workday-copilot-v1";

type State = { tasks: Task[]; events: CalendarEvent[] };

type Store = State & {
  hydrated: boolean;
  addTask: (task: Omit<Task, "id">) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  reorderTasks: (ids: string[]) => void;
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  replaceDayEvents: (date: string, events: Array<Omit<CalendarEvent, "id" | "date">>) => void;
  resetDemoData: () => void;
};

const StoreContext = createContext<Store | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ tasks: demoTasks, events: demoEvents });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as State;
        if (Array.isArray(parsed.tasks) && Array.isArray(parsed.events)) setState(parsed);
      }
    } catch {
      /* fall back to demo data */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — in-memory only */
    }
  }, [state, hydrated]);

  const value = useMemo<Store>(
    () => ({
      ...state,
      hydrated,
      addTask: (task) => {
        const created: Task = { ...task, id: uid() };
        setState((s) => ({ ...s, tasks: [created, ...s.tasks] }));
        return created;
      },
      updateTask: (id, patch) =>
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTask: (id) =>
        setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),
      toggleTask: (id) =>
        setState((s) => ({
          ...s,
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status: t.status === "Completed" ? "In Progress" : "Completed" }
              : t,
          ),
        })),
      reorderTasks: (ids) =>
        setState((s) => {
          const rank = new Map(ids.map((id, i) => [id, i]));
          const sorted = [...s.tasks].sort(
            (a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999),
          );
          return { ...s, tasks: sorted };
        }),
      addEvent: (event) =>
        setState((s) => ({ ...s, events: [...s.events, { ...event, id: uid() }] })),
      updateEvent: (id, patch) =>
        setState((s) => ({
          ...s,
          events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      deleteEvent: (id) =>
        setState((s) => ({ ...s, events: s.events.filter((e) => e.id !== id) })),
      replaceDayEvents: (date, items) =>
        setState((s) => ({
          ...s,
          events: [
            ...s.events.filter((e) => e.date !== date),
            ...items.map((i) => ({ ...i, date, id: uid() })),
          ],
        })),
      resetDemoData: () => setState({ tasks: demoTasks, events: demoEvents }),
    }),
    [state, hydrated],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside AppStoreProvider");
  return ctx;
}

/** Compact textual snapshot of app state used as AI context. */
export function buildAiContext(tasks: Task[], events: CalendarEvent[]): string {
  const today = isoDate(0);
  const open = tasks.filter((t) => t.status !== "Completed");
  return [
    `Today's date: ${today}`,
    `Open tasks:`,
    open.length
      ? open
          .map(
            (t) =>
              `- ${t.title} | ${t.priority} priority | ${t.status} | due ${t.dueDate} | est ${t.durationMinutes} min${t.notes ? ` | ${t.notes}` : ""}`,
          )
          .join("\n")
      : "- none",
    `Completed today: ${tasks.filter((t) => t.status === "Completed").length}`,
    `Today's calendar:`,
    events.filter((e) => e.date === today).length
      ? events
          .filter((e) => e.date === today)
          .sort((a, b) => a.start.localeCompare(b.start))
          .map((e) => `- ${e.start}-${e.end} ${e.title} (${e.type})`)
          .join("\n")
      : "- nothing scheduled",
  ].join("\n");
}
