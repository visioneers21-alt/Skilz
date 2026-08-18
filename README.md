# SKILZ

SKILZ is a voice-first AI skills coach that helps people discover potential strengths, validate them through practical challenges, and build a personalized development plan.

Built for the VISSIONERS team MVP.

## Stack

- **Next.js 16** (App Router)
- **Google Gemini** — free-tier AI for conversation, analysis, feedback, and planning
- **Web Speech API** — browser speech recognition and synthesis
- **Mock data layer** — `localStorage`-backed client store (`lib/data/store.tsx`)
- **Drizzle schema** — ready for Neon PostgreSQL when persistence is wired up (`lib/db/`)

## Quick start

```bash
npm install
cp .env.example .env.local
# Add GOOGLE_GENERATIVE_AI_API_KEY from https://aistudio.google.com/apikey
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Free API key from [Google AI Studio](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_AI_PROVIDER` | Yes (Vercel) | Provider label for deploy checklist — use `google` |
| `DATABASE_URL` | Yes (for auth) | Neon PostgreSQL connection string |
| `BREVO_API_KEY` | Yes (for email OTP) | Brevo API key for OTP email sign-in |
| `BREVO_SENDER_EMAIL` | Yes (for email OTP) | Verified sender address in Brevo |
| `GOOGLE_CLIENT_ID` | For Google sign-in | OAuth client ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | For Google sign-in | OAuth client secret |

## Auth

Guests receive **3 free AI sessions** (discover, analyze, challenge, or plan API calls). After that, they must sign in.

Sign-in options:

- **Google** — OAuth redirect flow (`/api/auth/google`)
- **Email sign-up** — one-time verification code sent via Brevo (signup only)
- **Email log-in** — enter your registered email; no OTP on return visits (session lasts until logout)

```bash
# Push schema to Neon
npm run db:push
```

### Push local `.env` to Vercel

Link the project once, then push all keys from `.env` to **Production** and **Preview**:

```bash
npx vercel link
npm run env:push
npx vercel --prod   # redeploy so production picks up new vars
```

Or add individually:

```bash
vercel env add NEXT_PUBLIC_AI_PROVIDER production
vercel env add DATABASE_URL production
```

Set `DATABASE_URL` in `.env.local`. For email OTP, also set `BREVO_API_KEY` and `BREVO_SENDER_EMAIL`. For Google sign-in, create an OAuth 2.0 client and set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Add this authorized redirect URI:

```
http://localhost:3000/api/auth/google/callback
```

(Use your production domain in production.)

## User flow

1. **Landing** (`/`) → **Onboarding** (`/onboarding`)
2. **Dashboard** (`/dashboard`) — home with strengths, today's challenge, journey
3. **Discover** (`/discover`) — voice-first AI conversation
4. **Results** (`/discover/results`) — AI-identified skill hypotheses
5. **Skills** (`/skills`, `/skills/[slug]`) — browse and inspect evidence
6. **Challenge** (`/challenge/[slug]`) — validate a skill with AI feedback
7. **Plan** (`/plan`) — AI-generated development steps
8. **Progress** (`/progress`) — activity timeline
9. **Profile** (`/profile`) — preferences and reset

## Architecture

```
app/
  api/discover   → adaptive discovery conversation
  api/analyze    → transcript → skill hypotheses
  api/challenge  → evaluate challenge responses
  api/plan       → generate development plan
  (app)/         → authenticated shell (onboard guard + nav)

lib/
  data/store.tsx → mock persistence (swap target for server actions + DB)
  ai/services.ts → client service layer over API routes
  voice/         → Web Speech API wrapper
  db/schema.ts   → Drizzle schema (future persistence)
```

All UI reads and writes go through `useSkilz()` actions. Components never touch storage directly, so swapping the mock store for Neon-backed server actions later means changing only `lib/data/store.tsx` (or replacing it with server actions + React Query).

## Voice notes

- Speech recognition and synthesis require a supported browser (Chrome, Edge, Safari).
- Microphone permission is requested on first use.
- Users can always fall back to text input on discovery and challenge flows.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Deploying

Deploy to Vercel (or any Node host). Set `GOOGLE_GENERATIVE_AI_API_KEY` in the project environment.
