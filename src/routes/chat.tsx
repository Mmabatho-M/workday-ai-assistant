import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { MessagesSquare, SendHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AiBadge, AiDisclaimer, ErrorState, PageHeader } from "@/components/ui-bits";
import { chatWithCopilot } from "@/lib/ai.functions";
import { buildAiContext, useStore } from "@/lib/store";
import { errorMessage } from "@/lib/time";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat | AI Workday Copilot" },
      {
        name: "description",
        content:
          "Ask a workplace AI assistant about prioritisation, meeting prep, difficult emails and time management — grounded in your own tasks.",
      },
      { property: "og:title", content: "AI Chat | AI Workday Copilot" },
      {
        property: "og:description",
        content: "A workplace chatbot that knows today's tasks and calendar.",
      },
    ],
  }),
  component: ChatPage,
});

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What should I focus on first today?",
  "Help me prepare for my next team meeting.",
  "Draft a polite reply pushing a deadline back by two days.",
  "How do I protect focus time with a full meeting calendar?",
];

const GREETING: Message = {
  role: "assistant",
  content:
    "Hi — I'm your workday copilot. I can see your open tasks and today's calendar, so ask me what to prioritise, how to prep for a meeting, or how to word a tricky message.",
};

function ChatPage() {
  const { tasks, events } = useStore();
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const run = useServerFn(chatWithCopilot);
  const send = useMutation({
    mutationFn: async (history: Message[]) =>
      run({ data: { messages: history, context: buildAiContext(tasks, events) } }),
    onSuccess: (data) =>
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]),
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, send.isPending]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || send.isPending) return;
    const history: Message[] = [
      ...messages.filter((m) => m !== GREETING),
      { role: "user", content: trimmed },
    ];
    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setInput("");
    send.mutate(history);
  }

  return (
    <div className="space-y-7">
      <PageHeader
        title="AI Chat"
        subtitle="A workplace assistant grounded in your tasks and today's schedule."
        actions={
          <Button
            variant="ghost"
            onClick={() => {
              setMessages([GREETING]);
              send.reset();
              toast.info("Conversation cleared");
            }}
          >
            <Trash2 className="size-4" aria-hidden /> Clear chat
          </Button>
        }
      />

      <section className="surface-card flex min-h-[24rem] flex-col p-0" aria-label="Conversation">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3">
          <MessagesSquare className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-sm font-semibold text-foreground">Workday Copilot</span>
          <AiBadge>Context-aware</AiBadge>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.map((m, i) => (
            <div
              key={`${i}-${m.role}`}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                    : "max-w-[85%] rounded-2xl rounded-bl-sm bg-secondary px-4 py-2.5 text-sm whitespace-pre-wrap text-foreground"
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {send.isPending ? (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
                Thinking…
              </div>
            </div>
          ) : null}
          {send.isError ? (
            <ErrorState
              message={errorMessage(send.error)}
              onRetry={() => {
                const last = [...messages].reverse().find((m) => m.role === "user");
                if (last) send.mutate(messages.filter((m) => m !== GREETING));
              }}
            />
          ) : null}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 ? (
          <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
            {SUGGESTIONS.map((s) => (
              <Button key={s} size="sm" variant="outline" onClick={() => submit(s)}>
                {s}
              </Button>
            ))}
          </div>
        ) : null}

        <form
          className="flex items-end gap-2 border-t border-border px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
        >
          <Textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            placeholder="Ask about priorities, meeting prep, emails, time management…"
            aria-label="Message"
          />
          <Button type="submit" disabled={send.isPending || !input.trim()} aria-label="Send message">
            <SendHorizontal className="size-4" aria-hidden />
          </Button>
        </form>
      </section>

      <AiDisclaimer text="This assistant can be wrong and has no access to company systems or confidential records. Don't paste sensitive personal data, and verify advice before acting on it." />
    </div>
  );
}
