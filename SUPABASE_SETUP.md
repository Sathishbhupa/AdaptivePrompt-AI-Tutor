# Supabase setup

The application does **not** create database tables at runtime. This is intentional: schema creation belongs in migrations, not in the FastAPI request path.

## What you need to do

If the migrations have not already been applied to your Supabase project, open **Supabase → SQL Editor** and run the SQL files in this order:

1. `supabase/migrations/20260929_foundation.sql`
2. `supabase/migrations/20260929_chat_mode.sql`
3. `supabase/migrations/20260929_gamification_and_practice.sql`
4. `supabase/migrations/20260929_prompt_evaluation.sql`
5. `supabase/migrations/20260929_factuality_layer.sql`
6. `supabase/migrations/20260930_auth_db_fixes.sql`  (profile backfill, safer signup trigger, explicit grants)

The foundation migration creates the core tables and the `auth.users` → `profiles` trigger. It is safe to re-run because it uses `if not exists` / `drop policy if exists` patterns where appropriate.

## Tables

- `profiles` — learner profile and practice counters
- `interactions` — Tutor questions, answers, adaptive metadata and XP
- `chat_sessions` — separate Chat conversations
- `chat_messages` — Chat message history
- `practice_attempts` — practice answers and evaluation
- `fact_checks` — factuality-risk reviews
- `evaluation_runs` / `evaluation_results` — backend-only evaluation infrastructure for the MCA project

## Important

Do not put the Supabase `service_role` key in frontend code. The FastAPI backend uses it server-side and independently verifies the user's JWT.

## Supabase dashboard settings (Authentication)

- **URL Configuration → Site URL**: `http://localhost:3000` (your deployed URL in production)
- **URL Configuration → Redirect URLs**: add `http://localhost:3000/auth/callback` (and the production equivalent)
- **Providers**: enable Google and/or GitHub only if you use those buttons, and paste their client ID/secret
- **Email**: if "Confirm email" is on, new users must click the email link before they can sign in
