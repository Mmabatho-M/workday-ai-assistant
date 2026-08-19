export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function durationBetween(start: string, end: string): number {
  return Math.max(0, toMinutes(end) - toMinutes(start));
}

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Unexpected error. Please try again.";
}

export function weekDates(base = new Date()): string[] {
  const d = new Date(base);
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((day + 6) % 7));
  return Array.from({ length: 5 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return x.toISOString().slice(0, 10);
  });
}

export function dayLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
}
