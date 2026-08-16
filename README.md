# Interview Feedback Portal

A chatbot-style web app for conducting structured DevOps & Cloud technical interviews. The
interviewer asks questions from a seeded question bank, evaluates each answer as
**Correct / Partially Correct / Incorrect**, and — once the interview is finished — generates a
professional AI summary from the recorded feedback.

**AI is used for exactly one thing:** generating the final interview summary from the
interviewer's own structured feedback. It never grades answers, never generates questions, and
never overrides the interviewer's evaluation. There is no speech-to-text, audio recording, or
candidate answer analysis in this version, by design.

---

## Stack

- **Frontend/Backend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database:** PostgreSQL, via Prisma ORM
- **AI:** Anthropic Claude, called server-side only (API key never reaches the browser)

## Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
- Docker (for the bundled PostgreSQL container) — or your own PostgreSQL instance

## Local Setup

```bash
npm install
```

## Database Setup

The repo includes a `docker-compose.yml` that runs PostgreSQL on host port `5433` (chosen to
avoid clashing with a local Postgres on the default 5432).

```bash
docker compose up -d db
```

If you'd rather use your own PostgreSQL instance, just point `DATABASE_URL` (see below) at it
instead — the docker-compose service is optional.

Then create the schema:

```bash
npx prisma migrate dev
```

## Environment Variables

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. Defaults to the docker-compose service. |
| `ANTHROPIC_API_KEY` | No | Enables AI summary generation. Without it, the "Generate AI Summary" button returns a clear "not configured" message instead of failing silently — everything else in the app works normally. |
| `ANTHROPIC_MODEL` | No | Defaults to `claude-sonnet-4-5`. |

## Seed the Question Bank

```bash
npx prisma db seed
```

Seeds 10 technologies (GCP, AWS, Azure, Kubernetes, Docker, Terraform, GitHub Actions, GitLab CI,
Jenkins, Linux) with 10 questions each — 100 questions total, covering Fundamentals,
Architecture, Networking, Security, Troubleshooting, Production, and Best Practices, at a level
suited for experienced DevOps engineers. Re-running the seed is safe (it upserts technologies and
skips questions that already exist).

### Optional: real-world question bank + quick-note phrases

```bash
npm run seed:custom
```

Adds a second, larger layer on top of the base seed, sourced from an actual interview rubric:
86 more questions merged into GCP / Docker / Kubernetes / Linux / Terraform, plus two new
technologies (**CI/CD Concepts**, **Programming & Scripting**), plus 156 **note suggestions** —
short positive/negative phrases (e.g. "Clearly explained subnets and IP segmentation.",
"Unclear on CIDR ranges and IP planning.") tagged per technology + category. These render as
clickable chips next to the Notes box during the interview (see below) so the interviewer can tap
a phrase instead of typing. Also idempotent — safe to re-run.

## Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## The Interview Workflow

1. **Dashboard** — stats overview, start a new interview, or browse question bank / history.
2. **Start Interview** — candidate name, interviewer name, interview type, questions-per-technology,
   and a searchable technology picker (or type a new technology name manually).
3. **Interview Room** (`/interview/[id]`) — a chat-style interface:
   - One question at a time, with **Correct / Partially Correct / Incorrect** + optional notes.
   - **Skip — Not Asked**: if a question wasn't actually put to the candidate, skip it without
     picking an evaluation. Skipped questions count toward progress but are excluded entirely from
     scoring (not counted as answered, not counted as wrong).
   - Clickable **note suggestion chips** next to the Notes box (from `seed-custom`, see above) —
     tap a phrase to append it instead of typing.
   - Submitting feedback auto-advances to the next question — no manual "Next" click needed.
   - **Switch technology at any time**, even mid-question — click a technology in the sidebar, or
     type its name in the chat command bar (or `next` / `finish`). The abandoned question isn't
     lost or force-resolved; it's parked and resumes exactly where you left off when you switch
     back. A straight-through interview (no manual switching) still auto-chains through the queued
     technologies as each one completes.
   - A persistent **Finish Interview** button opens a confirmation showing progress per technology.
   - **State survives a browser refresh** — everything is persisted to Postgres and reloaded from
     the interview id in the URL; there is no reliance on frontend-only state.
4. **Interview Report** — once finished: per-technology and overall stats (raw counts + score %),
   a **Generate AI Summary** button per technology, and an overall **Generate AI Summary** button.
   Both are short (4 sections, capped under ~120 words) and stay visible on the report afterward.
5. **Question Bank** (`/question-bank`) — add technologies, add/edit/deactivate/delete questions,
   filter by technology / difficulty / category, search.
6. **Previous Interviews** (`/interviews`) — history of all sessions with status and score.

### Scoring

```
Score = (Correct + Partially Correct × 0.5) / Total Answered × 100
```

## AI Summary Configuration

The AI summary is generated server-side only, via `src/lib/ai-summary.ts`, using a fixed system
prompt that instructs the model to summarize **only** the structured interview data provided —
it is explicitly told not to invent skills or behavior, and not to change the interviewer's
evaluation. If `ANTHROPIC_API_KEY` is unset, the `/api/interviews/:id/generate-summary` endpoint
returns a 503 with a clear message, and the UI surfaces that message instead of failing silently.

## API Overview

| Endpoint | Purpose |
|---|---|
| `POST /api/interviews` | Create an interview |
| `GET /api/interviews/:id` | Get interview detail (stats + full transcript) |
| `POST /api/interviews/:id/technologies` | Start a technology section |
| `GET /api/interviews/:id/questions/next` | Get the next unanswered question |
| `POST /api/interviews/:id/questions/:interviewQuestionId/feedback` | Submit interviewer feedback |
| `POST /api/interviews/:id/complete` | Finish the interview |
| `POST /api/interviews/:id/generate-summary` | Generate the overall AI summary |
| `GET /api/interviews/:id/summary` | Fetch the overall summary |
| `POST /api/interviews/:id/technologies/:technologyId/generate-summary` | Generate a per-technology AI summary |
| `GET /api/interviews/:id/technologies/:technologyId/summary` | Fetch a per-technology summary |
| `GET /api/note-suggestions?technologyId=&category=` | Quick-note phrase chips for the current question |
| `GET /api/technologies`, `POST /api/technologies` | List / add technologies |
| `GET /api/questions`, `POST /api/questions` | List (with filters) / add questions |
| `PATCH /api/questions/:id`, `DELETE /api/questions/:id` | Edit / deactivate / delete a question |
| `GET /api/stats` | Dashboard aggregate stats |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                # Dashboard
│   ├── interview/new/          # Start Interview
│   ├── interview/[id]/         # Chatbot interview room + completed report
│   ├── question-bank/          # Admin: manage technologies & questions
│   ├── interviews/             # Previous interviews list
│   └── api/                    # Route handlers (see API Overview above)
├── components/
│   ├── interview/              # Chat UI, question card, feedback form, sidebar, etc.
│   ├── dashboard/               # Stat cards, top nav
│   ├── question-bank/           # Add/edit question & technology dialogs
│   └── ui/                      # Shared primitives (button, card, dialog, ...)
├── lib/
│   ├── db.ts                    # Prisma client singleton
│   ├── scoring.ts                # Scoring formula
│   ├── questions.ts              # Question selection (difficulty distribution, no repeats)
│   ├── interviews.ts             # Stats aggregation, DTO serialization
│   ├── ai-summary.ts             # Anthropic call + system prompt
│   └── api-client.ts             # Typed fetch wrapper used by client components
└── types/                        # Shared frontend/backend DTO types

prisma/
├── schema.prisma
└── seed.ts
```

## Security Notes

- The Anthropic API key is read only in server-side code (`src/lib/ai-summary.ts`, called from an
  API route) and is never sent to the browser.
- All API input is validated with `zod`; invalid requests return `400` with details, never a raw
  stack trace.
- Unexpected server errors are logged server-side and return a generic message to the client
  (see `src/lib/api-utils.ts`) — internal error details are never exposed to the UI.
- Question/answer text is rendered as plain React text (never `dangerouslySetInnerHTML`), so
  interviewer notes and question text are inherently safe from injected markup.

## Production Deployment

1. Provision a PostgreSQL database and set `DATABASE_URL` accordingly.
2. Set `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL` in your hosting platform's environment variables
   (never commit `.env`).
3. Run migrations against the production database: `npx prisma migrate deploy`.
4. Seed the question bank once: `npx prisma db seed` (safe to skip on redeploys — it's
   idempotent).
5. Build and start:
   ```bash
   npm run build
   npm run start
   ```
   This app has no framework-specific lock-in — it deploys to Vercel, or any Node host that can
   run `next build` / `next start` with a reachable Postgres instance.

## Development Notes

- `npx prisma studio` — browse/edit the database directly.
- `npx tsc --noEmit` — type-check the whole project.
- The question bank admin page performs soft-deletes (deactivation) for any question already
  used in an interview, to preserve historical interview data; unused questions are hard-deleted.
