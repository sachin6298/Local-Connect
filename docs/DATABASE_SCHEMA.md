# Database Schema and Data Dictionary

**Database:** Supabase PostgreSQL  
**Extension:** PostGIS  
**Identifiers:** UUID primary keys  
**Times:** `timestamptz`, UTC  
**Money:** store numeric amount plus currency for pricing; convert to integer minor units when invoking Razorpay. Never use binary floating point for monetary calculations.

This schema models rental inventory, not generic travel services.

---

## 1. Entity relationship overview

```text
auth.users 1—1 profiles
profiles 1—0..1 lender_profiles
profiles 1—N rental_items (lender)
rental_categories 1—N rental_items
rental_items 1—N item_images
profiles 1—N rental_requests (tourist)
profiles 1—N rental_requests (lender)
rental_items 1—N rental_requests
rental_requests 1—N rental_payments
rental_requests 1—N rental_status_events
rental_requests 1—0..1 handovers
rental_requests 1—0..1 return_inspections
rental_requests 1—N damage_claims
profiles 1—N notifications
rental_requests 1—0..1 reviews
localities 1—N fee_policies
localities 1—N lender_memberships
```

## 2. Core tables

### 2.1 `profiles`
- `id uuid primary key references auth.users(id) on delete cascade`
- `full_name text not null`
- `phone text null`
- `avatar_path text null`
- `role text not null check (role in ('tourist','lender','admin'))`
- `preferred_language text null`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

Public signup can assign only `tourist` or `lender`. Admin access is granted through controlled provisioning.

### 2.2 `lender_profiles`
- `user_id uuid primary key references profiles(id)`
- `display_name text not null`
- `description text`
- `locality_id uuid references localities(id)`
- `public_area_label text`
- `verification_status text check (verification_status in ('draft','submitted','approved','rejected','suspended'))`
- `verification_note text`
- `languages text[]`
- `created_at`, `updated_at`

Only safe fields are public. Verification notes/documents are private.

### 2.3 `localities`
- `id uuid primary key`
- `name text not null`
- `city text`
- `state text`
- `country_code char(2)`
- `slug text unique`
- `is_active boolean default true`

Locality is used for search, fee policy and lender membership configuration.

### 2.4 `rental_categories`
- `id uuid primary key`
- `name text not null`
- `slug text unique not null`
- `description text`
- `icon_key text`
- `is_active boolean default true`
- `sort_order int`

Initial seeds should include clothing, backpacks/bags, utensils, puja materials, household essentials and daily-use items.

### 2.5 `rental_items`
- `id uuid primary key`
- `lender_id uuid references profiles(id)`
- `category_id uuid references rental_categories(id)`
- `title text not null`
- `description text`
- `condition_label text`
- `size_or_variant text`
- `total_quantity int not null check (total_quantity > 0)`
- `price_amount numeric(12,2) not null check (price_amount >= 0)`
- `price_unit text not null check (price_unit in ('hour','day','event_period','fixed_period'))`
- `currency char(3) not null default 'INR'`
- `minimum_duration int`
- `maximum_duration int`
- `pickup_available boolean default true`
- `delivery_available boolean default false`
- `status text check (status in ('draft','active','paused','rejected','suspended'))`
- `created_at`, `updated_at`

A rental listing is not a sale listing. No purchase/sale price field should be added without a product decision.

### 2.6 `item_images`
- `id uuid primary key`
- `item_id uuid references rental_items(id) on delete cascade`
- `storage_path text not null`
- `alt_text text`
- `sort_order int default 0`
- `created_at`

Use object storage; never store image bytes in PostgreSQL.

### 2.7 `item_locations`
- `id uuid primary key`
- `item_id uuid references rental_items(id) on delete cascade`
- `locality_id uuid references localities(id)`
- `public_label text`
- `location geography(point,4326)`
- `created_at`

Use a public pickup point/area, not lender home coordinates. Create GiST index on `location`.

### 2.8 `item_availability`
- `id uuid primary key`
- `item_id uuid references rental_items(id)`
- `starts_at timestamptz not null`
- `ends_at timestamptz not null`
- `quantity_blocked int not null default 0`
- `is_available boolean default true`
- Constraint: `ends_at > starts_at`, quantity non-negative.

Availability can be represented through explicit blocks plus accepted/active rentals. Choose one consistent source of truth; do not maintain two competing calendars.

### 2.9 `rental_requests`
- `id uuid primary key`
- `tourist_id uuid references profiles(id)`
- `lender_id uuid references profiles(id)`
- `item_id uuid references rental_items(id)`
- `quantity int not null check (quantity > 0)`
- `rental_start timestamptz not null`
- `rental_end timestamptz not null`
- `handover_method text check (handover_method in ('pickup','delivery'))`
- `tourist_note text`
- `rental_subtotal numeric(12,2) not null`
- `platform_fee numeric(12,2) not null`
- `delivery_charge numeric(12,2) not null default 0`
- `security_deposit numeric(12,2) not null default 0`
- `total_amount numeric(12,2) not null`
- `currency char(3) not null`
- `status text not null`
- `idempotency_key text`
- `created_at`, `updated_at`

Statuses: `requested`, `accepted`, `rejected`, `awaiting_payment`, `payment_failed`, `paid`, `preparing`, `pickup_ready`, `out_for_delivery`, `active`, `return_requested`, `return_inspection`, `completed`, `cancelled`, `refund_pending`, `refunded`, `disputed`, `lost`.

Persist a quote snapshot so subsequent fee-policy changes do not silently alter an existing accepted rental.

### 2.10 `rental_payments`
- `id uuid primary key`
- `rental_request_id uuid references rental_requests(id)`
- `gateway text not null default 'razorpay'`
- `gateway_order_id text unique`
- `gateway_payment_id text unique`
- `amount_minor bigint not null`
- `currency char(3) not null`
- `status text not null`
- `signature_verified_at timestamptz`
- `captured_at timestamptz`
- `refunded_amount_minor bigint default 0`
- `created_at`, `updated_at`

Never store card number, CVV, UPI PIN or OTP.

### 2.11 `payment_webhook_events`
- `id uuid primary key`
- `gateway_event_id text unique`
- `event_type text`
- `payload_hash text`
- `processing_status text`
- `processed_at timestamptz`
- `created_at`

Deduplicate events using a unique gateway event identifier where available. Persist only necessary audit metadata.

### 2.12 `rental_status_events`
- `id uuid primary key`
- `rental_request_id uuid references rental_requests(id)`
- `from_status text`
- `to_status text`
- `actor_id uuid references profiles(id)`
- `reason text`
- `created_at`

Provides an immutable transition history.

### 2.13 `handover_records`
- `id uuid primary key`
- `rental_request_id uuid unique references rental_requests(id)`
- `handed_over_by uuid references profiles(id)`
- `received_by uuid references profiles(id)`
- `handover_at timestamptz`
- `condition_note text`
- `photo_paths text[]`
- `created_at`

### 2.14 `return_inspections`
- `id uuid primary key`
- `rental_request_id uuid unique references rental_requests(id)`
- `inspected_by uuid references profiles(id)`
- `returned_at timestamptz`
- `condition_note text`
- `photo_paths text[]`
- `inspection_result text check (inspection_result in ('ok','damage_claim','missing_item'))`
- `created_at`

### 2.15 `damage_claims`
- `id uuid primary key`
- `rental_request_id uuid references rental_requests(id)`
- `raised_by uuid references profiles(id)`
- `description text`
- `evidence_paths text[]`
- `claimed_amount numeric(12,2)`
- `decision text check (decision in ('pending','accepted','rejected','partial'))`
- `decided_by uuid references profiles(id)`
- `decision_note text`
- `decided_at timestamptz`
- `created_at`

The claimed amount is not automatically charged. Admin decision and approved payment/refund workflow are required.

### 2.16 `fee_policies`
- `id uuid primary key`
- `locality_id uuid references localities(id)`
- `platform_fee_type text check (platform_fee_type in ('fixed','percentage'))`
- `platform_fee_value numeric(12,2)`
- `delivery_fee_type text check (delivery_fee_type in ('fixed','quote','none'))`
- `delivery_fee_value numeric(12,2)`
- `effective_from timestamptz`
- `effective_to timestamptz`
- `is_active boolean`
- `created_by uuid references profiles(id)`

Do not hard-code amounts. Retain policy snapshots in the rental quote.

### 2.17 `lender_membership_plans` and `lender_memberships`
Plan includes locality, plan name, fee, duration, features and active state. Membership records lender, plan, start/end, payment reference and status. The PPT says membership fee varies place to place; actual values require business approval.

### 2.18 Supporting tables
- `reviews`: one review per eligible completed rental.
- `reports`: user/listing/transaction reports and admin status.
- `notifications`: recipient, type, content, read timestamp.
- `audit_logs`: admin and sensitive financial/policy actions.

## 3. Indexes

Recommended indexes:
```sql
CREATE INDEX rental_items_active_category_idx
  ON rental_items (category_id, created_at DESC)
  WHERE status = 'active';

CREATE INDEX rental_items_lender_status_idx
  ON rental_items (lender_id, status);

CREATE INDEX rental_requests_tourist_created_idx
  ON rental_requests (tourist_id, created_at DESC);

CREATE INDEX rental_requests_lender_status_idx
  ON rental_requests (lender_id, status, created_at DESC);

CREATE INDEX rental_requests_item_period_idx
  ON rental_requests (item_id, rental_start, rental_end, status);

CREATE INDEX status_events_rental_created_idx
  ON rental_status_events (rental_request_id, created_at DESC);

CREATE INDEX item_locations_geog_idx
  ON item_locations USING GIST (location);
```

Also index foreign keys used for frequent joins when no suitable index exists. Avoid indiscriminate indexing: every index consumes storage and increases insert/update cost.

## 4. Availability correctness

A rental period overlaps an existing period when:
`existing_start < requested_end AND existing_end > requested_start`.

For quantity-based inventory, availability must account for the **sum of overlapping accepted/paid/active quantities**, not simply count bookings. Prevent race conditions using a transaction and a per-item lock/serializable strategy or another proven concurrency control mechanism. Validate again when lender accepts and when payment is initiated.

## 5. RLS policy requirements

- Profiles: users see/update their own private fields; public profile fields exposed through safe view/API.
- Lender profiles: owner updates own profile; public sees approved safe fields.
- Verification documents: owner and authorized admins only.
- Rental items: lender manages own; public can read active items from approved lenders.
- Rental requests: tourist and assigned lender only; admin authorized access.
- Payments: participants see limited status; trusted backend alone writes verified payment data.
- Handover/return evidence: transaction participants and admin only.
- Damage claims: participants and admin only.
- Fee policies/membership plans: public read only when intentionally published; admin write.
- Notifications: recipient only.
- Audit logs: admin/operator only.

Test policies with separate tourist, lender and admin identities. A frontend route guard is not a database security boundary.
