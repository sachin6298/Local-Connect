# Deployment and Operations Guide

## 1. Environments

Maintain separate:
- Local development.
- Staging/demo.
- Production.

Use distinct Supabase projects and Razorpay keys for staging and production. Never copy production secrets into local sample files.

## 2. Frontend deployment (Vercel)

1. Push repository to Git provider.
2. Configure root/build directory as `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add public env vars:
   - `VITE_API_BASE_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID` only if client requires it.
6. Configure SPA route fallback if needed.
7. Restrict backend CORS to deployed app origin.

Never add secret credentials as Vite environment variables.

## 3. Backend deployment (Render or equivalent)

1. Configure service root as `backend`.
2. Install requirements.
3. Start with a production ASGI server command, e.g. Uvicorn/Gunicorn configuration as supported by host.
4. Set environment variables through secret manager:
   - `FRONTEND_ORIGIN`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` only if required
   - `GEMINI_API_KEY`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
5. Configure HTTPS.
6. Configure health and readiness endpoints.
7. Set bounded worker/connection values for the host.

## 4. Supabase setup

- Create project.
- Enable required extensions such as PostGIS.
- Apply numbered SQL migrations.
- Seed localities/categories.
- Configure Auth providers and redirect URLs.
- Configure Storage buckets and access rules.
- Apply and test RLS policies.
- Configure backups and database monitoring.

## 5. Razorpay setup

- Use test credentials for development/demo.
- Configure webhook endpoint in gateway dashboard.
- Store webhook secret only on backend.
- Subscribe only to events actually handled.
- Test signature failures and duplicate event delivery.
- Switch to live only after merchant/account and production review.

## 6. Gemini setup

- Store API key only on backend.
- Select a supported model via environment config.
- Configure timeout/rate limits.
- Monitor request errors and usage.
- Provide normal search fallback.

## 7. Maps
Select a tile/geocoding service appropriate to usage and follow its attribution, caching and rate-limit policy. Do not assume public OpenStreetMap tile servers are unrestricted production infrastructure.

## 8. Operational monitoring
Monitor:
- API error rate and latency.
- Database query latency.
- Search no-result rates.
- AI errors and usage.
- Razorpay order/verification/webhook failures.
- Pending rentals and stuck states.
- Open damage claims/reports.

Logs must include request IDs and safe event metadata, not secrets, payment credentials or private identity documents.

## 9. Backup and recovery
- Enable database backups supported by plan.
- Test restore procedure.
- Keep migrations in source control.
- Store item/evidence files in managed storage with access rules.
- Document recovery owner and escalation steps.

## 10. Release checklist
- Environment variables checked.
- Migrations applied.
- RLS verified.
- Frontend build clean.
- Backend tests clean.
- Razorpay test flow passed.
- Webhook verified.
- CORS exact origin.
- Admin account provisioned safely.
- Terms, pricing and damage policies reviewed.
- Sample data clearly distinguished from real listings.
