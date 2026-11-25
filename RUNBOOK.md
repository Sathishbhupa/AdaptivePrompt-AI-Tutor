# AdaptivePrompt Tutor — Live Verification Runbook

## 1. Configure locally

Copy `backend/.env.example` to `backend/.env` and `frontend/.env.local.example` to `frontend/.env.local`.
Do not commit either real environment file.

Required backend values:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY` and/or `GROQ_API_KEY`

Required frontend values:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_API_URL`

For Supabase JWT verification, the backend tries the project's JWKS first and falls back to `SUPABASE_JWT_SECRET` only when configured.

## 2. Start backend

From `backend/`:

```bash
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Expected:
- `GET /health` → `{ "ok": true, ... }`

## 3. Start frontend

From `frontend/`:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 4. Verify authentication

1. Create an account/sign in.
2. Open Dashboard.
3. Confirm the authenticated backend user ID is returned by `/api/auth/me`.
4. Sign out and confirm protected pages require authentication.

## 5. Verify Tutor

1. Ask a beginner question such as `What is a variable in Python?`.
2. Confirm a structured answer and practice questions appear.
3. Submit a practice answer.
4. Confirm feedback and score appear.
5. Open Dashboard and confirm XP/accuracy update.
6. Ask another question and confirm prior interaction count is used.

## 6. Verify Chat isolation

1. Create a new Chat session.
2. Send two messages.
3. Reload the page and restore the session.
4. Confirm Tutor history is not shown in Chat.

## 7. Verify factuality

From a Tutor response, run the factuality check.
Confirm a risk/confidence result is returned and saved without exposing provider JSON.

## 8. Verify provider fallback

Temporarily disable one provider key locally and confirm the other provider can answer.
Do not intentionally exhaust a free-tier quota during testing.

## 9. Verify security

- Call protected endpoints without `Authorization` → 401.
- Use an invalid/expired JWT → 401.
- Confirm a session/interactions lookup cannot access another user's records.
- Confirm provider keys never appear in frontend source or browser network payloads.

## 10. Offline release check

From the repository root:

```bash
python scripts/verify_release.py
```

This check does not require API keys.
