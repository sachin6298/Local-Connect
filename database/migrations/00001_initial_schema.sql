-- LocalConnect Database Migration: 00001_initial_schema.sql
-- Core Schema: Tables, UUIDs, Foreign Keys, Constraints, Timestamps

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Generic updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------
-- Table 1: profiles
-- Inherits from auth.users. Admin role CANNOT be registered publicly.
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_path TEXT,
    role TEXT NOT NULL DEFAULT 'tourist' CHECK (role IN ('tourist', 'lender', 'admin')),
    preferred_language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------
-- Table 2: localities
-- Represents cities/pilgrimage destinations (e.g. Gaya Ji)
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.localities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country_code CHAR(2) NOT NULL DEFAULT 'IN',
    slug TEXT UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_localities_updated_at
    BEFORE UPDATE ON public.localities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------
-- Table 3: lender_profiles
-- Local lender operational details and admin verification state
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lender_profiles (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    description TEXT,
    locality_id UUID REFERENCES public.localities(id) ON DELETE SET NULL,
    public_area_label TEXT,
    verification_status TEXT NOT NULL DEFAULT 'draft' CHECK (verification_status IN ('draft', 'submitted', 'approved', 'rejected', 'suspended')),
    verification_note TEXT,
    verification_document_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
    languages TEXT[] DEFAULT ARRAY['Hindi']::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_lender_profiles_updated_at
    BEFORE UPDATE ON public.lender_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------
-- Table 4: rental_categories
-- Commodity categories (clothing, utensils, backpacks, puja items, etc.)
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rental_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon_key TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_rental_categories_updated_at
    BEFORE UPDATE ON public.rental_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------
-- Table 5: rental_items
-- Physical rentable inventory owned by local lenders
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rental_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.rental_categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT,
    condition_label TEXT NOT NULL,
    size_or_variant TEXT,
    total_quantity INT NOT NULL CHECK (total_quantity > 0),
    price_amount NUMERIC(12, 2) NOT NULL CHECK (price_amount >= 0),
    price_unit TEXT NOT NULL CHECK (price_unit IN ('hour', 'day', 'event_period', 'fixed_period')),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    minimum_duration INT DEFAULT 1,
    maximum_duration INT,
    pickup_available BOOLEAN NOT NULL DEFAULT TRUE,
    delivery_available BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'rejected', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_rental_items_updated_at
    BEFORE UPDATE ON public.rental_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------
-- Table 6: item_images
-- Photos of listed rental items stored in Supabase Storage
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.item_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.rental_items(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    alt_text TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------
-- Table 7: item_locations
-- PostGIS geography point (public pickup area/landmark, NOT private home)
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.item_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.rental_items(id) ON DELETE CASCADE,
    locality_id UUID REFERENCES public.localities(id) ON DELETE SET NULL,
    public_label TEXT NOT NULL,
    location geography(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------
-- Table 8: item_availability
-- Explicit lender calendar blocks / maintenance overrides
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.item_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES public.rental_items(id) ON DELETE CASCADE,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    quantity_blocked INT NOT NULL CHECK (quantity_blocked >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_item_avail_dates CHECK (ends_at > starts_at)
);

-- ----------------------------------------------------------------------
-- Table 9: rental_requests
-- Core booking transaction with locked snapshot quote
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rental_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tourist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    lender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    item_id UUID NOT NULL REFERENCES public.rental_items(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    rental_start TIMESTAMPTZ NOT NULL,
    rental_end TIMESTAMPTZ NOT NULL,
    handover_method TEXT NOT NULL CHECK (handover_method IN ('pickup', 'delivery')),
    tourist_note TEXT,
    rental_subtotal NUMERIC(12, 2) NOT NULL CHECK (rental_subtotal >= 0),
    platform_fee NUMERIC(12, 2) NOT NULL CHECK (platform_fee >= 0),
    delivery_charge NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (delivery_charge >= 0),
    security_deposit NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (security_deposit >= 0),
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'requested' CHECK (
        status IN (
            'requested', 'accepted', 'rejected', 'awaiting_payment',
            'payment_failed', 'paid', 'preparing', 'pickup_ready',
            'out_for_delivery', 'active', 'return_requested',
            'return_inspection', 'completed', 'cancelled',
            'refund_pending', 'refunded', 'disputed', 'lost'
        )
    ),
    idempotency_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_rental_dates CHECK (rental_end > rental_start)
);

CREATE TRIGGER set_rental_requests_updated_at
    BEFORE UPDATE ON public.rental_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------
-- Table 10: rental_payments
-- Gateway payment ledger using integer minor units (paise for INR)
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rental_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_request_id UUID NOT NULL REFERENCES public.rental_requests(id) ON DELETE RESTRICT,
    gateway TEXT NOT NULL DEFAULT 'razorpay',
    gateway_order_id TEXT UNIQUE,
    gateway_payment_id TEXT UNIQUE,
    amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    signature_verified_at TIMESTAMPTZ,
    captured_at TIMESTAMPTZ,
    refunded_amount_minor BIGINT NOT NULL DEFAULT 0 CHECK (refunded_amount_minor >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_rental_payments_updated_at
    BEFORE UPDATE ON public.rental_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------
-- Table 11: payment_webhook_events
-- Deduplicated incoming gateway webhooks
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gateway_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    payload_hash TEXT NOT NULL,
    processing_status TEXT NOT NULL DEFAULT 'received' CHECK (processing_status IN ('received', 'processed', 'ignored', 'failed')),
    error_message TEXT,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------
-- Table 12: rental_status_events
-- Append-only audit log for state machine transitions
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rental_status_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_request_id UUID NOT NULL REFERENCES public.rental_requests(id) ON DELETE CASCADE,
    from_status TEXT,
    to_status TEXT NOT NULL,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------
-- Table 13: handover_records
-- Pre-rental handover checklist, condition notes, and photo paths
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.handover_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_request_id UUID UNIQUE NOT NULL REFERENCES public.rental_requests(id) ON DELETE CASCADE,
    handed_over_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    received_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    handover_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    condition_note TEXT,
    photo_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------
-- Table 14: return_inspections
-- Post-rental return inspection checklist and damage evaluation
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.return_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_request_id UUID UNIQUE NOT NULL REFERENCES public.rental_requests(id) ON DELETE CASCADE,
    inspected_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    returned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    condition_note TEXT,
    photo_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
    inspection_result TEXT NOT NULL CHECK (inspection_result IN ('ok', 'damage_claim', 'missing_item')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------
-- Table 15: damage_claims
-- Supervised damage claims requiring admin review
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.damage_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_request_id UUID NOT NULL REFERENCES public.rental_requests(id) ON DELETE CASCADE,
    raised_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    evidence_paths TEXT[] DEFAULT ARRAY[]::TEXT[],
    claimed_amount NUMERIC(12, 2) NOT NULL CHECK (claimed_amount >= 0),
    decision TEXT NOT NULL DEFAULT 'pending' CHECK (decision IN ('pending', 'accepted', 'rejected', 'partial')),
    decided_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    decision_note TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------
-- Table 16: fee_policies
-- Configurable platform and delivery fee policies by locality
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fee_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    locality_id UUID NOT NULL REFERENCES public.localities(id) ON DELETE CASCADE,
    platform_fee_type TEXT NOT NULL CHECK (platform_fee_type IN ('fixed', 'percentage')),
    platform_fee_value NUMERIC(12, 2) NOT NULL CHECK (platform_fee_value >= 0),
    delivery_fee_type TEXT NOT NULL CHECK (delivery_fee_type IN ('fixed', 'quote', 'none')),
    delivery_fee_value NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (delivery_fee_value >= 0),
    effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    effective_to TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_fee_policies_updated_at
    BEFORE UPDATE ON public.fee_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------
-- Table 17: lender_membership_plans
-- Locality-specific membership tiers for local lenders
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lender_membership_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    locality_id UUID NOT NULL REFERENCES public.localities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    fee_amount NUMERIC(12, 2) NOT NULL CHECK (fee_amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    duration_days INT NOT NULL CHECK (duration_days > 0),
    max_active_listings INT DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_lender_membership_plans_updated_at
    BEFORE UPDATE ON public.lender_membership_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------
-- Table 18: lender_memberships
-- Lender active subscription records
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lender_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.lender_membership_plans(id) ON DELETE RESTRICT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    payment_reference TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_membership_dates CHECK (ends_at > starts_at)
);

-- ----------------------------------------------------------------------
-- Table 19: reviews
-- Tourist reviews for completed rentals (one review per rental)
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rental_request_id UUID UNIQUE NOT NULL REFERENCES public.rental_requests(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------
-- Table 20: notifications
-- User notification inbox
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    reference_id UUID,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------
-- Table 21: reports
-- Misconduct, misrepresentation, or policy violation reports
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    target_type TEXT NOT NULL CHECK (target_type IN ('item', 'lender', 'tourist', 'rental')),
    target_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------
-- Table 22: audit_logs
-- Immutable platform audit log for sensitive admin and financial operations
-- ----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id UUID,
    details JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

