# Shamiri Supervisor Copilot

An AI-powered session review dashboard for Shamiri Supervisors in the Tiered Care Model. Supervisors can browse therapy sessions conducted by Fellows, trigger AI analysis against the Shamiri 3-Point Quality Index, and validate or override the AI's findings.

---

## Quick Start

### Prerequisites

- Node.js 22+
- Docker (for Postgres) **or** a local/hosted PostgreSQL instance
- Anthropic API key

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://postgres:password@localhost:54320/shamiri_copilot?schema=public"
ANTHROPIC_API_KEY="sk-ant-..."
AUTH_SECRET="run: openssl rand -base64 32"
```

### 3. Start PostgreSQL

**With Docker (recommended):**

```bash
docker compose up -d
```

This starts a Postgres 16 container on port `54320`, parsing credentials directly from `DATABASE_URL` in `.env`.

**Without Docker:**

```bash
createdb shamiri_copilot
```

Update `DATABASE_URL` in `.env` to match your local Postgres credentials and port.

### 4. Run migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed with 12 mock sessions

```bash
npx prisma db seed
```

This creates:

- **Supervisor account:** `supervisor@shamiri.org` / `Shamiri2026!`
- **12 therapy session transcripts** across 12 Fellows and Groups

### 6. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```text
shamiri-copilot/
├── prisma/
│   ├── migrations/              # Committed migration history
│   ├── schema.prisma            # DB models: Supervisor, Fellow, Session, Analysis, Review
│   └── seed.ts                  # 12 mock therapy session transcripts
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── auth/
    │   │   │   ├── login/       # POST /api/auth/login
    │   │   │   ├── logout/      # POST /api/auth/logout
    │   │   │   └── me/          # GET  /api/auth/me
    │   │   └── sessions/
    │   │       ├── route.ts     # GET  /api/sessions
    │   │       └── [id]/
    │   │           ├── route.ts     # GET  /api/sessions/[id]
    │   │           ├── analyze/     # POST /api/sessions/[id]/analyze
    │   │           └── review/      # POST /api/sessions/[id]/review
    │   ├── dashboard/           # Sessions list with stats
    │   ├── sessions/[id]/       # Session detail: transcript + AI insight + review
    │   ├── login/               # Auth page
    │   └── layout.tsx           # Root layout + Navbar
    ├── components/
    │   ├── AnalysisSection      # Analysis flow: empty state → skeleton → InsightCard
    │   ├── InsightCard          # AI analysis display with metric scores
    │   ├── InsightCardSkeleton  # Shimmer loading state for InsightCard
    │   ├── ReviewModal          # Human-in-the-loop validation form
    │   ├── SessionsTable        # Dashboard table with risk flags
    │   ├── StatusBadge          # Session pipeline status
    │   └── Navbar               # Top navigation
    ├── lib/
    │   ├── ai.ts                # Anthropic SDK wrapper + prompt + Zod validation
    │   ├── schemas.ts           # Zod schemas for AI output + API bodies
    │   ├── types.ts             # ApiResponse discriminated union + error code enums
    │   ├── auth.ts              # Session cookie helpers + auth guard
    │   ├── session.ts           # JWT signing & verification (jose)
    │   └── db.ts                # Prisma singleton
    └── proxy.ts                 # Auth route protection (Next.js middleware)
```

---

## REST API

All endpoints return a typed `ApiResponse` discriminated union:

```typescript
// Success
{ success: true,  data: T, error: undefined }
// Failure
{ success: false, data: undefined,  error: { code: string; message: string } }
```

### Auth

| Method | Path | Auth required | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | No | Exchange email + password for a session cookie |
| `POST` | `/api/auth/logout` | Yes | Clear the session cookie |
| `GET` | `/api/auth/me` | Yes | Return the authenticated supervisor |

### Sessions

| Method | Path | Auth required | Description |
| --- | --- | --- | --- |
| `GET` | `/api/sessions` | Yes | List all sessions with fellow and analysis summary |
| `GET` | `/api/sessions/[id]` | Yes | Fetch a single session with full analysis and review |
| `POST` | `/api/sessions/[id]/analyze` | Yes | Trigger AI analysis via Anthropic Claude |
| `POST` | `/api/sessions/[id]/review` | Yes | Submit a supervisor review (validate or reject AI findings) |

---

## AI Engineering Notes

### Prompt Design (`src/lib/ai.ts`)

The prompt is structured in three sections:

1. **Role + transcript** — the model is given its clinical supervisor identity and the raw session transcript, bounded by separators so it cannot be confused with instructions.
2. **Grading rubric** — the Shamiri 3-Point Quality Index, with one section per metric:
   - *Content Coverage* — did the Fellow teach Growth Mindset correctly? (Score 1 Missed → 3 Complete)
   - *Facilitation Quality* — was the delivery empathetic and engaging? (Score 1 Poor → 3 Excellent)
   - *Protocol Safety* — did the Fellow stay within the lay-provider curriculum? (Score 1 Violation → 3 Adherent)
   - *Risk Detection* — were any safeguarding triggers present in the transcript?
3. **Output contract** — the exact JSON shape the model must return, with all constraints stated inline.

The prompt follows these defensive design principles:

1. **Role assignment** — the model is told it is a clinical supervisor, not a general assistant. This focuses its reasoning on observable, session-specific behaviour.

2. **Rubric grounding** — every score level includes specific observable evidence to look for (e.g., "phrases like 'brain is a muscle'"). This reduces hallucination and score drift across sessions.

3. **Conservative risk flagging** — the prompt explicitly states: *"When in doubt, flag as RISK. A false positive is safer than a missed crisis."* In a mental health context, under-detection is the higher-cost error. When multiple triggers exist, the model quotes the first in `riskQuote` and describes the rest in `riskExplanation` — keeping the quote field clean and displayable while preserving all clinical detail.

4. **Output contract** — the model is given the exact JSON schema it must return, with: character limits per justification field (500 chars), an explicit score-to-rating mapping it must follow (e.g. `contentScore 2` must pair with `"Partial"`), and a rule that `riskQuote`/`riskExplanation` must be JSON `null` — not the string `"null"` — when `riskFlag` is `"SAFE"`.

5. **Low temperature** — `temperature: 0.2` produces consistent, deterministic scoring rather than creative variation.

### Structured Output Enforcement (`src/lib/schemas.ts`)

The AI response is validated with Zod before being written to the database:

```typescript
const AIAnalysisOutputSchema = z.object({
  contentScore: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  // ...
});
```

If Claude returns a score outside `[1, 2, 3]` or omits a required field, `ZodError` is thrown and the API returns a 500 with a descriptive error — never silently persisting bad data.

### Retry Logic

API calls use exponential back-off (3 attempts, 1s → 2s → 4s). Zod validation errors are not retried (they reflect a model failure, not a transient error).

### JSON Extraction

Claude occasionally wraps output in markdown fences (` ```json `). The `extractJSON()` function strips fences before parsing, making the pipeline robust to formatting variation.

---

## AI Usage Disclosure

| Component | Source | Notes |
| --- | --- | --- |
| Project architecture | Hand-designed | Schema design, API contract, auth strategy |
| Prompt engineering | Hand-written | Role, rubric, risk instructions, output contract; iteratively hardened with score-to-rating consistency mapping, JSON null enforcement, 500-char justification limits, and multiple-trigger handling |
| Zod schemas | Hand-written | Mirrors rubric precisely; final safety net before any data is persisted |
| `ApiResponse` type system | Hand-written | Discriminated union for all API responses; typed error code enums per route |
| Mock transcripts | AI-assisted (ChatGPT) | 12 sessions covering varied quality/risk levels; Swahili group names (G-Upendo → G-Neema); reviewed for clinical plausibility and rubric coverage |
| Docker Compose | Hand-designed | Postgres 16 on port 54320; credentials parsed from `DATABASE_URL` via POSIX entrypoint script |
| `AnalysisSection` + `InsightCardSkeleton` components | AI-assisted | Shimmer loading pattern; AI-generated scaffolding with manual adjustments |
| Remaining UI components | Mixed | AI-generated scaffolding with manual adjustments for Shamiri context, layout, and Heroicons integration |
| API routes | Mixed | AI-generated scaffolding with manual business logic verification and adjustments against Prisma schema |
| Auth implementation | Hand-written | JWT (HS256 via jose), cookie handling |
| Unit tests | Hand-written | 23 tests across 7 route files written by hand; mocks designed to isolate business logic (auth guard, DB, AI layer) independently; CUID constraint in `ReviewBodySchema` surfaced and fixed during test authoring |

Code quality was verified by:

- TypeScript strict mode (`tsc --noEmit`) — zero `any` types
- ESLint via `next lint`
- SonarLint (IDE) + SonarCloud (CI) — static analysis against the same ruleset
- Unit tests (`npm test`) — 23 tests across all 7 API route handlers; each test isolates the auth guard, database, and AI layer independently via mocks
- Manual review of all AI-generated routes against the Prisma schema
- End-to-end testing of the analysis → review flow
- Checking that risk sessions (Sessions 10–12) produce correct RISK flags
- Prompt contract iteratively tested: score/rating consistency, null field enforcement, and character limits validated against live AI output

---

## Session Quality Matrix (Seed Data)

| # | Fellow | Group | Scores (C/F/S) | Risk | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | Sarah Mwangi | G-Upendo | 3/3/3 | SAFE | Exemplary session |
| 2 | James Otieno | G-Amani | 3/3/3 | SAFE | Strong engagement |
| 3 | Grace Wanjiru | G-Imani | 3/2/3 | SAFE | Good content, facilitation passive |
| 4 | David Kamau | G-Nguvu | 2/3/3 | SAFE | Content rushed, great energy |
| 5 | Aisha Hassan | G-Ujasiri | 2/2/3 | SAFE | Script-heavy delivery |
| 6 | Michael Odhiambo | G-Umoja | 2/2/2 | SAFE | Minor topic drift |
| 7 | Faith Njeri | G-Pamoja | 1/2/3 | SAFE | Misrepresents Growth Mindset |
| 8 | Samuel Kipchoge | G-Matumaini | 2/1/3 | SAFE | Monologue, ignored participant |
| 9 | Amina Osei | G-Furaha | 2/2/3 | SAFE | Adequate overall |
| 10 | Brian Muthoni | G-Bidii | 3/3/3 | **RISK** | Participant disclosed self-harm |
| 11 | Lydia Achieng | G-Subira | 2/2/1 | **RISK** | Fellow gave ADHD medication advice |
| 12 | Kevin Njoroge | G-Neema | 1/1/1 | **RISK** | Crisis ignored, multiple violations |

---

## Potential Improvements

- [ ] **Re-analysis guard** — `POST /api/sessions/[id]/analyze` currently re-runs the AI on every call. A guard should be added so that sessions already in `PROCESSED` or `FLAGGED` status are skipped unless the supervisor explicitly requests a re-analysis (e.g. via a `?force=true` query parameter). This prevents redundant Anthropic API calls and unintentional overwriting of a reviewed analysis.

- [ ] **Paginated session list** — `GET /api/sessions` currently returns all sessions in a single payload. Backend cursor-based pagination (e.g. `?cursor=<lastId>&limit=20`) would keep payloads small as the session count grows, and is more efficient than offset pagination on large tables since it avoids a full-table count query.

- [ ] **Session filtering and sorting** — the dashboard currently has no way to narrow results. Useful filters include status (`PENDING`, `PROCESSED`, `FLAGGED`, `REVIEWED`, `SAFE`), risk flag, Fellow name, and date range. Sorting by date, risk flag, or quality scores would let supervisors triage the highest-priority sessions first. These can be implemented as query parameters on `GET /api/sessions` and pushed down to Prisma `where` / `orderBy` clauses to avoid in-memory filtering on large datasets.

- [ ] **Supervisor registration and session management UI** — currently a supervisor account must be created via the seed script and sessions can only be added by directly manipulating the database. A registration page and an admin UI for adding Fellows and uploading session transcripts would make the system self-contained and usable without database access.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript (strict)
- **Database:** PostgreSQL + Prisma ORM
- **AI:** Anthropic Claude (`claude-sonnet-4-5-20250929`)
- **Validation:** Zod
- **Styling:** Tailwind CSS
- **Auth:** JWT session cookies (HS256 via `jose`)
- **Testing:** Vitest
- **Infrastructure:** Docker (Postgres 16 via Docker Compose)
