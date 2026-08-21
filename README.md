# AI Workday Copilot

**An AI-powered workplace productivity assistant** that helps you plan your day, prioritise tasks, research topics, and get things done — all from a single, realistic SaaS-style interface.

🔗 **Live demo:** [work-husband.lovable.app](https://work-husband.lovable.app)

---

## What it does

AI Workday Copilot brings task management, AI-generated scheduling, research assistance and a context-aware chat assistant into one product, so decisions about time and priority happen in one place — with visible reasoning behind every AI suggestion.

| Feature | Description |
|---|---|
| 📋 **Task management** | Full CRUD — create, edit, delete, complete, filter and search tasks with priority, status, due date and duration |
| ✨ **AI prioritisation** | Ranks open tasks by deadline, priority, effort and dependencies, with a plain-language reason for every ranking |
| 🗓️ **AI planner** | Generates a realistic daily or weekly schedule around your fixed meetings, focus time and breaks |
| 🔍 **Research assistant** | Summarises pasted text/notes into an executive summary, key findings, insights, recommendations and action items |
| 💬 **AI chat** | A workplace assistant grounded in your actual open tasks and today's calendar — not generic advice |
| 📊 **Dashboard** | A live snapshot of today's priorities, schedule, stats and AI recommendations |
| 📅 **Calendar** | Day and week views of meetings, focus blocks and scheduled tasks, fully editable |
| ⚙️ **Settings** | Profile, notification and AI-assistant preferences, plus a one-click demo data reset |

## Responsible AI

Responsible use is built into the product, not bolted on:

- **No fabrication** — every system prompt forbids inventing facts, citations, statistics or events
- **Server-side only** — the AI API key never reaches the browser; all calls run through isolated server functions
- **Structured contracts** — every AI response is validated JSON before it reaches the UI, never raw ad-lib text
- **Transparent reasoning** — recommendations show short, plain-language decision factors, never hidden chain-of-thought
- **User stays in control** — AI suggests; every action (apply order, apply schedule) is an explicit, reversible choice
- **Clear disclaimers** — AI-generated content is labelled and paired with a "review before acting" notice throughout

## Tech stack

- **Framework:** [TanStack Start](https://tanstack.com/start) (React 19 + TypeScript, file-based routing via TanStack Router)
- **Styling:** Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) components (Radix primitives)
- **State:** React Context store (`src/lib/store.tsx`), persisted to `localStorage`
- **Data fetching:** TanStack Query for AI/server function calls
- **Validation:** Zod schemas for all AI inputs and outputs
- **AI:** Server-only gateway (`src/lib/ai.server.ts`) — structured prompts in, validated JSON out
- **Icons:** lucide-react · **Toasts:** Sonner

### Architecture at a glance

```
Client (React + TanStack Router)
   ↓
State (React Context + localStorage)
   ↓
Server Functions (TanStack Start, Zod-validated input)
   ↓
AI Gateway — server-only (ai.server.ts + ai-runners.server.ts)
   → structured system prompts (ai-prompts.ts)
   → validated JSON output (ai-schemas.ts)
```

## Getting started

### Prerequisites

- [Bun](https://bun.sh) (or Node.js 18+ with npm/pnpm as an alternative)

### Installation

```bash
git clone https://github.com/Mmabatho-M/workday-ai-assistant.git
cd workday-ai-assistant
bun install
```

### Environment variables

The AI features call an AI gateway server-side and expect an API key in the environment:

```bash
LOVABLE_API_KEY=your_key_here
```

Without this key configured, the app still runs — AI features will return a clear error instead of a result rather than crashing.

### Run locally

```bash
bun dev
```

The app will be available at `http://localhost:8080`.

### Other scripts

| Command | Description |
|---|---|
| `bun dev` | Start the development server |
| `bun build` | Production build |
| `bun build:dev` | Development-mode build |
| `bun preview` | Preview a production build locally |
| `bun lint` | Run ESLint |
| `bun format` | Format the codebase with Prettier |

## Project structure

```
src/
├── routes/            # File-based routes (dashboard, tasks, planner, research, chat, calendar, settings)
├── components/
│   ├── ui/             # shadcn/ui primitives
│   ├── app-shell.tsx    # Sidebar + responsive layout shell
│   └── ui-bits.tsx      # Shared app components (badges, empty/error/loading states, AI reasoning)
├── lib/
│   ├── store.tsx              # Global state (tasks, events) + localStorage persistence
│   ├── demo-data.ts           # Realistic sample workplace data
│   ├── ai-prompts.ts          # Structured system prompts for each AI feature
│   ├── ai-schemas.ts          # Zod schemas validating AI input/output
│   ├── ai.server.ts           # Server-only AI gateway client
│   ├── ai-runners.server.ts   # Prompt construction + output validation per feature
│   └── ai.functions.ts        # TanStack Start server functions exposed to the client
└── styles.css          # Design tokens and global styles
```

## Design

A calm, corporate SaaS aesthetic: light backgrounds, navy/indigo accents, rounded cards and soft shadows. Fully responsive — the sidebar collapses to a hamburger menu on mobile, cards stack vertically, and the chat/dialogs remain fully usable on small screens.

## License

Private project — all rights reserved.
