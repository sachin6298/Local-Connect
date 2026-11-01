-- LocalConnect Database Migration: 00003_rls_policies.sql
-- Row Level Security: Multi-Role Policies (Tourist, Lender, Admin), Triggers & Protection

-- 1. Security Helper Functions (SECURITY DEFINER to avoid recursive RLS checks)
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
    RETURN COALESCE(v_role, 'anon');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (public.current_user_role() = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_approved_lender()
RETURNS BOOLEAN AS $$
DECLARE
    v_status TEXT;
BEGIN
    SELECT verification_status INTO v_status FROM public.lender_profiles WHERE user_id = auth.uid();
    RETURN (v_status = 'approved');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 2. Prevent Public Admin Registration and Self-Escalation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    requested_role TEXT;
BEGIN
    requested_role := NEW.raw_user_meta_data->>'role';
    -- Mandatory security rule: Never permit public admin registration
    IF requested_role IS NULL OR requested_role NOT IN ('tourist', 'lender') THEN
        requested_role := 'tourist';
    END IF;

    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'LocalConnect User'),
        NEW.raw_user_meta_data->>'phone',
        requested_role
    );

    IF requested_role = 'lender' THEN
        INSERT INTO public.lender_profiles (user_id, display_name, verification_status)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', 'Local Lender'),
            'draft'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on auth.users for automatic profile initialization
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger preventing regular users from self-promoting to admin
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only platform administrators can change user roles.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
    BEFORE UPDATE OF role ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_self_role_escalation();

-- Trigger preventing lenders from self-approving their verification_status
CREATE OR REPLACE FUNCTION public.prevent_lender_self_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.verification_status IS DISTINCT FROM NEW.verification_status AND NOT public.is_admin() THEN
        IF NEW.verification_status IN ('approved', 'suspended') THEN
            RAISE EXCEPTION 'Unauthorized: Only platform administrators can approve or suspend lenders.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_lender_self_approval ON public.lender_profiles;
CREATE TRIGGER trg_prevent_lender_self_approval
    BEFORE UPDATE OF verification_status ON public.lender_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_lender_self_approval();

-- ----------------------------------------------------------------------
-- 3. Enable RLS on All Tables
-- ----------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lender_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.localities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handover_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.damage_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lender_membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lender_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------
-- 4. Table-by-Table Explicit RLS Policies
-- ----------------------------------------------------------------------

-- 4.1 profiles
CREATE POLICY "profiles_select_public" ON public.profiles
    FOR SELECT USING (TRUE);

CREATE POLICY "profiles_update_owner_or_admin" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- 4.2 lender_profiles
CREATE POLICY "lender_profiles_select_approved_or_owner_or_admin" ON public.lender_profiles
    FOR SELECT USING (
        verification_status = 'approved'
        OR auth.uid() = user_id
        OR public.is_admin()
    );

CREATE POLICY "lender_profiles_insert_owner" ON public.lender_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "lender_profiles_update_owner_or_admin" ON public.lender_profiles
    FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- 4.3 localities
CREATE POLICY "localities_select_active_or_admin" ON public.localities
    FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "localities_all_admin" ON public.localities
    FOR ALL USING (public.is_admin());

-- 4.4 rental_categories
CREATE POLICY "rental_categories_select_active_or_admin" ON public.rental_categories
    FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "rental_categories_all_admin" ON public.rental_categories
    FOR ALL USING (public.is_admin());

-- 4.5 rental_items
-- Public can only see active items belonging to approved lenders
CREATE POLICY "rental_items_select_public_active" ON public.rental_items
    FOR SELECT USING (
        (status = 'active' AND EXISTS (
            SELECT 1 FROM public.lender_profiles lp
            WHERE lp.user_id = rental_items.lender_id AND lp.verification_status = 'approved'
        ))
        OR auth.uid() = lender_id
        OR public.is_admin()
    );

-- Only approved lenders can insert items
CREATE POLICY "rental_items_insert_approved_lender" ON public.rental_items
    FOR INSERT WITH CHECK (
        auth.uid() = lender_id
        AND public.is_approved_lender()
    );

CREATE POLICY "rental_items_update_owner_or_admin" ON public.rental_items
    FOR UPDATE USING (auth.uid() = lender_id OR public.is_admin());

CREATE POLICY "rental_items_delete_owner_or_admin" ON public.rental_items
    FOR DELETE USING (auth.uid() = lender_id OR public.is_admin());

-- 4.6 item_images
CREATE POLICY "item_images_select" ON public.item_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rental_items ri
            WHERE ri.id = item_images.item_id
        )
    );

CREATE POLICY "item_images_insert_owner_or_admin" ON public.item_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.rental_items ri
            WHERE ri.id = item_images.item_id
            AND (ri.lender_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "item_images_delete_owner_or_admin" ON public.item_images
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.rental_items ri
            WHERE ri.id = item_images.item_id
            AND (ri.lender_id = auth.uid() OR public.is_admin())
        )
    );

-- 4.7 item_locations
CREATE POLICY "item_locations_select" ON public.item_locations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rental_items ri
            WHERE ri.id = item_locations.item_id
        )
    );

CREATE POLICY "item_locations_all_owner_or_admin" ON public.item_locations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rental_items ri
            WHERE ri.id = item_locations.item_id
            AND (ri.lender_id = auth.uid() OR public.is_admin())
        )
    );

-- 4.8 item_availability
CREATE POLICY "item_availability_select" ON public.item_availability
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rental_items ri
            WHERE ri.id = item_availability.item_id
        )
    );

CREATE POLICY "item_availability_all_owner_or_admin" ON public.item_availability
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rental_items ri
            WHERE ri.id = item_availability.item_id
            AND (ri.lender_id = auth.uid() OR public.is_admin())
        )
    );

-- 4.9 rental_requests
-- Strict boundary: Tourist sees their requests, Lender sees assigned requests, Admin sees all
CREATE POLICY "rental_requests_select_participants_or_admin" ON public.rental_requests
    FOR SELECT USING (
        auth.uid() = tourist_id
        OR auth.uid() = lender_id
        OR public.is_admin()
    );

CREATE POLICY "rental_requests_insert_tourist" ON public.rental_requests
    FOR INSERT WITH CHECK (
        auth.uid() = tourist_id
        AND public.current_user_role() = 'tourist'
    );

CREATE POLICY "rental_requests_update_participants_or_admin" ON public.rental_requests
    FOR UPDATE USING (
        auth.uid() = tourist_id
        OR auth.uid() = lender_id
        OR public.is_admin()
    );

-- 4.10 rental_payments
-- Only participants and admins can read; client cannot insert directly
CREATE POLICY "rental_payments_select_participants_or_admin" ON public.rental_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rental_requests rr
            WHERE rr.id = rental_payments.rental_request_id
            AND (rr.tourist_id = auth.uid() OR rr.lender_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "rental_payments_admin_all" ON public.rental_payments
    FOR ALL USING (public.is_admin());

-- 4.11 payment_webhook_events
CREATE POLICY "payment_webhook_events_admin_all" ON public.payment_webhook_events
    FOR ALL USING (public.is_admin());

-- 4.12 rental_status_events
CREATE POLICY "rental_status_events_select_participants_or_admin" ON public.rental_status_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rental_requests rr
            WHERE rr.id = rental_status_events.rental_request_id
            AND (rr.tourist_id = auth.uid() OR rr.lender_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "rental_status_events_insert_participants_or_admin" ON public.rental_status_events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.rental_requests rr
            WHERE rr.id = rental_status_events.rental_request_id
            AND (rr.tourist_id = auth.uid() OR rr.lender_id = auth.uid() OR public.is_admin())
        )
    );

-- 4.13 handover_records
CREATE POLICY "handover_records_select_participants_or_admin" ON public.handover_records
    FOR SELECT USING (
        auth.uid() = handed_over_by
        OR auth.uid() = received_by
        OR public.is_admin()
    );

CREATE POLICY "handover_records_insert_update_participants" ON public.handover_records
    FOR ALL USING (
        auth.uid() = handed_over_by
        OR auth.uid() = received_by
        OR public.is_admin()
    );

-- 4.14 return_inspections
CREATE POLICY "return_inspections_select_participants_or_admin" ON public.return_inspections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rental_requests rr
            WHERE rr.id = return_inspections.rental_request_id
            AND (rr.tourist_id = auth.uid() OR rr.lender_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "return_inspections_insert_lender_or_admin" ON public.return_inspections
    FOR INSERT WITH CHECK (auth.uid() = inspected_by OR public.is_admin());

-- 4.15 damage_claims
CREATE POLICY "damage_claims_select_participants_or_admin" ON public.damage_claims
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.rental_requests rr
            WHERE rr.id = damage_claims.rental_request_id
            AND (rr.tourist_id = auth.uid() OR rr.lender_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "damage_claims_insert_participants" ON public.damage_claims
    FOR INSERT WITH CHECK (auth.uid() = raised_by OR public.is_admin());

CREATE POLICY "damage_claims_update_admin_only" ON public.damage_claims
    FOR UPDATE USING (public.is_admin());

-- 4.16 fee_policies
CREATE POLICY "fee_policies_select_active" ON public.fee_policies
    FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "fee_policies_modify_admin_only" ON public.fee_policies
    FOR ALL USING (public.is_admin());

-- 4.17 lender_membership_plans
CREATE POLICY "lender_membership_plans_select_active" ON public.lender_membership_plans
    FOR SELECT USING (is_active = TRUE OR public.is_admin());

CREATE POLICY "lender_membership_plans_modify_admin_only" ON public.lender_membership_plans
    FOR ALL USING (public.is_admin());

-- 4.18 lender_memberships
CREATE POLICY "lender_memberships_select_owner_or_admin" ON public.lender_memberships
    FOR SELECT USING (auth.uid() = lender_id OR public.is_admin());

CREATE POLICY "lender_memberships_all_owner_or_admin" ON public.lender_memberships
    FOR ALL USING (auth.uid() = lender_id OR public.is_admin());

-- 4.19 reviews
CREATE POLICY "reviews_select_public" ON public.reviews
    FOR SELECT USING (TRUE);

CREATE POLICY "reviews_insert_author" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "reviews_update_author_or_admin" ON public.reviews
    FOR UPDATE USING (auth.uid() = author_id OR public.is_admin());

-- 4.20 notifications
CREATE POLICY "notifications_select_recipient" ON public.notifications
    FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "notifications_update_recipient" ON public.notifications
    FOR UPDATE USING (auth.uid() = recipient_id);

-- 4.21 reports
CREATE POLICY "reports_select_reporter_or_admin" ON public.reports
    FOR SELECT USING (auth.uid() = reporter_id OR public.is_admin());

CREATE POLICY "reports_insert_authenticated" ON public.reports
    FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "reports_update_admin_only" ON public.reports
    FOR UPDATE USING (public.is_admin());

-- 4.22 audit_logs
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
    FOR ALL USING (public.is_admin());

