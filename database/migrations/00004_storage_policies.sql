-- LocalConnect Database Migration: 00004_storage_policies.sql
-- Storage Buckets & Policies: Item Images (Public) vs. Verification Documents (Private)

-- 1. Create Storage Buckets in storage.buckets if they do not exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('item-images', 'item-images', TRUE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('verification-documents', 'verification-documents', FALSE, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf']),
    ('handover-photos', 'handover-photos', FALSE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------------
-- 2. Storage Policies for 'item-images' (Public Read, Approved Lender Write)
-- ----------------------------------------------------------------------
CREATE POLICY "item_images_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'item-images');

CREATE POLICY "item_images_lender_insert" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'item-images'
        AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
        AND public.is_approved_lender()
    );

CREATE POLICY "item_images_lender_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'item-images'
        AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
    );

-- ----------------------------------------------------------------------
-- 3. Storage Policies for 'verification-documents' (Strictly Private)
-- ----------------------------------------------------------------------
-- Only the lender owner and platform administrators can read verification documents
CREATE POLICY "verification_docs_private_read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'verification-documents'
        AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
    );

CREATE POLICY "verification_docs_lender_insert" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'verification-documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "verification_docs_owner_delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'verification-documents'
        AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin())
    );

-- ----------------------------------------------------------------------
-- 4. Storage Policies for 'handover-photos' (Private: Rental Participants Only)
-- ----------------------------------------------------------------------
CREATE POLICY "handover_photos_read" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'handover-photos'
        AND (auth.uid() IS NOT NULL)
    );

CREATE POLICY "handover_photos_insert" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'handover-photos'
        AND (auth.uid() IS NOT NULL)
    );

