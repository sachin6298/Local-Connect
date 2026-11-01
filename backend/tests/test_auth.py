"""
LocalConnect Authentication, Authorization & Security Test Suite
Tests JWT cryptographic verification, role-based access control,
cross-user isolation, session expiration, and role-escalation prevention.
"""

import sys
import os
import unittest
from fastapi import HTTPException

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.core.auth import (
    AuthenticatedUser,
    create_test_jwt,
    decode_and_verify_supabase_jwt,
    get_current_user,
)
from app.core.permissions import (
    require_admin,
    require_lender,
    require_tourist,
    verify_user_ownership,
)
from app.modules.users.router import (
    ProfileUpdateRequest,
    _get_or_create_profile,
    get_admin_dashboard,
    get_lender_dashboard,
    get_my_profile,
    get_tourist_dashboard,
    get_user_by_id,
    update_my_profile,
    update_user_by_id,
)

class TestAuthenticationAndAuthorization(unittest.TestCase):
    def setUp(self):
        # Deterministic test identities
        self.tourist_a_id = "aaaa1111-1111-1111-1111-111111111111"
        self.tourist_b_id = "bbbb2222-2222-2222-2222-222222222222"
        self.lender_id = "cccc3333-3333-3333-3333-333333333333"
        self.admin_id = "dddd4444-4444-4444-4444-444444444444"

        # Valid signed JWT tokens
        self.token_tourist_a = create_test_jwt(self.tourist_a_id, "tourist_a@example.com", role="tourist", full_name="Tourist A")
        self.token_tourist_b = create_test_jwt(self.tourist_b_id, "tourist_b@example.com", role="tourist", full_name="Tourist B")
        self.token_lender = create_test_jwt(self.lender_id, "lender@example.com", role="lender", full_name="Local Lender")
        self.token_admin = create_test_jwt(self.admin_id, "admin@localconnect.app", role="admin", full_name="Super Admin")

        # Verified AuthenticatedUser objects
        self.user_tourist_a = get_current_user(f"Bearer {self.token_tourist_a}")
        self.user_tourist_b = get_current_user(f"Bearer {self.token_tourist_b}")
        self.user_lender = get_current_user(f"Bearer {self.token_lender}")
        self.user_admin = get_current_user(f"Bearer {self.token_admin}")

        # Seed profile store
        _get_or_create_profile(self.user_tourist_a)
        _get_or_create_profile(self.user_tourist_b)
        _get_or_create_profile(self.user_lender)
        _get_or_create_profile(self.user_admin)

    # 1. Token Validation & Expiration Tests
    def test_missing_token_raises_401(self):
        with self.assertRaises(HTTPException) as ctx:
            get_current_user(None)
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("Authorization header missing", ctx.exception.detail)

    def test_malformed_token_raises_401(self):
        with self.assertRaises(HTTPException) as ctx:
            get_current_user("Bearer not.a.valid.jwt.string")
        self.assertEqual(ctx.exception.status_code, 401)

    def test_expired_token_raises_401(self):
        expired_token = create_test_jwt(
            self.tourist_a_id, "expired@example.com", role="tourist", expires_in_seconds=-10
        )
        with self.assertRaises(HTTPException) as ctx:
            get_current_user(f"Bearer {expired_token}")
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("Session expired", ctx.exception.detail)

    def test_invalid_signature_raises_401(self):
        tampered_token = create_test_jwt(
            self.tourist_a_id, "hacker@example.com", role="admin", secret="wrong-secret-key"
        )
        with self.assertRaises(HTTPException) as ctx:
            get_current_user(f"Bearer {tampered_token}")
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("Invalid token signature", ctx.exception.detail)

    # 2. Identity & Role Derivation Tests
    def test_tourist_claims_derivation(self):
        self.assertEqual(self.user_tourist_a.id, self.tourist_a_id)
        self.assertEqual(self.user_tourist_a.role, "tourist")
        self.assertTrue(self.user_tourist_a.is_tourist)
        self.assertFalse(self.user_tourist_a.is_lender)
        self.assertFalse(self.user_tourist_a.is_admin)

    def test_lender_claims_derivation(self):
        self.assertEqual(self.user_lender.id, self.lender_id)
        self.assertEqual(self.user_lender.role, "lender")
        self.assertTrue(self.user_lender.is_lender)
        self.assertFalse(self.user_lender.is_admin)

    def test_admin_claims_derivation(self):
        self.assertEqual(self.user_admin.id, self.admin_id)
        self.assertEqual(self.user_admin.role, "admin")
        self.assertTrue(self.user_admin.is_admin)

    # 3. Role-Based Access Control Tests
    def test_tourist_access_tourist_dashboard(self):
        resp = get_tourist_dashboard(self.user_tourist_a)
        self.assertEqual(resp["status"], "success")
        self.assertEqual(resp["role"], "tourist")

    def test_tourist_forbidden_from_admin_dashboard(self):
        with self.assertRaises(HTTPException) as ctx:
            require_admin(self.user_tourist_a)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("Access denied", ctx.exception.detail)

    def test_tourist_forbidden_from_lender_dashboard(self):
        with self.assertRaises(HTTPException) as ctx:
            require_lender(self.user_tourist_a)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("Access denied", ctx.exception.detail)

    def test_lender_access_lender_dashboard(self):
        resp = get_lender_dashboard(self.user_lender)
        self.assertEqual(resp["status"], "success")
        self.assertEqual(resp["role"], "lender")

    def test_lender_forbidden_from_admin_dashboard(self):
        with self.assertRaises(HTTPException) as ctx:
            require_admin(self.user_lender)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("Access denied", ctx.exception.detail)

    def test_admin_access_admin_dashboard(self):
        resp = get_admin_dashboard(self.user_admin)
        self.assertEqual(resp["status"], "success")
        self.assertEqual(resp["role"], "admin")

    # 4. Profile Management & Cross-User Security Tests
    def test_tourist_can_read_own_profile(self):
        profile = get_my_profile(self.user_tourist_a)
        self.assertEqual(profile.id, self.tourist_a_id)
        self.assertEqual(profile.role, "tourist")
        self.assertEqual(profile.full_name, "Tourist A")

    def test_cross_user_read_isolation(self):
        # Tourist A attempts to read Tourist B's record
        with self.assertRaises(HTTPException) as ctx:
            get_user_by_id(self.tourist_b_id, self.user_tourist_a)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("Forbidden", ctx.exception.detail)

    def test_cross_user_update_isolation(self):
        # Tourist A attempts to modify Tourist B's record
        payload = ProfileUpdateRequest(full_name="Compromised Name")
        with self.assertRaises(HTTPException) as ctx:
            update_user_by_id(self.tourist_b_id, payload, self.user_tourist_a)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("Forbidden", ctx.exception.detail)

    def test_role_self_escalation_prevention(self):
        # Tourist attempts to elevate their role to 'admin'
        payload = ProfileUpdateRequest(role="admin")
        with self.assertRaises(HTTPException) as ctx:
            update_my_profile(payload, self.user_tourist_a)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("User role cannot be self-modified", ctx.exception.detail)

    def test_admin_supervision_access(self):
        # Platform admin can access Tourist A's profile for operational moderation
        profile = get_user_by_id(self.tourist_a_id, self.user_admin)
        self.assertEqual(profile.id, self.tourist_a_id)
        self.assertEqual(profile.role, "tourist")

if __name__ == "__main__":
    unittest.main()
