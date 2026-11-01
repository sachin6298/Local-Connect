import os
import sys
import unittest
from datetime import date, timedelta
from fastapi import HTTPException
from pydantic import ValidationError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.auth import AuthenticatedUser
from app.modules.items.router import _ITEMS_STORE
from app.modules.lenders.router import _LENDERS_STORE
from app.modules.notifications.router import list_notifications, mark_all_notifications_read, mark_notification_read
from app.modules.requests.router import (
    _NOTIFICATIONS_STORE,
    _REQUESTS_STORE,
    accept_request,
    cancel_request,
    get_item_availability,
    create_rental_request,
    get_request_detail,
    list_my_requests,
    reject_request,
)
from app.modules.requests.schemas import CreateRentalRequestPayload, UpdateRequestStatusPayload


class TestRentalRequestsAndAvailability(unittest.TestCase):
    def setUp(self):
        _ITEMS_STORE.clear()
        _LENDERS_STORE.clear()
        _REQUESTS_STORE.clear()
        _NOTIFICATIONS_STORE.clear()

        self.lender = AuthenticatedUser(
            id="11111111-0000-0000-0000-000000000001",
            email="sharma.lender@example.com",
            role="lender",
            full_name="Sharma Family Rentals"
        )
        self.other_lender = AuthenticatedUser(
            id="11111111-0000-0000-0000-000000000002",
            email="other.lender@example.com",
            role="lender",
            full_name="Other Lender"
        )
        self.tourist = AuthenticatedUser(
            id="22222222-0000-0000-0000-000000000001",
            email="ramesh.tourist@example.com",
            role="tourist",
            full_name="Ramesh Kumar"
        )
        self.other_tourist = AuthenticatedUser(
            id="22222222-0000-0000-0000-000000000002",
            email="pooja.tourist@example.com",
            role="tourist",
            full_name="Pooja Verma"
        )
        self.admin = AuthenticatedUser(
            id="99999999-0000-0000-0000-000000000001",
            email="operator.admin@localconnect.app",
            role="admin",
            full_name="Operator Admin"
        )

        # Register lender record
        _LENDERS_STORE[self.lender.id] = {
            "user_id": self.lender.id,
            "display_name": "Sharma Family Rentals",
            "verification_status": "approved",
            "public_area_label": "Vishnupad Main Ghat",
        }

        # Seed rental item: Dhoti set, total_quantity = 5, rate = 120/day
        self.item_id = "sample-dhoti-01"
        _ITEMS_STORE[self.item_id] = {
            "id": self.item_id,
            "lender_id": self.lender.id,
            "category_id": "c1111111-1111-1111-1111-111111111111",
            "title": "White cotton dhoti & kurta set",
            "description": "Clean ritual cotton set",
            "condition_label": "Sanitised",
            "size_or_variant": "Free size",
            "total_quantity": 5,
            "price_amount": 120.0,
            "price_unit": "day",
            "currency": "INR",
            "minimum_duration": 1,
            "maximum_duration": 14,
            "pickup_available": True,
            "delivery_available": False,
            "status": "active",
            "lender_name": "Sharma Family Rentals",
            "public_location": "Vishnupad Main Ghat, Gaya",
            "created_at": "2026-11-01T00:00:00+00:00",
            "updated_at": "2026-11-01T00:00:00+00:00",
        }

    def test_create_request_success(self):
        today = date.today()
        start = today + timedelta(days=1)
        end = today + timedelta(days=3)  # 2 days

        payload = CreateRentalRequestPayload(
            item_id=self.item_id,
            rental_start=start,
            rental_end=end,
            quantity=2,
            handover_method="pickup",
            tourist_note="Please keep size L ready."
        )

        res = create_rental_request(payload, current_user=self.tourist)
        self.assertEqual(res.status, "requested")
        self.assertEqual(res.item_title, "White cotton dhoti & kurta set")
        self.assertEqual(res.quantity, 2)
        # Price calculation: 120 * 2 days * 2 qty = 480 subtotal; 10% fee = 48; total = 528
        self.assertEqual(res.rental_subtotal, 480.0)
        self.assertEqual(res.platform_fee, 48.0)
        self.assertEqual(res.total_amount, 528.0)

        # Verify lender notification was created
        notifs = list_notifications(current_user=self.lender)
        self.assertEqual(len(notifs), 1)
        self.assertIn("New Rental Request", notifs[0]["title"])

    def test_insufficient_availability_rejects(self):
        today = date.today()
        payload = CreateRentalRequestPayload(
            item_id=self.item_id,
            rental_start=today + timedelta(days=1),
            rental_end=today + timedelta(days=2),
            quantity=10,  # Exceeds total_quantity of 5
            handover_method="pickup"
        )
        with self.assertRaises(HTTPException) as ctx:
            create_rental_request(payload, current_user=self.tourist)
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Insufficient availability", ctx.exception.detail)

    def test_accept_request_and_atomic_conflict(self):
        today = date.today()
        start = today + timedelta(days=1)
        end = today + timedelta(days=3)

        payload1 = CreateRentalRequestPayload(
            item_id=self.item_id,
            rental_start=start,
            rental_end=end,
            quantity=4,
            handover_method="pickup"
        )
        req1 = create_rental_request(payload1, current_user=self.tourist)

        # 4 out of 5 units requested; attempting to request 2 units immediately fails
        payload_too_many = CreateRentalRequestPayload(
            item_id=self.item_id,
            rental_start=start,
            rental_end=end,
            quantity=2,
            handover_method="pickup"
        )
        with self.assertRaises(HTTPException) as ctx:
            create_rental_request(payload_too_many, current_user=self.other_tourist)
        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("Insufficient availability", ctx.exception.detail)

        # Requesting remaining 1 unit succeeds
        payload_last_unit = CreateRentalRequestPayload(
            item_id=self.item_id,
            rental_start=start,
            rental_end=end,
            quantity=1,
            handover_method="pickup"
        )
        req_last = create_rental_request(payload_last_unit, current_user=self.other_tourist)

        # Lender accepts req1 (takes 4 units)
        status_update = UpdateRequestStatusPayload()
        accepted1 = accept_request(req1.id, status_update, current_user=self.lender)
        self.assertEqual(accepted1.status, "accepted")

        # Tourist should receive notification
        tourist_notifs = list_notifications(current_user=self.tourist)
        self.assertEqual(len(tourist_notifs), 1)
        self.assertIn("Accepted", tourist_notifs[0]["title"])

        # Lender accepts req_last (takes remaining 1 unit)
        accepted_last = accept_request(req_last.id, status_update, current_user=self.lender)
        self.assertEqual(accepted_last.status, "accepted")

        # Inventory is now completely unavailable for those dates
        avail = get_item_availability(self.item_id, start=start.isoformat(), end=end.isoformat())
        self.assertEqual(avail["available_quantity"], 0)
        self.assertEqual(avail["status"], "unavailable")

        # Lender rejects req_last -> 1 unit is released back
        rejected_last = reject_request(req_last.id, UpdateRequestStatusPayload(reason="Stock defect"), current_user=self.lender)
        self.assertEqual(rejected_last.status, "rejected")

        avail_after_reject = get_item_availability(self.item_id, start=start.isoformat(), end=end.isoformat())
        self.assertEqual(avail_after_reject["available_quantity"], 1)
        self.assertEqual(avail_after_reject["status"], "partially_available")

    def test_reject_request_releases_availability(self):
        today = date.today()
        start = today + timedelta(days=1)
        end = today + timedelta(days=2)

        payload = CreateRentalRequestPayload(
            item_id=self.item_id,
            rental_start=start,
            rental_end=end,
            quantity=5,
            handover_method="pickup"
        )
        req = create_rental_request(payload, current_user=self.tourist)

        # Reject the request
        rejected = reject_request(
            req.id,
            UpdateRequestStatusPayload(reason="Item undergoing maintenance"),
            current_user=self.lender
        )
        self.assertEqual(rejected.status, "rejected")

        # Now all 5 units are available again
        avail = get_item_availability(
            self.item_id,
            start=start.isoformat(),
            end=end.isoformat()
        )
        self.assertEqual(avail["available_quantity"], 5)
        self.assertEqual(avail["status"], "available")

    def test_tourist_can_cancel_pending_request(self):
        today = date.today()
        payload = CreateRentalRequestPayload(
            item_id=self.item_id,
            rental_start=today + timedelta(days=2),
            rental_end=today + timedelta(days=4),
            quantity=1,
            handover_method="pickup"
        )
        req = create_rental_request(payload, current_user=self.tourist)

        cancelled = cancel_request(
            req.id,
            UpdateRequestStatusPayload(reason="Change of itinerary"),
            current_user=self.tourist
        )
        self.assertEqual(cancelled.status, "cancelled")

    def test_unauthorized_lender_cannot_accept(self):
        today = date.today()
        payload = CreateRentalRequestPayload(
            item_id=self.item_id,
            rental_start=today + timedelta(days=1),
            rental_end=today + timedelta(days=2),
            quantity=1,
            handover_method="pickup"
        )
        req = create_rental_request(payload, current_user=self.tourist)

        with self.assertRaises(HTTPException) as ctx:
            accept_request(req.id, UpdateRequestStatusPayload(), current_user=self.other_lender)
        self.assertEqual(ctx.exception.status_code, 403)

    def test_notifications_read_and_read_all(self):
        today = date.today()
        payload = CreateRentalRequestPayload(
            item_id=self.item_id,
            rental_start=today + timedelta(days=1),
            rental_end=today + timedelta(days=2),
            quantity=1,
            handover_method="pickup"
        )
        create_rental_request(payload, current_user=self.tourist)

        notifs = list_notifications(current_user=self.lender)
        self.assertEqual(len(notifs), 1)
        self.assertIsNone(notifs[0]["read_at"])

        # Mark single notification read
        updated = mark_notification_read(notifs[0]["id"], current_user=self.lender)
        self.assertIsNotNone(updated["read_at"])

        # Mark all read
        res = mark_all_notifications_read(current_user=self.lender)
        self.assertGreaterEqual(res["marked_read"], 0)


if __name__ == "__main__":
    unittest.main()
