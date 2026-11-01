# LocalConnect — Mandatory AI Coding Agent Rules

## 1. Product source of truth
The uploaded Entrepreneurship PPT titled **Tourism Made Easy** defines the product idea. Read `docs/PPT_SOURCE_ALIGNMENT.md` and `docs/PRD.md` first.

LocalConnect is a local **rental/lending marketplace for tourists' needful commodities**. It connects tourists (renters) with local lenders. It is not a generic marketplace for hotel bookings, transport bookings, tour guides, restaurants or goods sales.

## 2. Fixed stack
- React + TypeScript + Vite + Tailwind CSS.
- Python + FastAPI + Pydantic.
- Supabase PostgreSQL, Auth, Storage and optional Realtime.
- PostGIS for nearby lender/item search.
- Gemini API from FastAPI only.
- Razorpay Checkout, server-side signature verification and signed webhooks.
- Leaflet plus a compliant map tile provider.

Do not replace the stack or add parallel infrastructure without documenting the reason and getting explicit approval.

## 3. Mandatory document review
Read, as relevant:
- `README.md`
- `docs/PPT_SOURCE_ALIGNMENT.md`
- `docs/PRD.md`
- `docs/USER_JOURNEYS.md`
- `docs/ARCHITECTURE.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/API_DOCUMENTATION.md`
- `docs/RENTAL_RULES_AND_PRICING.md`
- `docs/RAZORPAY_INTEGRATION.md`
- `docs/AI_CHATBOT.md`
- `docs/UI_GUIDELINES.md`
- `docs/PERFORMANCE_AND_COMPLEXITY.md`
- `docs/SECURITY_AND_PRIVACY.md`
- `docs/TESTING_QA.md`
- `docs/DEPLOYMENT_OPERATIONS.md`
- `docs/DEVELOPMENT_ROADMAP.md`

## 4. Workflow
1. Inspect existing files and working code before editing.
2. Identify the relevant acceptance criteria and expected data flow.
3. Plan the smallest complete vertical slice.
4. Implement in existing conventions; avoid unrelated rewrites.
5. Add tests for business rules, security and failure paths.
6. Run type checks, lint, tests and production builds.
7. Report changed files, test commands/results and remaining limitations.
8. Update docs when contracts, schema or decisions change.

Never claim a feature or test is complete unless it was actually implemented and run.

## 5. Correct domain model
Use domain terms consistently:
- Tourist / renter.
- Local lender.
- Rentable item / item listing.
- Rental request / rental booking.
- Handover / delivery.
- Return inspection.
- Damage claim / penalty.
- Platform fee.
- Delivery charge.
- Local lender membership fee.

Do not call local lenders generic service providers in UI or schema.

## 6. Security requirements
- Validate Supabase JWTs on protected backend endpoints.
- Derive identity from validated token claims; never trust user IDs sent by browser.
- Enforce role and resource ownership server-side.
- Enable and test Supabase RLS.
- Never expose Supabase service-role, Gemini, Razorpay secret or webhook secret to browser.
- Never accept client-supplied authoritative price, fee, penalty, owner or payment status.
- Verify Razorpay signatures and webhook signatures server-side.
- Make webhook processing idempotent.
- Restrict private identity documents and private addresses.
- Validate item image uploads by MIME type, size and ownership.

## 7. AI constraints
- Gemini interprets intent and assists; database inventory is the source of truth.
- Validate structured AI outputs using Pydantic.
- The AI may only recommend actual active items returned by database queries.
- Never invent item availability, lender identity, rental rates, fees or delivery options.
- Do not have the model calculate the payable amount; use backend pricing logic.
- Add rate limits, timeouts and a regular-search fallback.
- Do not expose personal data unnecessarily to Gemini.

## 8. Payment constraints
- Backend loads accepted rental request and computes the amount.
- Ignore any amount supplied by the frontend.
- Create Razorpay order using integer minor units.
- Verify payment signature using constant-time comparison.
- Verify order association, currency and amount before recording success.
- Production webhook signature verification and idempotency are mandatory.
- Browser callback cannot independently mark a rental as paid.
- Do not claim automatic lender payouts, escrow or split settlements unless specifically integrated, approved and tested.

## 9. Time and space complexity
Follow `docs/PERFORMANCE_AND_COMPLEXITY.md`.
- Never fetch every item or rental request and filter it in browser/Python.
- Use database filtering, indexes and bounded pagination.
- Use PostGIS indexes for radius queries.
- Avoid N+1 queries.
- Use a dictionary/set or SQL join rather than nested scans when matching collections.
- Debounce search input and cancel stale requests.
- Document time/space complexity for non-trivial algorithms and state assumptions (`n`, `k`, `p`).
- Optimize measured bottlenecks; do not trade correctness or maintainability for speculative micro-optimization.

## 10. UI rules
Follow `docs/UI_GUIDELINES.md`. Keep the UI clean, readable, accessible and responsive. All visible actions must work. Provide empty, loading, error and success states. Identify sample inventory and test payments clearly.

## 11. Definition of done
A feature is complete only when acceptance criteria, role/resource permissions, negative/error paths, relevant automated tests, build checks and documentation updates are addressed.
