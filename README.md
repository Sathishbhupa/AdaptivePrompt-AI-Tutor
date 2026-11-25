# AdaptivePrompt AI Tutor

MCA mini-project: adaptive AI tutoring with separate Tutor/Chat modes, prompt-engineering strategies, Supabase Auth/Postgres, FastAPI, Gemini and Groq.

## Current build
- **Phase 11:** User-facing Research Lab removed; evaluation remains backend-only for MCA analysis. Production-hardening pass adds correct favicon assets, safer headers, resilient error/loading states, provider status, and current model defaults.
- **Phase 1:** Supabase Auth, RLS, FastAPI JWT trust boundary.
- **Phase 2:** Gemini/Groq provider abstraction with retry/backoff and clean provider errors.
- **Phase 3:** Adaptive Tutor with learner context, difficulty classification, prompt-strategy selection, structured responses and interaction persistence.
- **Phase 4:** Tutor UI with structured answer cards and practice-answer evaluation.
- **Phase 6 foundation:** XP derived from real interaction rows, practice attempts, streak calculation, strategy-usage analytics and badges.

## Prompt-engineering techniques
Tutor dynamically selects among:
- Persona + Zero-shot + Scaffolding
- Persona + Few-shot + Socratic prompting
- Persona + Few-shot + Stepwise explanation + silent self-check

Practice evaluation uses a separate small-model call so tutoring and evaluation do not have to consume the same quota bucket.

## Environment
Keep secrets local. Do not commit `.env` files.

`backend/.env`
```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
CORS_ORIGINS=http://localhost:3000
GEMINI_API_KEY=
GROQ_API_KEY=
GEMINI_SMALL_MODEL=gemini-3.5-flash-lite
GEMINI_TUTOR_MODEL=gemini-3.8-flash
GROQ_SMALL_MODEL=openai/gpt-oss-20b
GROQ_TUTOR_MODEL=openai/gpt-oss-120b
```

`frontend/.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Run
```bash
cd backend
python -m venv .venv
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend
npm install
npm run dev
```

## Security rule
The backend always takes the authenticated identity from the verified JWT `sub`. A frontend-supplied student/user ID is never trusted for Tutor, practice, or progress requests.
