"""
LocalConnect Database Schema & RLS Test Suite
Validates versioned migrations, table schemas, PostGIS geometry,
indexes, security triggers, and explicit multi-role RLS policies.
Supports standard library unittest and pytest.
"""

import os
import re
import unittest

MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), "..", "migrations")
SEED_DIR = os.path.join(os.path.dirname(__file__), "..", "seed")

REQUIRED_TABLES = [
    "profiles",
    "lender_profiles",
    "localities",
    "rental_categories",
    "rental_items",
    "item_images",
    "item_locations",
    "item_availability",
    "rental_requests",
    "rental_payments",
    "payment_webhook_events",
    "rental_status_events",
    "handover_records",
    "return_inspections",
    "damage_claims",
    "fee_policies",
    "lender_membership_plans",
    "lender_memberships",
    "reviews",
    "notifications",
    "reports",
    "audit_logs",
]

def load_sql_file(filepath: str) -> str:
    with open(filepath, "r", encoding="utf-8") as f:
        return f.read()

class BaseDatabaseMigrationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.files = {
            "00001": load_sql_file(os.path.join(MIGRATIONS_DIR, "00001_initial_schema.sql")),
            "00002": load_sql_file(os.path.join(MIGRATIONS_DIR, "00002_indexes.sql")),
            "00003": load_sql_file(os.path.join(MIGRATIONS_DIR, "00003_rls_policies.sql")),
            "00004": load_sql_file(os.path.join(MIGRATIONS_DIR, "00004_storage_policies.sql")),
            "seed_gaya": load_sql_file(os.path.join(SEED_DIR, "00001_gaya_initial_seed.sql")),
        }

class TestDatabaseMigrationsStructure(BaseDatabaseMigrationTest):
    def test_migration_files_exist(self):
        expected_files = [
            "00001_initial_schema.sql",
            "00002_indexes.sql",
            "00003_rls_policies.sql",
            "00004_storage_policies.sql",
        ]
        for fname in expected_files:
            p = os.path.join(MIGRATIONS_DIR, fname)
            self.assertTrue(os.path.isfile(p), f"Missing migration file: {fname}")

    def test_seed_file_exists(self):
        seed_path = os.path.join(SEED_DIR, "00001_gaya_initial_seed.sql")
        self.assertTrue(os.path.isfile(seed_path), "Missing seed file: 00001_gaya_initial_seed.sql")

    def test_all_22_tables_defined(self):
        sql = self.files["00001"]
        for table in REQUIRED_TABLES:
            pattern = rf"CREATE\s+TABLE\s+(IF\s+NOT\s+EXISTS\s+)?public\.{table}\s*\("
            self.assertTrue(bool(re.search(pattern, sql, re.IGNORECASE)), f"Table public.{table} not found in 00001_initial_schema.sql")

    def test_uuid_primary_keys(self):
        sql = self.files["00001"]
        for table in REQUIRED_TABLES:
            tbl_match = re.search(rf"CREATE\s+TABLE\s+(IF\s+NOT\s+EXISTS\s+)?public\.{table}\s*\((.*?)\);", sql, re.DOTALL | re.IGNORECASE)
            self.assertIsNotNone(tbl_match, f"Could not extract body for table {table}")
            body = tbl_match.group(2)
            self.assertTrue(
                "UUID PRIMARY KEY" in body.upper() or "USER_ID UUID PRIMARY KEY" in body.upper(),
                f"Table {table} must have UUID PRIMARY KEY"
            )

    def test_foreign_key_constraints(self):
        sql = self.files["00001"]
        self.assertIn("REFERENCES auth.users(id) ON DELETE CASCADE", sql)
        self.assertIn("REFERENCES public.profiles(id) ON DELETE CASCADE", sql)
        self.assertIn("REFERENCES public.rental_categories(id)", sql)
        self.assertIn("REFERENCES public.rental_items(id)", sql)

    def test_postgis_geography_point(self):
        sql = self.files["00001"]
        self.assertIn('CREATE EXTENSION IF NOT EXISTS "postgis"', sql)
        self.assertTrue(bool(re.search(r"location\s+geography\(Point,\s*4326\)", sql, re.IGNORECASE)))

class TestDatabasePerformanceIndexes(BaseDatabaseMigrationTest):
    def test_spatial_gist_index_present(self):
        sql = self.files["00002"]
        pattern = r"CREATE\s+INDEX\s+.*?\s+ON\s+public\.item_locations\s+USING\s+GIST\s*\(\s*location\s*\)"
        self.assertTrue(bool(re.search(pattern, sql, re.IGNORECASE)), "Missing GiST index on item_locations(location)")

    def test_partial_index_for_active_items(self):
        sql = self.files["00002"]
        pattern = r"CREATE\s+INDEX\s+.*?\s+ON\s+public\.rental_items\s*\(.*?category_id.*?\)\s*WHERE\s+status\s*=\s*'active'"
        self.assertTrue(bool(re.search(pattern, sql, re.IGNORECASE)), "Missing partial index on rental_items where status = 'active'")

    def test_composite_availability_index(self):
        sql = self.files["00002"]
        pattern = r"CREATE\s+INDEX\s+.*?\s+ON\s+public\.rental_requests\s*\(.*?item_id.*?rental_start.*?rental_end.*?status.*?\)"
        self.assertTrue(bool(re.search(pattern, sql, re.IGNORECASE)), "Missing composite availability index on rental_requests")

    def test_status_events_and_payment_indexes(self):
        sql = self.files["00002"]
        self.assertIn("idx_rental_status_events_request", sql)
        self.assertIn("idx_rental_payments_request", sql)
        self.assertIn("idx_payment_webhooks_event_id", sql)

class TestRowLevelSecurityAndTriggers(BaseDatabaseMigrationTest):
    def test_rls_enabled_on_all_22_tables(self):
        sql = self.files["00003"]
        for table in REQUIRED_TABLES:
            pattern = rf"ALTER\s+TABLE\s+public\.{table}\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY\s*;"
            self.assertTrue(bool(re.search(pattern, sql, re.IGNORECASE)), f"RLS not enabled for table public.{table}")

    def test_admin_registration_prevented_in_trigger(self):
        sql = self.files["00003"]
        self.assertIn("requested_role NOT IN ('tourist', 'lender')", sql)
        self.assertIn("requested_role := 'tourist'", sql)

    def test_self_role_escalation_prevented(self):
        sql = self.files["00003"]
        self.assertIn("prevent_self_role_escalation", sql)
        self.assertIn("trg_prevent_role_escalation", sql)
        self.assertIn("Only platform administrators can change user roles", sql)

    def test_lender_self_approval_prevented(self):
        sql = self.files["00003"]
        self.assertIn("prevent_lender_self_approval", sql)
        self.assertIn("trg_prevent_lender_self_approval", sql)

    def test_explicit_policies_for_roles(self):
        sql = self.files["00003"]
        self.assertIn("rental_items_select_public_active", sql)
        self.assertIn("rental_items_insert_approved_lender", sql)
        self.assertIn("rental_requests_select_participants_or_admin", sql)
        self.assertIn("rental_requests_insert_tourist", sql)
        self.assertIn("damage_claims_select_participants_or_admin", sql)
        self.assertIn("damage_claims_update_admin_only", sql)
        self.assertIn("fee_policies_modify_admin_only", sql)

    def test_storage_bucket_policies_private_verification(self):
        sql = self.files["00004"]
        self.assertIn("'verification-documents', 'verification-documents', FALSE", sql)
        self.assertIn("verification_docs_private_read", sql)
        self.assertIn("public.is_admin()", sql)

class TestGayaJiSeedData(BaseDatabaseMigrationTest):
    def test_locality_gaya_ji_seeded(self):
        sql = self.files["seed_gaya"]
        self.assertIn("Gaya Ji", sql)
        self.assertIn("gaya-ji", sql)
        self.assertIn("'Bihar'", sql)

    def test_six_ppt_categories_seeded(self):
        sql = self.files["seed_gaya"]
        expected_categories = [
            "clothing",
            "backpacks",
            "utensils",
            "puja-materials",
            "household",
            "daily-use",
        ]
        for cat in expected_categories:
            self.assertIn(f"'{cat}'", sql, f"Category slug {cat} missing in seed data")

    def test_representative_items_with_coordinates(self):
        sql = self.files["seed_gaya"]
        self.assertIn("White cotton dhoti & kurta set", sql)
        self.assertIn("ST_MakePoint(85.0076, 24.7794)", sql)
        self.assertIn("Puja thali & ritual utensil kit", sql)
        self.assertIn("ST_MakePoint(85.0112, 24.7831)", sql)
        self.assertIn("Travel backpack · 40L", sql)
        self.assertIn("ST_MakePoint(84.9995, 24.8055)", sql)
        self.assertIn("Stainless-steel household utensil set", sql)
        self.assertIn("ST_MakePoint(85.0022, 24.7891)", sql)

class TestSecurityScenariosMatrix(BaseDatabaseMigrationTest):
    def test_tourist_cannot_approve_lender_policy(self):
        sql = self.files["00003"]
        self.assertIn("NEW.verification_status IN ('approved', 'suspended')", sql)
        self.assertIn("NOT public.is_admin()", sql)

    def test_unapproved_lender_cannot_insert_items(self):
        sql = self.files["00003"]
        self.assertIn("public.is_approved_lender()", sql)

    def test_tourist_cannot_read_arbitrary_bookings(self):
        sql = self.files["00003"]
        policy = re.search(r'CREATE\s+POLICY\s+"rental_requests_select_participants_or_admin".*?USING\s*\((.*?)\);', sql, re.DOTALL | re.IGNORECASE)
        self.assertIsNotNone(policy, "Policy rental_requests_select_participants_or_admin not found")
        condition = policy.group(1)
        self.assertIn("auth.uid() = tourist_id", condition)
        self.assertIn("auth.uid() = lender_id", condition)
        self.assertIn("public.is_admin()", condition)

if __name__ == "__main__":
    unittest.main()
