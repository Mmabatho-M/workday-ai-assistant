# Workday AI Assistant

Build an AI Workday Copilot

Create a polished, modern, responsive web application called AI Workday Copilot — an AI-powered workplace productivity assistant that helps users plan their workday, prioritize tasks, research topics, and interact with an AI workplace chatbot.

The application must clearly demonstrate:

Practical AI implementation

Strong prompt engineering

Real-world workplace problem solving

Responsible AI usage

Modern UI/UX design

Responsive desktop and mobile design

1. Overall Product Concept

AI Workday Copilot should act as a single intelligent workplace assistant.

The user should be able to:

Create and manage tasks

Ask AI to prioritize tasks

Generate a daily schedule

Generate a weekly schedule

Adjust schedules when priorities change

Research a topic using AI

Summarize research/article text

Extract key insights

Receive recommendations

Chat with an AI workplace assistant

View productivity information from a central dashboard

The application should feel like a realistic SaaS productivity product rather than a school project.

Use realistic sample workplace data so the application looks populated immediately after launch.

2. Technology & Architecture

Build the application as a modern responsive web application.

Use:

React

TypeScript

Tailwind CSS

Modern component architecture

Responsive layouts

Reusable UI components

Clean state management

Accessible form controls

Toast notifications

Loading states

Empty states

Error states

Confirmation dialogs where appropriate

If an AI API is available, integrate it properly.

If no AI API is configured, create a realistic demo/mock AI service layer so the complete interface remains functional.

Keep the AI service isolated so a real AI API can easily be connected later.

Do not expose API keys in frontend code.

3. Visual Design

Create a premium modern SaaS interface.

Design style:

Clean

Professional

Minimal

Modern

Corporate

AI-focused

Easy to understand

Use a light interface with:

White/very light gray backgrounds

Dark navy/charcoal text

Blue or indigo as the primary accent

Subtle gradients

Rounded cards

Soft shadows

Clear typography

Generous spacing

Consistent iconography

Avoid excessive gradients, excessive animations, clutter, or a generic template appearance.

Use subtle micro-interactions for buttons, cards, navigation, and AI-generated content.

The UI should look suitable for a real workplace SaaS product.

4. Main Application Layout

Create a desktop layout with:

LEFT SIDEBAR

AI Workday Copilot logo/name

Dashboard

My Tasks

AI Planner

Research Assistant

AI Chat

Calendar

Settings

BOTTOM OF SIDEBAR

User profile

Account/settings button

MAIN CONTENT AREA

Page header

Contextual actions

Main content

Responsive cards and panels

On mobile:

Collapse the sidebar

Use a hamburger/menu button

Ensure cards stack vertically

Make tables horizontally scrollable where necessary

Keep primary actions easy to access

Make the chatbot comfortable to use on small screens

5. Dashboard

Create a professional dashboard homepage.

Header:

"Good morning, Alex 👋"

Subtitle:

"Here's what your workday looks like."

Include an AI-generated recommendation card:

"AI Recommendation"

Example:

"You have 3 high-priority tasks today. I recommend completing the client proposal before your 2:00 PM meeting because it requires the most focused work."

Include action buttons:

Apply Recommendation

View Schedule

Ask AI

Productivity summary cards

Create cards for:

Tasks Today

High Priority

Completed

Focus Time

Example:

Tasks Today: 8
High Priority: 3
Completed: 5
Focus Time: 4h 20m

Today's Schedule

Show a timeline:

09:00 — Review emails
10:00 — Team meeting
11:00 — Client proposal
13:00 — Lunch
14:00 — Research
15:30 — Presentation preparation

Allow the user to click a schedule item to view/edit it.

Priority Tasks

Show task cards containing:

Task name

Priority

Due date

Estimated duration

Status

Use clear visual priority indicators.

AI Insights

Show useful AI-generated workplace insights such as:

"Your highest-impact task today is the client proposal."

"Two tasks can be moved to tomorrow without affecting deadlines."

"Your calendar has a 90-minute focus window between 10:30 and 12:00."

6. My Tasks

Create a complete task management page.

Users should be able to:

Add tasks

Edit tasks

Delete tasks

Mark tasks complete

Set priority

Set due date

Set estimated duration

Add notes

Filter tasks

Search tasks

Task priorities:

Critical

High

Medium

Low

Task status:

Not Started

In Progress

Completed

Include an AI button:

"Prioritize with AI"

When clicked, AI should analyze:

Deadline

Priority

Estimated duration

Dependencies

Importance

and return a recommended priority order.

Show the reasoning behind the recommendation in simple language.

Example:

"Move 'Prepare client presentation' to #1 because it is due tomorrow and requires 2 hours of focused work."

7. AI Task Planner

This is one of the main AI features.

Create a dedicated page called:

"AI Planner"

Provide an input section where users can describe their workload.

Example placeholder:

"Tell me what you need to accomplish today..."

Example user input:

"I need to finish the quarterly report, prepare for tomorrow's client meeting, respond to emails, research three competitors, and review the team's work. I have a meeting from 10:00 to 11:00."

Add options:

Generate Today's Schedule

Generate Weekly Schedule

Additional controls:

Work start time

Work end time

Break duration

Preferred focus periods

Existing meetings

Task priorities

AI-generated output

Display the generated schedule as a beautiful timeline.

Each item should show:

Time

Task

Priority

Duration

AI reasoning

Example:

09:00–10:00
Quarterly Report
HIGH
60 minutes

10:00–11:00
Client Meeting
FIXED

11:15–12:45
Client Presentation
HIGH
90 minutes

Include buttons:

Apply Schedule

Regenerate

Edit

Move Task

Clear Schedule

The AI should avoid scheduling tasks over fixed meetings.

If the requested workload exceeds available working hours, the AI should clearly explain the conflict and recommend what to move.

8. Strong Prompt Engineering

Implement structured AI prompts behind the scenes.

Do not simply send the user's text directly to the AI.

For task scheduling, construct a structured prompt containing:

User goals

Task list

Priority

Deadlines

Estimated durations

Fixed calendar events

Available working hours

Break preferences

Scheduling constraints

Tell the AI to:

Analyze the tasks

Identify urgent and important work

Respect fixed events

Avoid impossible schedules

Include realistic breaks

Minimize unnecessary context switching

Protect focused work periods

Explain important scheduling decisions

Flag conflicts

Return structured schedule data

Use structured JSON output internally where appropriate.

Validate AI-generated schedule data before displaying it.

Never blindly trust AI output.

9. AI Research Assistant

Create a page called:

"Research Assistant"

Include a large input area.

Users can enter:

A research question

A topic

An article

Notes

Pasted text

Example:

"Research the impact of remote work on employee productivity."

Provide actions:

Summarize

Extract Key Insights

Compare

Generate Recommendations

Generate Action Items

Output sections

Executive Summary

A concise overview.

Key Findings

Show 3–6 important findings.

Insights

Explain what the information means for a workplace.

Recommendations

Provide practical recommendations.

Action Items

Convert useful findings into tasks.

AI Disclaimer

Display:

"AI-generated research summaries may contain inaccuracies or incomplete information. Verify important claims using reliable primary or authoritative sources before making business decisions."

Do not fabricate citations or sources.

If sources are not available, explicitly say that the response is based only on the information provided by the user.

10. AI Chatbot Interface

Create a dedicated page called:

"AI Chat"

Build a polished workplace chatbot interface.

The user should see:

Conversation history

AI messages

User messages

Timestamp

Typing/loading indicator

Text input

Send button

Add suggested prompts:

"Plan my day"

"What's my highest priority?"

"Summarize my research"

"Help me organize my tasks"

"What should I work on next?"

The assistant should understand workplace productivity context.

Example conversation:

USER:
"What should I focus on right now?"

AI:
"Your highest-priority task is the client proposal, due tomorrow. You have a 90-minute uninterrupted window available now, so I recommend working on it before checking lower-priority email."

Allow the chatbot to reference the user's tasks and schedule.

11. Context-Aware AI

The AI assistant should understand application context.

For example, if the user has:

Task:
"Finish client proposal"
Priority:
High
Due:
Tomorrow
Duration:
2 hours

and asks:

"What should I do next?"

The AI should use that information rather than giving a generic productivity answer.

The assistant should be able to recommend:

What to work on

What to postpone

What to prioritize

When to schedule tasks

When there are conflicts

12. Calendar

Create a calendar page with:

Day view

Week view

Scheduled tasks

Meetings

Focus blocks

Use different colors for:

Meetings

High-priority tasks

Focus time

Breaks

Allow users to click an event and edit it.

Include:

"Optimize My Day with AI"

This should analyze the calendar and task list and suggest improvements.

13. Responsible AI

Responsible AI must be visible throughout the application.

Create an "AI Transparency" section in Settings.

Include:

AI-generated content

"AI-generated schedules, summaries, recommendations and responses may contain errors."

Human oversight

"Review AI recommendations before using them for important workplace decisions."

Privacy

"Do not enter confidential, sensitive, personal, financial, or proprietary information unless your organization's approved AI policy allows it."

Source verification

"Verify important facts and research claims using reliable sources."

User control

"The AI suggests actions. The user remains in control of whether recommendations are applied."

Also display a subtle disclaimer near AI-generated responses.

Never claim that AI responses are guaranteed to be accurate.

14. AI Confidence / Transparency

Where useful, display an "AI reasoning" or "Why this recommendation?" expandable section.

Example:

"Why did AI prioritize this?"

Due tomorrow

High importance

Requires 2 hours

No conflicting meetings

Do not expose hidden chain-of-thought.

Instead, provide concise decision factors and explanations that are useful to the user.

15. Loading, Error & Empty States

Create polished states for all AI features.

Loading:

"AI is analyzing your workload..."

"Generating your schedule..."

"Analyzing your research..."

Error:

"We couldn't generate a response. Please try again."

Empty state:

"No tasks yet. Add your first task or ask AI to help you create a plan."

Do not leave blank screens.

16. Demo Data

Pre-populate the application with realistic workplace data.

Example tasks:

Complete quarterly report — High — Due tomorrow — 2 hours

Prepare client presentation — High — Due Friday — 90 minutes

Reply to emails — Medium — Due today — 30 minutes

Research competitors — Medium — Due Thursday — 1 hour

Review team submissions — High — Due today — 45 minutes

Update project documentation — Low — Due next week — 1 hour

Example calendar:

09:00–09:30 Email review
10:00–11:00 Team meeting
13:00–14:00 Lunch
14:00–14:30 Client call

Make the demo data easy to modify.

17. Navigation

Sidebar navigation should work correctly.

Routes/pages:

/dashboard
/tasks
/planner
/research
/chat
/calendar
/settings

Highlight the active navigation item.

Do not create dead buttons or fake navigation.

Every major button should perform a meaningful action or clearly indicate if it is a demo feature.

18. Responsive Design

The application must work beautifully at:

Desktop

Laptop

Tablet

Mobile

On mobile:

Sidebar becomes a drawer

Dashboard cards stack

Timeline becomes vertically optimized

Chat occupies the available screen

Forms become single-column

Buttons remain touch-friendly

Do not simply shrink the desktop interface.

Design the mobile experience intentionally.

19. UX Requirements

Prioritize:

Clear visual hierarchy

Minimal clicks

Obvious primary actions

Consistent spacing

Accessible contrast

Clear feedback

Fast perceived performance

Helpful empty states

Helpful error messages

Keyboard-friendly forms

Use tooltips where icons may not be obvious.

Use confirmation dialogs for destructive actions.

20. Assessment Demonstration Features

Make it obvious that the project demonstrates the assignment requirements.

Add an optional "AI Capabilities" section in Settings or About showing:

✓ AI Task Planning
✓ AI Prioritization
✓ AI Research & Summarization
✓ AI Workplace Chat
✓ Context-Aware Recommendations
✓ Responsible AI Controls
✓ Human-in-the-Loop Decisions

Do not make this feel like a checklist pasted onto the interface. Integrate it naturally into the product.

21. Final Quality Requirements

Before completing the application, verify:

All navigation works

All forms work

Task CRUD works

AI planner works or has a convincing demo mode

Research assistant works or has a convincing demo mode

Chatbot works or has a convincing demo mode

Calendar works

Responsive design works

Loading states work

Error states work

AI disclaimer is visible

No API keys are exposed

No fabricated sources are presented as real

No obviously fake UI interactions remain

The application looks like a professional workplace SaaS product

The final result should feel like a real AI workplace productivity platform that could be demonstrated to an employer, lecturer, client, or evaluator.

Prioritize functionality and usability over unnecessary visual effects.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/edd1dc5d-6056-4646-b73c-1767cedae8a4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
