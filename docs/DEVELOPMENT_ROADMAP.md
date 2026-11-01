# Development Roadmap

## Delivery strategy
Build the rental lifecycle first. A complete working flow is more valuable than many disconnected screens. Use one locality and seed representative inventory before broadening geography.

## Phase 0 — Confirm business rules
- Confirm rental unit (hour/day/event/fixed period).
- Confirm initial categories and item examples.
- Decide if security deposit exists.
- Decide pickup/delivery operations.
- Decide cancellation, late return and damage evidence policy.
- Define platform fee and locality membership configuration.
- Confirm collection vs lender settlement arrangement.

**Exit:** all unspecified commercial decisions are recorded as configurable policies or explicitly deferred.

## Phase 1 — Repository and foundation
- Create React/Vite/TypeScript/Tailwind frontend.
- Create FastAPI app and health endpoint.
- Configure Supabase project and database migrations.
- Configure environment examples and CORS.
- Add lint/build/test scripts.

**Exit:** frontend, backend and database connection operate locally.

## Phase 2 — Authentication and roles
- Supabase Auth.
- Tourist/lender profiles.
- JWT verification in FastAPI.
- Protected routes and backend authorization.
- Admin provisioning process.

**Exit:** role-specific access works and unauthorized cross-user requests are rejected.

## Phase 3 — Lender and item catalogue
- Lender onboarding/approval.
- Rental categories.
- Item create/edit/deactivate.
- Image upload.
- Location and availability.
- Public item detail.

**Exit:** approved lender can publish an item and tourist can view it.

## Phase 4 — Discovery and AI
- Keyword/category/locality/date/quantity search.
- PostGIS radius search.
- Pagination and indexes.
- Map/list view.
- Gemini structured intent extraction.
- Database-grounded results and fallback.

**Exit:** tourist can search actual rentable inventory manually and through chatbot.

## Phase 5 — Rental request and pricing
- Availability calculation.
- Quote service.
- Fee policy by locality.
- Rental request creation.
- Lender accept/reject.
- State transition history and notifications.

**Exit:** accepted rental has correct locked quote and cannot double-book inventory.

## Phase 6 — Razorpay
- Backend order creation from stored quote.
- Frontend Checkout.
- Backend signature verification.
- Webhook signature and event deduplication.
- Payment ledger and rental confirmation.
- Failure/refund state handling.

**Exit:** test payment succeeds and duplicate/invalid events are safe.

## Phase 7 — Handover, return and disputes
- Pickup/delivery states.
- Before/after condition records.
- Return inspection.
- Damage claim and admin decision.
- Reviews and reports.

**Exit:** complete rental can be closed or safely escalated to dispute.

## Phase 8 — Admin and membership
- Lender moderation.
- Listing moderation.
- Locality-specific fee configuration.
- Membership plans/status.
- Admin metrics and audit logs.

**Exit:** admin can supervise core marketplace operations.

## Phase 9 — QA and deployment
- Unit/integration/e2e tests.
- Security/RLS verification.
- Query plan and performance review.
- Staging deployment.
- Demo data and walkthrough.
- Production readiness review.

**Exit:** complete demo journey works in deployed environment.

## Hackathon prioritization
If time is limited, prioritize:
1. Auth/roles.
2. Lender item listing.
3. Tourist search and item details.
4. Rental request and lender decision.
5. Razorpay test order and signature verification.
6. Gemini assistant grounded in inventory.
7. Admin approval.
8. Handover/return UI.

Defer automated payouts, delivery partner tracking, complex deposits and multilingual voice until core rental flow is reliable.
