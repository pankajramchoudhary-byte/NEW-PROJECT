# SmartSetupUAE — PRD

## Original problem statement
Existing full app (React marketing frontend + Next.js admin + FastAPI backend, deployed to Hostinger).
Requested: (1) Support Analytics in admin, (2) Attachments on customer + admin tickets via Supabase Storage,
(3) AI "Generate AI reply" button in admin ticket workspace (accept SUGGEST_ONLY draft),
(4) Renewal reminders auto-opening tickets 30/14/3 days before licence expiry via SLA cron,
(5) **MAIN**: Recommendation engine must show the exact recommended freezone/mainland licence per activity.
Also: auto emails, AI search, checkout alignment, and customer support manageable from admin.

## Architecture
- Frontend: CRA (React 18, craco, Tailwind, shadcn), Supabase REST for data, FastAPI backend for AI.
- Admin: Next.js app (own JWT auth), talks to shared Mongo + Supabase service role.
- Backend: FastAPI + Mongo (support tickets, SLA, AI logs) + Supabase (packages, activities, leads) + Emergent LLM (Claude) + Gemini.

## Implemented (2026-06)
- **Recommendation engine (MAIN)**: `frontend/src/lib/activitySearchService.js` now AI-first.
  `buildLiveRecommendation` calls `/api/aria/smart-rank` (Gemini specialisation ranker: Gold→DMCC,
  Media→SHAMS, Aviation→DAFZA, Software→IFZA, etc.), enriches each AI zone with the live Supabase
  package (price/visas/package_id), and falls back to the deterministic client rules on timeout/empty.
  Regulated activities (crypto/finance/clinical/broadcast) keep the hard-filtered client guardrail.
  AI summary surfaced in AISearch. Hard timeouts (6s packages / 10s AI) prevent hangs. VERIFIED via curl.
- **Support Analytics**: backend `GET /api/support/analytics?days=7|30|90` (resolution time, SLA compliance %,
  AI resolution + escalation rates). Admin page `/admin/support-analytics` + nav item + api route.
- **Attachments**: backend sign-upload / sign-download endpoints on tickets (MIME + size validation, signed URLs,
  bucket `SUPPORT_ATTACHMENTS_BUCKET`). Wired into customer SupportPortal and admin ticket workspace.
- **AI Suggested Reply**: admin ticket detail surfaces the stored SUGGEST_ONLY `ai_suggestion` with a one-click
  "Generate AI reply" button (backend `/api/admin/ai-support/suggest/{id}` also exists for regeneration).
- **Renewal reminders**: `sla.py` tick now scans Supabase licence table and idempotently opens support tickets +
  emails 30/14/3 days before expiry (`renewal_tickets` count in tick response).
- **Unified support store**: admin `ticketService.js` rewritten to operate on the SAME Mongo
  `support_tickets`/`support_messages` the customer portal uses → customer tickets are now managed from admin.

## Verified
- Backend: `/api/` 200, `/api/sla/tick` 200 (cron key) / 401 (bad key), ticket create (SUP-000001),
  analytics 403 without staff, smart-rank returns correct specialised zones.

## Not visually verified
- Admin (Next.js) is not run in this preview sandbox — admin changes delivered as code.
- AI-search result page rendering could not be captured because the preview screenshot tool repeatedly
  aborted/reloaded the SPA (net::ERR_ABORTED); logic + backend are verified.

## Backlog / next
- P1: Wire customer attachment upload UX polish; admin attachment thumbnails.
- P1: Checkout ↔ admin/customer alignment review.
- P2: Confirm Supabase `licenses` table schema for renewal source; create `support-attachments` bucket.
