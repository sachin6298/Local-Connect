# System Architecture

## 1. Architecture choice

Use a modular monolith: one React frontend and one FastAPI backend, split into domain modules. Supabase provides PostgreSQL, authentication, storage and optional realtime delivery. This is appropriate for a hackathon MVP and avoids microservice deployment/observability overhead.

## 2. High-level architecture

```text
Browser
  React + TypeScript + Vite + Tailwind
  Tourist UI | Lender UI | Admin UI | AI Assistant
          |
          | HTTPS / JSON
          v
FastAPI application
  Auth | Lender | Catalogue | Discovery | Rental | Pricing
  Payment | AI Chat | Delivery/Handover | Return/Dispute | Admin
          |
          +------ Supabase Auth (JWT validation)
          +------ Supabase PostgreSQL + PostGIS
          +------ Supabase Storage
          +------ Supabase Realtime (optional)
          +------ Gemini API (backend only)
          +------ Razorpay API + signed webhook

Leaflet map client -> permitted map tile/geocoding provider
```

## 3. Frontend layers

### App shell
- Route configuration.
- Authentication/session provider.
- Shared navigation and footer.
- Role-specific route layouts.
- Error boundary.

### Feature domains
- `auth`
- `discovery`
- `items`
- `rental-requests`
- `payments`
- `lender-dashboard`
- `chatbot`
- `returns`
- `admin`

### Client data rules
- Use a typed API client.
- Cache server data with query keys that include filters, dates and destination.
- Invalidate relevant queries after mutations.
- Use local component state for transient dialogs/tabs only.
- Avoid duplicating server state in multiple contexts.
- Never store authoritative payment/booking state as a client-only value.

## 4. Backend layers

1. **API routers:** HTTP contract and response status.
2. **Dependencies:** JWT verification, actor context, role and permission.
3. **Use-case/service layer:** rental rules, pricing, availability, payment workflow and dispute process.
4. **Repository layer:** bounded SQL queries, joins and transactions.
5. **Integration layer:** Supabase, Gemini and Razorpay clients.

Example module layout:

```text
backend/app/
├── main.py
├── core/
│   ├── config.py
│   ├── auth.py
│   ├── permissions.py
│   ├── logging.py
│   └── errors.py
├── api/v1/
├── modules/
│   ├── users/
│   ├── lenders/
│   ├── categories/
│   ├── items/
│   ├── discovery/
│   ├── rentals/
│   ├── pricing/
│   ├── payments/
│   ├── chatbot/
│   ├── handover/
│   ├── returns/
│   ├── disputes/
│   └── admin/
├── integrations/
│   ├── supabase.py
│   ├── gemini.py
│   └── razorpay.py
├── schemas/
└── tests/
```

## 5. Main data flows

### 5.1 Item discovery
1. Browser sends category, keywords, destination/coordinates, rental period, quantity and pagination.
2. Backend validates bounds.
3. Database joins active items with approved lender profiles.
4. Availability query excludes conflicting rentals.
5. PostGIS limits nearby candidates when coordinates/radius are supplied.
6. Backend returns a bounded page of public listing data.
7. UI renders list and/or map.

### 5.2 AI-assisted item search
1. Tourist sends a natural-language request.
2. FastAPI sends only necessary text/context to Gemini.
3. Gemini returns structured intent (categories, keywords, locality, dates, quantity).
4. Pydantic validates and normalizes output.
5. Search service executes the same catalogue/availability query as normal search.
6. Assistant response is built from actual item records and configured policies.
7. If Gemini fails, the user can continue with manual category/keyword search.

### 5.3 Rental request and quote
1. Tourist selects item and rental window.
2. Backend loads current item/lender data.
3. Backend checks item active state, lender approval and available quantity.
4. Backend computes rental subtotal from the configured price unit.
5. Backend adds configured platform fee and delivery fee.
6. Backend optionally adds an approved deposit if policy requires it.
7. Backend persists a quote snapshot and rental request.
8. Lender accepts/rejects.
9. Accepted request becomes payable.

### 5.4 Razorpay collection
1. Backend loads accepted rental and stored quote.
2. Backend verifies actor and payment eligibility.
3. Backend creates Razorpay order with amount in minor units.
4. Client opens Razorpay Checkout.
5. Client submits returned payment identifiers/signature to backend.
6. Backend verifies signature, order association and expected amount/currency.
7. Backend records payment idempotently.
8. Signed webhook events reconcile asynchronous/duplicate gateway updates.
9. Rental status advances after trusted event processing.

### 5.5 Handover/return
1. Lender marks item prepared/handed over.
2. Before-condition evidence may be captured.
3. Rental becomes active.
4. Tourist initiates return or lender records return received.
5. Lender records condition and optional photo evidence.
6. No issue: rental completes.
7. Damage/loss claim: dispute workflow begins; admin decides under policy.

## 6. Data ownership and trust boundaries

- Browser data is untrusted.
- Gemini output is untrusted.
- Razorpay callback fields are untrusted until signature verification.
- User identity is taken from validated Supabase JWT, not request body.
- Listing owner is taken from persisted record.
- Price and fee are recomputed/loaded from database.
- Admin decisions are persisted with actor and timestamp.
- Public API returns approximate public location, never private residential address.

## 7. Realtime

Realtime is optional for MVP. Use it for new rental-request notifications, chat and status updates only after RLS is configured. Persist all events in database; realtime is a delivery channel, not the source of truth.

## 8. Failure handling

- Gemini timeout/outage: show fallback manual search.
- Razorpay API outage: keep rental in awaiting-payment/error state; do not mark paid.
- Supabase outage: show safe unavailable state and do not accept mutations.
- Map tile outage: list search remains available.
- Webhook duplicate: idempotency record prevents repeated side effects.
- Webhook delayed: payment remains pending until verified trusted event arrives.

## 9. Deployment topology

- Vercel: built frontend.
- Render: FastAPI service.
- Supabase: PostgreSQL/Auth/Storage/Realtime.
- Razorpay: payment checkout and server-to-server webhook.
- Use HTTPS, exact CORS origin allowlist, separate staging and production secrets, database migrations and health checks.
