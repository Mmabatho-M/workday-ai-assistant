import { z } from "zod";

const priority = z.enum(["Critical", "High", "Medium", "Low"]);

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: z.string(),
  status: z.string(),
  dueDate: z.string(),
  durationMinutes: z.number(),
  notes: z.string().optional(),
});

export const eventSchema = z.object({
  title: z.string(),
  date: z.string(),
  start: z.string(),
  end: z.string(),
  type: z.string(),
});

export const plannerInputSchema = z.object({
  workload: z.string(),
  range: z.enum(["day", "week"]),
  startTime: z.string(),
  endTime: z.string(),
  breakMinutes: z.number(),
  focusPreference: z.string(),
  tasks: z.array(taskSchema),
  events: z.array(eventSchema),
});

export const prioritizeInputSchema = z.object({
  tasks: z.array(taskSchema).min(1),
  today: z.string(),
});

export const researchInputSchema = z.object({
  mode: z.string(),
  input: z.string().min(10),
});

export const chatInputSchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).min(1),
  context: z.string(),
});

/** Shapes returned to the client after validation of raw AI output. */
export const scheduleItemSchema = z.object({
  start: z.string(),
  end: z.string(),
  title: z.string(),
  priority: z.string(),
  durationMinutes: z.coerce.number().catch(0),
  reasoning: z.string().default(""),
});

export const planResultSchema = z.object({
  summary: z.string().default(""),
  conflicts: z.array(z.string()).default([]),
  days: z
    .array(
      z.object({
        label: z.string().default("Schedule"),
        items: z.array(scheduleItemSchema).default([]),
      }),
    )
    .default([]),
});

export const prioritizeResultSchema = z.object({
  summary: z.string().default(""),
  order: z
    .array(
      z.object({
        id: z.string().default(""),
        title: z.string(),
        rank: z.coerce.number().catch(0),
        reason: z.string().default(""),
        factors: z.array(z.string()).default([]),
      }),
    )
    .default([]),
});

export const researchResultSchema = z.object({
  executiveSummary: z.string().default(""),
  sourceNote: z.string().default(""),
  keyFindings: z.array(z.string()).default([]),
  insights: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  actionItems: z
    .array(
      z.object({
        title: z.string(),
        durationMinutes: z.coerce.number().catch(30),
        priority: priority.catch("Medium"),
      }),
    )
    .default([]),
});

export type PlanResult = z.infer<typeof planResultSchema>;
export type PrioritizeResult = z.infer<typeof prioritizeResultSchema>;
export type ResearchResult = z.infer<typeof researchResultSchema>;
