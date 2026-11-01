-- LocalConnect Seed Data: 00001_gaya_initial_seed.sql
-- Seed Data for Gaya Ji / Pitru Paksha Case Study

-- Deterministic UUIDs for idempotent seeding
-- Localities
DO $$
DECLARE
    v_gaya_id UUID := '11111111-1111-1111-1111-111111111111';
    v_cat_clothing UUID := '22222222-2222-2222-2222-222222222201';
    v_cat_backpacks UUID := '22222222-2222-2222-2222-222222222202';
    v_cat_utensils UUID := '22222222-2222-2222-2222-222222222203';
    v_cat_puja UUID := '22222222-2222-2222-2222-222222222204';
    v_cat_household UUID := '22222222-2222-2222-2222-222222222205';
    v_cat_daily UUID := '22222222-2222-2222-2222-222222222206';

    v_admin_id UUID := '33333333-3333-3333-3333-333333333333';
    v_lender_sharma UUID := '44444444-4444-4444-4444-444444444441';
    v_lender_seva UUID := '44444444-4444-4444-4444-444444444442';
    v_tourist_ramesh UUID := '55555555-5555-5555-5555-555555555551';

    v_item_dhoti UUID := '66666666-6666-6666-6666-666666666601';
    v_item_puja_kit UUID := '66666666-6666-6666-6666-666666666602';
    v_item_backpack UUID := '66666666-6666-6666-6666-666666666603';
    v_item_utensils UUID := '66666666-6666-6666-6666-666666666604';
BEGIN

    -- 1. Locality: Gaya Ji
    INSERT INTO public.localities (id, name, city, state, country_code, slug, is_active)
    VALUES (v_gaya_id, 'Gaya Ji', 'Gaya', 'Bihar', 'IN', 'gaya-ji', TRUE)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        city = EXCLUDED.city,
        state = EXCLUDED.state,
        slug = EXCLUDED.slug;

    -- 2. Rental Categories
    INSERT INTO public.rental_categories (id, name, slug, description, icon_key, is_active, sort_order)
    VALUES
        (v_cat_clothing, 'Clothing', 'clothing', 'Traditional pilgrimage garments, saffron/white clothes, and daily wear', 'Shirt', TRUE, 1),
        (v_cat_backpacks, 'Backpacks', 'backpacks', 'Travel backpacks, luggage, and carrying bags', 'Backpack', TRUE, 2),
        (v_cat_utensils, 'Utensils', 'utensils', 'Stainless-steel kitchenware, dining, and cooking utensils', 'CookingPot', TRUE, 3),
        (v_cat_puja, 'Puja materials', 'puja-materials', 'Ritual kits, Pind-daan brass thalis, and prayer essentials', 'Flower2', TRUE, 4),
        (v_cat_household, 'Household essentials', 'household', 'Temporary-use household and domestic essentials', 'House', TRUE, 5),
        (v_cat_daily, 'Daily-use items', 'daily-use', 'Other useful commodities tourists need during their journey', 'Package', TRUE, 6)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon_key = EXCLUDED.icon_key,
        sort_order = EXCLUDED.sort_order;

    -- 3. Locality Fee Policies
    INSERT INTO public.fee_policies (
        locality_id, platform_fee_type, platform_fee_value,
        delivery_fee_type, delivery_fee_value, is_active
    ) VALUES (
        v_gaya_id, 'percentage', 10.00, 'fixed', 50.00, TRUE
    ) ON CONFLICT DO NOTHING;

    -- 4. Lender Membership Plans
    INSERT INTO public.lender_membership_plans (
        locality_id, name, description, fee_amount, currency, duration_days, max_active_listings, is_active
    ) VALUES
        (v_gaya_id, 'Gaya Standard Monthly', 'Standard plan for local home-lenders in Gaya', 199.00, 'INR', 30, 10, TRUE),
        (v_gaya_id, 'Pitru Paksha Festival Pass', 'Special high-volume seasonal pass for pilgrimage season', 499.00, 'INR', 45, 50, TRUE)
    ON CONFLICT DO NOTHING;

    -- 5. Seed Users & Profiles (Requires mock entries in auth.users if run in Supabase)
    -- Insert into auth.users if not present for local development seed
    BEGIN
        INSERT INTO auth.users (id, email, raw_user_meta_data)
        VALUES
            (v_admin_id, 'admin@localconnect.app', '{"full_name": "Platform Admin", "role": "admin"}'::jsonb),
            (v_lender_sharma, 'sharma@localconnect.app', '{"full_name": "Sharma Family Rentals", "role": "lender"}'::jsonb),
            (v_lender_seva, 'seva@localconnect.app', '{"full_name": "Gaya Seva Store", "role": "lender"}'::jsonb),
            (v_tourist_ramesh, 'ramesh@localconnect.app', '{"full_name": "Ramesh Kumar", "role": "tourist"}'::jsonb)
        ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN foreign_key_violation OR undefined_table THEN
        -- If running without auth.users mock table, seed profiles directly if constraints permit
        NULL;
    END;

    -- Profiles
    INSERT INTO public.profiles (id, full_name, phone, role, preferred_language)
    VALUES
        (v_admin_id, 'LocalConnect Platform Admin', '+919999900000', 'admin', 'en'),
        (v_lender_sharma, 'Radhe Mohan Sharma', '+919888811111', 'lender', 'hi'),
        (v_lender_seva, 'Gaya Seva Sansthan', '+919888822222', 'lender', 'hi'),
        (v_tourist_ramesh, 'Ramesh Kumar', '+919777733333', 'tourist', 'en')
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;

    -- Lender Profiles (Approved Status)
    INSERT INTO public.lender_profiles (
        user_id, display_name, description, locality_id,
        public_area_label, verification_status, languages
    ) VALUES
        (v_lender_sharma, 'Sharma Family Rentals', 'Local family residing near Vishnupad temple offering clean clothes and ritual utensils', v_gaya_id, 'Vishnupad Temple Area, Gaya', 'approved', ARRAY['Hindi', 'English']),
        (v_lender_seva, 'Gaya Seva Store', 'Verified pilgrim assistance and community rental shop near Deoghat', v_gaya_id, 'Deoghat, Gaya', 'approved', ARRAY['Hindi'])
    ON CONFLICT (user_id) DO UPDATE SET
        display_name = EXCLUDED.display_name,
        verification_status = EXCLUDED.verification_status;

    -- 6. Rental Items
    -- Item 1: White dhoti kurta set (Clothing)
    INSERT INTO public.rental_items (
        id, lender_id, category_id, title, description,
        condition_label, size_or_variant, total_quantity,
        price_amount, price_unit, currency, minimum_duration,
        pickup_available, delivery_available, status
    ) VALUES (
        v_item_dhoti, v_lender_sharma, v_cat_clothing,
        'White cotton dhoti & kurta set',
        'Clean, washed and sanitised pure cotton dhoti and kurta set suitable for Pind-daan ceremonies and temple rituals.',
        'Very good · Freshly laundered', 'Free size (Large)', 8,
        120.00, 'day', 'INR', 1,
        TRUE, TRUE, 'active'
    ) ON CONFLICT (id) DO UPDATE SET
        price_amount = EXCLUDED.price_amount,
        status = EXCLUDED.status;

    -- Location for Item 1 (Near Vishnupad Temple: 24.7794° N, 85.0076° E)
    DELETE FROM public.item_locations WHERE item_id = v_item_dhoti;
    INSERT INTO public.item_locations (item_id, locality_id, public_label, location)
    VALUES (
        v_item_dhoti, v_gaya_id, 'Vishnupad Temple East Gate, Gaya',
        ST_SetSRID(ST_MakePoint(85.0076, 24.7794), 4326)::geography
    );

    -- Item 2: Puja thali & utensil kit (Puja materials)
    INSERT INTO public.rental_items (
        id, lender_id, category_id, title, description,
        condition_label, size_or_variant, total_quantity,
        price_amount, price_unit, currency, minimum_duration,
        pickup_available, delivery_available, status
    ) VALUES (
        v_item_puja_kit, v_lender_seva, v_cat_puja,
        'Puja thali & ritual utensil kit',
        'Brass thali, lota, bell, spoon, and ceremonial containers for Pitru Paksha rituals. Thoroughly polished and clean.',
        'Clean · Polished Brass', 'Standard 5-piece kit', 12,
        80.00, 'day', 'INR', 1,
        TRUE, TRUE, 'active'
    ) ON CONFLICT (id) DO UPDATE SET
        price_amount = EXCLUDED.price_amount,
        status = EXCLUDED.status;

    -- Location for Item 2 (Near Deoghat: 24.7831° N, 85.0112° E)
    DELETE FROM public.item_locations WHERE item_id = v_item_puja_kit;
    INSERT INTO public.item_locations (item_id, locality_id, public_label, location)
    VALUES (
        v_item_puja_kit, v_gaya_id, 'Deoghat Riverside Road, Gaya',
        ST_SetSRID(ST_MakePoint(85.0112, 24.7831), 4326)::geography
    );

    -- Item 3: Travel backpack 40L (Backpacks)
    INSERT INTO public.rental_items (
        id, lender_id, category_id, title, description,
        condition_label, size_or_variant, total_quantity,
        price_amount, price_unit, currency, minimum_duration,
        pickup_available, delivery_available, status
    ) VALUES (
        v_item_backpack, v_lender_sharma, v_cat_backpacks,
        'Travel backpack · 40L',
        'Durable water-resistant rucksack with padded straps and rain cover. Ideal for short pilgrimage stays and day travel.',
        'Good · Clean zippers', '40 Litres', 4,
        60.00, 'day', 'INR', 1,
        TRUE, FALSE, 'active'
    ) ON CONFLICT (id) DO UPDATE SET
        price_amount = EXCLUDED.price_amount,
        status = EXCLUDED.status;

    -- Location for Item 3 (Near Gaya Junction: 24.8055° N, 84.9995° E)
    DELETE FROM public.item_locations WHERE item_id = v_item_backpack;
    INSERT INTO public.item_locations (item_id, locality_id, public_label, location)
    VALUES (
        v_item_backpack, v_gaya_id, 'Station Road near Gaya Junction',
        ST_SetSRID(ST_MakePoint(84.9995, 24.8055), 4326)::geography
    );

    -- Item 4: Stainless-steel utensil set (Utensils)
    INSERT INTO public.rental_items (
        id, lender_id, category_id, title, description,
        condition_label, size_or_variant, total_quantity,
        price_amount, price_unit, currency, minimum_duration,
        pickup_available, delivery_available, status
    ) VALUES (
        v_item_utensils, v_lender_seva, v_cat_utensils,
        'Stainless-steel household utensil set',
        'Cooking pots, plates, bowls, and serving spoons for family pilgrims staying in guest houses or dharamsalas.',
        'Very good · Sanitised food-grade', '8-piece family set', 6,
        100.00, 'day', 'INR', 2,
        TRUE, TRUE, 'active'
    ) ON CONFLICT (id) DO UPDATE SET
        price_amount = EXCLUDED.price_amount,
        status = EXCLUDED.status;

    -- Location for Item 4 (Near Mangla Gauri Temple: 24.7891° N, 85.0022° E)
    DELETE FROM public.item_locations WHERE item_id = v_item_utensils;
    INSERT INTO public.item_locations (item_id, locality_id, public_label, location)
    VALUES (
        v_item_utensils, v_gaya_id, 'Mangla Gauri Temple Road, Gaya',
        ST_SetSRID(ST_MakePoint(85.0022, 24.7891), 4326)::geography
    );

END $$;

