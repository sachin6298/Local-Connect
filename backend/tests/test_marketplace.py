import os
import sys
import unittest
from fastapi import HTTPException
from pydantic import ValidationError

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.auth import AuthenticatedUser
from app.modules.items.router import (
    _ITEMS_STORE,
    create_rental_item,
    deactivate_rental_item,
    get_item_by_id,
    list_categories,
    list_localities,
    list_my_items,
    list_public_items,
    update_rental_item,
)
from app.modules.items.schemas import ItemCreateRequest, ItemUpdateRequest
from app.modules.lenders.router import (
    _LENDERS_STORE,
    decide_lender_verification,
    get_my_lender_profile,
    get_public_lender_profile,
    onboard_lender_details,
    submit_verification_documents,
)
from app.modules.lenders.schemas import (
    LenderDecisionRequest,
    LenderOnboardingRequest,
    LenderVerificationSubmission,
)

class TestMarketplaceAndLenderModule(unittest.TestCase):
    def setUp(self):
        _LENDERS_STORE.clear()
        _ITEMS_STORE.clear()

        self.lender_a = AuthenticatedUser(
            id="10000000-0000-0000-0000-000000000001",
            email="sharma.lender@example.com",
            role="lender",
            full_name="Sharma Family Rentals"
        )
        self.lender_b = AuthenticatedUser(
            id="20000000-0000-0000-0000-000000000002",
            email="gupta.lender@example.com",
            role="lender",
            full_name="Gupta Puja Store"
        )
        self.tourist = AuthenticatedUser(
            id="30000000-0000-0000-0000-000000000003",
            email="ramesh.tourist@example.com",
            role="tourist",
            full_name="Ramesh Pilgrim"
        )
        self.admin = AuthenticatedUser(
            id="99999999-9999-9999-9999-999999999999",
            email="admin@localconnect.internal",
            role="admin",
            full_name="Platform Overseer"
        )

    def test_categories_and_localities_catalog(self):
        categories = list_categories()
        self.assertEqual(len(categories), 6)
        cat_names = [c.name for c in categories]
        self.assertIn("Clothing", cat_names)
        self.assertIn("Backpacks", cat_names)
        self.assertIn("Utensils", cat_names)
        self.assertIn("Puja materials", cat_names)
        self.assertIn("Household essentials", cat_names)
        self.assertIn("Daily-use items", cat_names)

        localities = list_localities()
        self.assertGreaterEqual(len(localities), 1)
        self.assertTrue(any("Gaya" in loc.name for loc in localities))

    def test_lender_lifecycle_onboarding_and_verification(self):
        # 1. New lender profile starts as 'draft'
        profile = get_my_lender_profile(self.lender_a)
        self.assertEqual(profile.verification_status, "draft")

        # 2. Onboard lender details
        onboard_payload = LenderOnboardingRequest(
            display_name="Sharma Ji Pind-daan Supplies",
            description="Lending genuine cotton dhotis and pure brass puja sets near Vishnupad.",
            public_area_label="Vishnupad Main Ghat, Gaya",
            languages=["Hindi", "Maithili"]
        )
        updated = onboard_lender_details(onboard_payload, self.lender_a)
        self.assertEqual(updated.display_name, "Sharma Ji Pind-daan Supplies")
        self.assertEqual(updated.public_area_label, "Vishnupad Main Ghat, Gaya")

        # 3. Submit verification documents to private storage
        doc_payload = LenderVerificationSubmission(
            document_paths=["verification-documents/sharma_aadhaar.pdf", "verification-documents/shop_photo.jpg"],
            notes="Submitted for verification."
        )
        submitted = submit_verification_documents(doc_payload, self.lender_a)
        self.assertEqual(submitted.verification_status, "submitted")
        self.assertEqual(len(submitted.verification_document_paths), 2)

        # 4. Public access by tourist fails while unapproved
        with self.assertRaises(HTTPException) as ctx:
            get_public_lender_profile(self.lender_a.id, self.tourist)
        self.assertEqual(ctx.exception.status_code, 404)

        # 5. Admin approves lender
        decision_payload = LenderDecisionRequest(decision="approved", note="Documents verified.")
        approved = decide_lender_verification(self.lender_a.id, decision_payload, self.admin)
        self.assertEqual(approved.verification_status, "approved")

        # 6. Tourist can now view public approved profile
        public_view = get_public_lender_profile(self.lender_a.id, self.tourist)
        self.assertEqual(public_view.display_name, "Sharma Ji Pind-daan Supplies")
        self.assertEqual(public_view.verification_status, "approved")

    def test_unapproved_lender_items_hidden_from_public(self):
        # Lender A is still unapproved (draft)
        item_payload = ItemCreateRequest(
            title="White cotton dhoti set",
            category_id="c1111111-1111-1111-1111-111111111111",
            description="Pure cotton sacred dhoti for pilgrimage rituals.",
            condition_label="Brand new",
            total_quantity=5,
            price_amount=120.0,
            price_unit="day",
            public_location_label="Near Vishnupad Ghat"
        )
        item = create_rental_item(item_payload, self.lender_a)
        self.assertEqual(item.status, "draft")  # Unapproved lender items are drafts

        # Public search should NOT show draft item
        public_items = list_public_items()
        self.assertEqual(public_items.total, 0)

        # Approve Lender A
        decide_lender_verification(self.lender_a.id, LenderDecisionRequest(decision="approved"), self.admin)

        # Lender A creates second item after approval -> status is active
        item_2 = create_rental_item(
            ItemCreateRequest(
                title="Brass Aarti Thali & Bell",
                category_id="c4444444-4444-4444-4444-444444444444",
                description="Complete brass puja thali with incense stand and ghanti.",
                condition_label="Polished · Good",
                total_quantity=3,
                price_amount=80.0,
                price_unit="day",
                public_location_label="Vishnupad Temple Gate"
            ),
            self.lender_a
        )
        self.assertEqual(item_2.status, "active")

        # Public search now shows the active item
        public_items_after = list_public_items()
        self.assertEqual(public_items_after.total, 1)
        self.assertEqual(public_items_after.items[0].id, item_2.id)

    def test_cross_lender_modification_forbidden(self):
        # Approve both lenders
        decide_lender_verification(self.lender_a.id, LenderDecisionRequest(decision="approved"), self.admin)
        decide_lender_verification(self.lender_b.id, LenderDecisionRequest(decision="approved"), self.admin)

        # Lender A creates item
        item_a = create_rental_item(
            ItemCreateRequest(
                title="Lender A Rucksack",
                category_id="c2222222-2222-2222-2222-222222222222",
                description="50L backpack for pilgrims.",
                condition_label="Good",
                total_quantity=2,
                price_amount=70.0,
                price_unit="day",
                public_location_label="Gaya Station"
            ),
            self.lender_a
        )

        # Lender B tries to modify Lender A's item -> Must fail with 403
        update_payload = ItemUpdateRequest(title="Hijacked Title", price_amount=999.0)
        with self.assertRaises(HTTPException) as ctx:
            update_rental_item(item_a.id, update_payload, self.lender_b)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("modify only your own items", ctx.exception.detail)

        # Lender A updates their own item -> Succeeds
        success_update = update_rental_item(item_a.id, ItemUpdateRequest(price_amount=75.0), self.lender_a)
        self.assertEqual(success_update.price_amount, 75.0)

    def test_item_deactivation_and_reactivation_flow(self):
        # Approve Lender A
        decide_lender_verification(self.lender_a.id, LenderDecisionRequest(decision="approved"), self.admin)

        # Create active item
        item = create_rental_item(
            ItemCreateRequest(
                title="Stainless steel cooking pot set",
                category_id="c3333333-3333-3333-3333-333333333333",
                description="Cooking utensil set suitable for family meals.",
                condition_label="Very good",
                total_quantity=4,
                price_amount=100.0,
                price_unit="day",
                public_location_label="Gaya City"
            ),
            self.lender_a
        )
        self.assertEqual(item.status, "active")

        # Deactivate item
        deactivated = deactivate_rental_item(item.id, self.lender_a)
        self.assertEqual(deactivated.status, "paused")

        # Public search should now hide it
        public_items = list_public_items()
        self.assertEqual(public_items.total, 0)

        # Reactivate item
        reactivated = update_rental_item(item.id, ItemUpdateRequest(status="active"), self.lender_a)
        self.assertEqual(reactivated.status, "active")

        # Public search now shows it again
        public_items_after = list_public_items()
        self.assertEqual(public_items_after.total, 1)

    def test_lender_inventory_pagination(self):
        # Approve Lender A
        decide_lender_verification(self.lender_a.id, LenderDecisionRequest(decision="approved"), self.admin)

        # Create 3 items for Lender A
        for i in range(3):
            create_rental_item(
                ItemCreateRequest(
                    title=f"Travel Item {i+1}",
                    category_id="c6666666-6666-6666-6666-666666666666",
                    description=f"Useful travel item {i+1} for pilgrimage.",
                    condition_label="Good",
                    total_quantity=1,
                    price_amount=50.0 + i * 10,
                    price_unit="day",
                    public_location_label="Vishnupad area"
                ),
                self.lender_a
            )

        # Page 1 with page_size=2
        page1 = list_my_items(page=1, page_size=2, current_user=self.lender_a)
        self.assertEqual(page1.total, 3)
        self.assertEqual(len(page1.items), 2)
        self.assertEqual(page1.total_pages, 2)

        # Page 2 with page_size=2
        page2 = list_my_items(page=2, page_size=2, current_user=self.lender_a)
        self.assertEqual(page2.total, 3)
        self.assertEqual(len(page2.items), 1)

    def test_price_editing_validation_and_authorization(self):
        """
        Comprehensive test for Price Edit feature:
        1. Reject negative prices and invalid inputs.
        2. Prevent unauthorized cross-user modifications.
        3. Allow authorized lender to update price and price_unit.
        4. Allow administrator to update price.
        5. Verify price changes persist and are accurately returned.
        """
        # Approve Lender A
        decide_lender_verification(self.lender_a.id, LenderDecisionRequest(decision="approved"), self.admin)

        # Create item
        item = create_rental_item(
            ItemCreateRequest(
                title="Sacred Copper Lota Kit",
                category_id="c4444444-4444-4444-4444-444444444444",
                description="Consecrated copper vessel kit for river rituals.",
                condition_label="Polished",
                total_quantity=5,
                price_amount=80.0,
                price_unit="day",
                public_location_label="Vishnupad North Ghat"
            ),
            self.lender_a
        )
        self.assertEqual(item.price_amount, 80.0)
        self.assertEqual(item.price_unit, "day")

        # 1. Validation: Reject negative price amounts
        with self.assertRaises(ValidationError):
            ItemUpdateRequest(price_amount=-15.0)

        # 2. Validation: Reject invalid price units
        with self.assertRaises(ValidationError):
            ItemUpdateRequest(price_unit="century")

        # 3. Security: Lender B (unauthorized) cannot modify Lender A's item price
        with self.assertRaises(HTTPException) as ctx:
            update_rental_item(item.id, ItemUpdateRequest(price_amount=150.0), self.lender_b)
        self.assertEqual(ctx.exception.status_code, 403)

        # 4. Success: Owner Lender A updates price and unit
        updated_item = update_rental_item(
            item.id,
            ItemUpdateRequest(price_amount=120.0, price_unit="day"),
            self.lender_a
        )
        self.assertEqual(updated_item.price_amount, 120.0)
        self.assertEqual(updated_item.price_unit, "day")

        # 5. Success: Platform Admin updates price
        admin_updated = update_rental_item(
            item.id,
            ItemUpdateRequest(price_amount=135.0),
            self.admin
        )
        self.assertEqual(admin_updated.price_amount, 135.0)

        # 6. Persistence check via get_item_by_id
        fetched = get_item_by_id(item.id, self.lender_a)
        self.assertEqual(fetched.price_amount, 135.0)

if __name__ == "__main__":
    unittest.main()

