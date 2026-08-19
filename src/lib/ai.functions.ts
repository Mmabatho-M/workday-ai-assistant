import { createServerFn } from "@tanstack/react-start";
import {
  chatInputSchema,
  plannerInputSchema,
  prioritizeInputSchema,
  researchInputSchema,
} from "./ai-schemas";
import {
  runChat,
  runPlanner,
  runPrioritize,
  runResearch,
  type ChatArgs,
  type PlannerArgs,
  type PrioritizeArgs,
  type ResearchArgs,
} from "./ai-runners.server";

export const generateSchedule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => plannerInputSchema.parse(input) as PlannerArgs)
  .handler(async ({ data }) => runPlanner(data));

export const prioritizeTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => prioritizeInputSchema.parse(input) as PrioritizeArgs)
  .handler(async ({ data }) => runPrioritize(data));

export const analyzeResearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => researchInputSchema.parse(input) as ResearchArgs)
  .handler(async ({ data }) => runResearch(data));

export const chatWithCopilot = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => chatInputSchema.parse(input) as ChatArgs)
  .handler(async ({ data }) => runChat(data));
