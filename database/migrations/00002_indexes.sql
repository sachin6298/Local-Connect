-- LocalConnect Database Migration: 00002_indexes.sql
-- Performance Indexes: PostGIS GiST, B-tree, Composite and Partial Indexes

-- 1. PostGIS Spatial Index on item_locations
CREATE INDEX IF NOT EXISTS idx_item_locations_geog
    ON public.item_locations USING GIST (location);

-- 2. Rental Items Indexes
-- Partial index: only active listings queried during public search
CREATE INDEX IF NOT EXISTS idx_rental_items_active_category
    ON public.rental_items (category_id, created_at DESC)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_rental_items_lender_status
    ON public.rental_items (lender_id, status);

-- 3. Rental Requests Indexes
-- Critical for interval overlap availability checking:
-- existing_start < requested_end AND existing_end > requested_start
CREATE INDEX IF NOT EXISTS idx_rental_requests_availability
    ON public.rental_requests (item_id, rental_start, rental_end, status);

CREATE INDEX IF NOT EXISTS idx_rental_requests_tourist
    ON public.rental_requests (tourist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rental_requests_lender_status
    ON public.rental_requests (lender_id, status, created_at DESC);

-- 4. Item Availability (Manual blocks / overrides)
CREATE INDEX IF NOT EXISTS idx_item_availability_item_dates
    ON public.item_availability (item_id, starts_at, ends_at);

-- 5. Lender Profiles Index
CREATE INDEX IF NOT EXISTS idx_lender_profiles_locality_approved
    ON public.lender_profiles (locality_id)
    WHERE verification_status = 'approved';

-- 6. Rental Status Transition History
CREATE INDEX IF NOT EXISTS idx_rental_status_events_request
    ON public.rental_status_events (rental_request_id, created_at DESC);

-- 7. Payment and Webhook Indexes
CREATE INDEX IF NOT EXISTS idx_rental_payments_request
    ON public.rental_payments (rental_request_id);

CREATE INDEX IF NOT EXISTS idx_payment_webhooks_event_id
    ON public.payment_webhook_events (gateway_event_id);

-- 8. Notifications Partial Index (Unread notifications lookup)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
    ON public.notifications (recipient_id, created_at DESC)
    WHERE read_at IS NULL;

-- 9. Foreign Key & Operational Indexes
CREATE INDEX IF NOT EXISTS idx_item_images_item
    ON public.item_images (item_id, sort_order ASC);

CREATE INDEX IF NOT EXISTS idx_damage_claims_rental
    ON public.damage_claims (rental_request_id);

CREATE INDEX IF NOT EXISTS idx_fee_policies_locality_active
    ON public.fee_policies (locality_id, effective_from DESC)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_lender_memberships_lender
    ON public.lender_memberships (lender_id, status);

CREATE INDEX IF NOT EXISTS idx_reviews_target
    ON public.reviews (target_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_status
    ON public.reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor
    ON public.audit_logs (actor_id, created_at DESC);

