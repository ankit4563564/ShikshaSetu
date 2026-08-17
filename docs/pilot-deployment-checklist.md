# SHIKSHASETU — PILOT DEPLOYMENT CHECKLIST & ENVIRONMENT SPECIFICATION

---

## 1. PRODUCTION DEPLOYMENT PREREQUISITES

### Environment Variables (.env.production)
- `NEXT_PUBLIC_SUPABASE_URL`: Production Supabase project URL (`https://<project-ref>.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Production Supabase Anon public key
- `SUPABASE_SERVICE_ROLE_KEY`: Production Supabase Service Role Key (Used ONLY in server-side background event dispatchers)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Production Clerk publishable key (`pk_live_...`)
- `CLERK_SECRET_KEY`: Production Clerk secret key (`sk_live_...`)
- `CAMPUS_ID_HMAC_SECRET`: 64-character hex secret string for dynamic HMAC-SHA256 QR pass token generation
- `NEXT_PUBLIC_APP_URL`: Canonical production HTTPS domain (`https://app.shikshasetu.in`)

---

## 2. DATABASE & RLS VERIFICATION CHECKLIST

- [x] All 46 migrations executed sequentially on production PostgreSQL instance (`supabase db push` or direct migration execution).
- [x] PostgreSQL Row-Level Security (RLS) enabled on all 42 tables (`ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;`).
- [x] Multi-tenant isolation function `current_user_school_id()` deployed and active on database session context.
- [x] Status check constraint on `gate_passes` updated to include `'revoked'`.
- [x] `gate_pass_audit_logs` indexes verified on `operation_id` and `student_id`.

---

## 3. SECURITY & DOMAIN SPECIFICATION

- [x] HTTPS enforced with HTTP to HTTPS SSL redirection.
- [x] HSTS security headers enabled (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`).
- [x] Clerk Webhooks configured for user sync on `user.created` and `user.updated`.
- [x] Zero service-role credentials exposed to browser bundle (Verified via `npm run build`).

---

## 4. OPERATIONAL LOGGING & BACKUP STRATEGY

- [x] Supabase Automated Daily Backups enabled with 30-day point-in-time recovery (PITR).
- [x] Structured JSON event logging active on server actions via `recordEcosystemEvent()`.
- [x] Non-blocking notification dispatch configured so email/push failures do not rollback database transactions.

---
*Production Deployment Checklist Complete.*
