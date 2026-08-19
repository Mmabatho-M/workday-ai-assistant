export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Status = "Not Started" | "In Progress" | "Completed";
export type EventType = "meeting" | "task" | "focus" | "break";

export type Task = {
  id: string;
  title: string;
  notes: string;
  priority: Priority;
  status: Status;
  dueDate: string; // yyyy-mm-dd
  durationMinutes: number;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string; // yyyy-mm-dd
  start: string; // HH:MM
  end: string; // HH:MM
  type: EventType;
  priority?: Priority;
};

export const PRIORITIES: Priority[] = ["Critical", "High", "Medium", "Low"];
export const STATUSES: Status[] = ["Not Started", "In Progress", "Completed"];

export function isoDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export function formatDueDate(iso: string): string {
  if (iso === isoDate(0)) return "Today";
  if (iso === isoDate(1)) return "Tomorrow";
  if (iso === isoDate(-1)) return "Yesterday";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** Realistic sample workplace data — easy to edit or replace. */
export const demoTasks: Task[] = [
  {
    id: "t1",
    title: "Complete quarterly report",
    notes: "Pull Q3 revenue figures from finance dashboard before writing the narrative section.",
    priority: "High",
    status: "In Progress",
    dueDate: isoDate(1),
    durationMinutes: 120,
  },
  {
    id: "t2",
    title: "Prepare client presentation",
    notes: "Northwind account — renewal deck, 12 slides max.",
    priority: "High",
    status: "Not Started",
    dueDate: isoDate(3),
    durationMinutes: 90,
  },
  {
    id: "t3",
    title: "Reply to emails",
    notes: "Clear inbox to under 10 threads.",
    priority: "Medium",
    status: "Not Started",
    dueDate: isoDate(0),
    durationMinutes: 30,
  },
  {
    id: "t4",
    title: "Research competitors",
    notes: "Three competitors: pricing, positioning, onboarding flow.",
    priority: "Medium",
    status: "Not Started",
    dueDate: isoDate(2),
    durationMinutes: 60,
  },
  {
    id: "t5",
    title: "Review team submissions",
    notes: "Four pull requests and two design reviews waiting.",
    priority: "High",
    status: "Not Started",
    dueDate: isoDate(0),
    durationMinutes: 45,
  },
  {
    id: "t6",
    title: "Update project documentation",
    notes: "Onboarding guide is two releases behind.",
    priority: "Low",
    status: "Not Started",
    dueDate: isoDate(7),
    durationMinutes: 60,
  },
  {
    id: "t7",
    title: "Send client proposal follow-up",
    notes: "",
    priority: "Critical",
    status: "Completed",
    dueDate: isoDate(0),
    durationMinutes: 20,
  },
  {
    id: "t8",
    title: "Approve design handoff",
    notes: "",
    priority: "Medium",
    status: "Completed",
    dueDate: isoDate(0),
    durationMinutes: 15,
  },
];

export const demoEvents: CalendarEvent[] = [
  {
    id: "e1",
    title: "Email review",
    date: isoDate(0),
    start: "09:00",
    end: "09:30",
    type: "task",
    priority: "Medium",
  },
  { id: "e2", title: "Team meeting", date: isoDate(0), start: "10:00", end: "11:00", type: "meeting" },
  {
    id: "e3",
    title: "Client proposal — focus block",
    date: isoDate(0),
    start: "11:00",
    end: "12:30",
    type: "focus",
    priority: "High",
  },
  { id: "e4", title: "Lunch", date: isoDate(0), start: "13:00", end: "14:00", type: "break" },
  { id: "e5", title: "Client call", date: isoDate(0), start: "14:00", end: "14:30", type: "meeting" },
  {
    id: "e6",
    title: "Research competitors",
    date: isoDate(0),
    start: "14:45",
    end: "15:30",
    type: "task",
    priority: "Medium",
  },
  {
    id: "e7",
    title: "Presentation preparation",
    date: isoDate(0),
    start: "15:30",
    end: "17:00",
    type: "focus",
    priority: "High",
  },
  { id: "e8", title: "Sprint planning", date: isoDate(1), start: "09:30", end: "10:30", type: "meeting" },
  {
    id: "e9",
    title: "Quarterly report writing",
    date: isoDate(1),
    start: "11:00",
    end: "13:00",
    type: "focus",
    priority: "High",
  },
  { id: "e10", title: "1:1 with manager", date: isoDate(2), start: "15:00", end: "15:30", type: "meeting" },
];
