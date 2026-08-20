import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ListPlus, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
} from "@/components/ui-bits";
import { analyzeResearch } from "@/lib/ai.functions";
import { useStore } from "@/lib/store";
import { isoDate } from "@/lib/demo-data";
import { errorMessage } from "@/lib/time";
import type { ResearchResult } from "@/lib/ai-schemas";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant | AI Workday Copilot" },
      {
        name: "description",
        content:
          "Summarise documents, extract key findings and turn workplace research into concrete action items with AI.",
      },
      { property: "og:title", content: "Research Assistant | AI Workday Copilot" },
      {
        property: "og:description",
        content: "Summarise, analyse and action workplace research without fabricated sources.",
      },
    ],
  }),
  component: ResearchPage,
});

const MODES = [
  { value: "Summarize", hint: "Condense long text into the essentials." },
  { value: "Key findings", hint: "Pull out the most decision-relevant points." },
  { value: "Compare options", hint: "Weigh alternatives described in your text." },
  { value: "Action plan", hint: "Turn the material into next steps." },
] as const;

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="surface-card p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-foreground/85">
        {items.map((i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ResearchPage() {
  const { addTask } = useStore();
  const [mode, setMode] = useState<string>(MODES[0].value);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ResearchResult | null>(null);

  const run = useServerFn(analyzeResearch);
  const analyze = useMutation({
    mutationFn: async () => run({ data: { mode, input } }),
    onSuccess: (data) => setResult(data),
  });

  const activeMode = MODES.find((m) => m.value === mode) ?? MODES[0];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Research Assistant"
        subtitle="Paste notes, an article, a report or meeting minutes — AI analyses only what you provide."
      />

      <section className="surface-card p-5 sm:p-6" aria-label="Research input">
        <div className="grid gap-4 sm:grid-cols-[16rem_1fr] sm:items-end">
          <div className="space-y-2">
            <Label htmlFor="mode">Analysis type</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger id="mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">{activeMode.hint}</p>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="material">Your material or question</Label>
          <Textarea
            id="material"
            rows={9}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste the text you want analysed, or describe the topic you need to understand…"
          />
          <p className="text-xs text-muted-foreground">
            {input.trim().length} characters · minimum 10
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            onClick={() => analyze.mutate()}
            disabled={analyze.isPending || input.trim().length < 10}
          >
            <Search className="size-4" aria-hidden /> Analyse with AI
          </Button>
          {result ? (
            <Button
              variant="ghost"
              onClick={() => {
                setResult(null);
                analyze.reset();
              }}
            >
              Clear result
            </Button>
          ) : null}
        </div>

        <div className="mt-4 flex items-start gap-1.5 rounded-lg border border-warning/40 bg-warning/10 p-3 text-[11px] leading-relaxed text-foreground/80">
          <ShieldAlert className="mt-px size-3.5 shrink-0 text-warning" aria-hidden />
          <span>
            This assistant does not browse the web and never invents citations. It analyses only the
            text you paste; anything not in your material is clearly framed as general knowledge that
            you must verify.
          </span>
        </div>
      </section>

      {analyze.isPending ? <LoadingBlock message="Analysing your material…" /> : null}
      {analyze.isError ? (
        <ErrorState message={errorMessage(analyze.error)} onRetry={() => analyze.mutate()} />
      ) : null}

      {!result && !analyze.isPending && !analyze.isError ? (
        <EmptyState
          icon={<Search className="size-5" aria-hidden />}
          title="No analysis yet"
          description="Choose an analysis type, paste your material, and AI will return a summary, key findings and suggested next steps."
        />
      ) : null}

      {result ? (
        <section className="space-y-4" aria-label="Analysis result">
          <div className="ai-panel p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">Executive summary</h2>
              <AiBadge>{mode}</AiBadge>
            </div>
            <p className="mt-3 text-sm whitespace-pre-wrap text-foreground/85">
              {result.executiveSummary}
            </p>
            {result.sourceNote ? (
              <p className="mt-3 text-xs text-muted-foreground">Sources: {result.sourceNote}</p>
            ) : null}
          </div>

          <Section title="Key findings" items={result.keyFindings} />
          <Section title="Insights" items={result.insights} />
          <Section title="Recommendations" items={result.recommendations} />

          {result.actionItems.length ? (
            <div className="surface-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">Suggested action items</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    result.actionItems.forEach((a) =>
                      addTask({
                        title: a.title,
                        notes: `From research: ${mode}`,
                        priority: a.priority,
                        status: "Not Started",
                        dueDate: isoDate(1),
                        durationMinutes: a.durationMinutes || 30,
                      }),
                    );
                    toast.success(`${result.actionItems.length} tasks added to My Tasks`);
                  }}
                >
                  <ListPlus className="size-4" aria-hidden /> Add all as tasks
                </Button>
              </div>
              <ul className="mt-4 space-y-2.5">
                {result.actionItems.map((a) => (
                  <li
                    key={a.title}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3.5"
                  >
                    <span className="text-sm font-medium text-foreground">{a.title}</span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      {a.priority} · {a.durationMinutes} min
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          addTask({
                            title: a.title,
                            notes: `From research: ${mode}`,
                            priority: a.priority,
                            status: "Not Started",
                            dueDate: isoDate(1),
                            durationMinutes: a.durationMinutes || 30,
                          });
                          toast.success("Task added");
                        }}
                      >
                        Add
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <AiDisclaimer text="AI analysis can misread nuance and may be incomplete. Check anything you plan to act on against the original material." />
        </section>
      ) : null}
    </div>
  );
}
