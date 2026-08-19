import { askChat, askJson, AiError } from "./ai.server";
import {
  PLANNER_SYSTEM,
  PRIORITIZE_SYSTEM,
  RESEARCH_SYSTEM,
  chatSystemPrompt,
  plannerUserPrompt,
  prioritizeUserPrompt,
  researchUserPrompt,
  type PromptEvent,
  type PromptTask,
} from "./ai-prompts";
import { planResultSchema, prioritizeResultSchema, researchResultSchema } from "./ai-schemas";

export type PlannerArgs = {
  workload: string;
  range: "day" | "week";
  startTime: string;
  endTime: string;
  breakMinutes: number;
  focusPreference: string;
  tasks: PromptTask[];
  events: PromptEvent[];
};
export type PrioritizeArgs = { tasks: PromptTask[]; today: string };
export type ResearchArgs = { mode: string; input: string };
export type ChatArgs = {
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  context: string;
};

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function runPlanner(args: PlannerArgs) {
  const raw = await askJson<unknown>(PLANNER_SYSTEM, plannerUserPrompt(args));
  const parsed = planResultSchema.safeParse(raw);
  if (!parsed.success)
    throw new AiError("The generated schedule was incomplete. Please regenerate.", 502);

  // Validate AI output before it reaches the UI: drop malformed times / ordering.
  const days = parsed.data.days
    .map((day) => ({
      label: day.label,
      items: day.items
        .filter((i) => TIME_RE.test(i.start) && TIME_RE.test(i.end) && i.title.trim().length > 0)
        .sort((a, b) => a.start.localeCompare(b.start)),
    }))
    .filter((d) => d.items.length > 0);

  if (!days.length) throw new AiError("The AI could not produce a usable schedule.", 502);
  return { ...parsed.data, days };
}

export async function runPrioritize(args: PrioritizeArgs) {
  const raw = await askJson<unknown>(
    PRIORITIZE_SYSTEM,
    prioritizeUserPrompt(args.tasks, args.today),
  );
  const parsed = prioritizeResultSchema.safeParse(raw);
  if (!parsed.success) throw new AiError("The AI ranking was unreadable. Please try again.", 502);

  const known = new Set(args.tasks.map((t) => t.id));
  const order = parsed.data.order
    .filter((o) => known.has(o.id))
    .map((o, index) => ({ ...o, rank: index + 1 }));
  if (!order.length) throw new AiError("The AI did not return a valid ranking.", 502);
  return { summary: parsed.data.summary, order };
}

export async function runResearch(args: ResearchArgs) {
  const raw = await askJson<unknown>(RESEARCH_SYSTEM, researchUserPrompt(args.mode, args.input));
  const parsed = researchResultSchema.safeParse(raw);
  if (!parsed.success) throw new AiError("The analysis came back malformed. Please try again.", 502);
  if (!parsed.data.executiveSummary && !parsed.data.keyFindings.length)
    throw new AiError("The AI returned no usable analysis.", 502);
  return parsed.data;
}

export async function runChat(args: ChatArgs) {
  const reply = await askChat(chatSystemPrompt(args.context), args.messages);
  return { reply };
}
