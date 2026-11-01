# User Journeys and Interaction Flows

## 1. Tourist journey — find and rent an item

1. Tourist opens LocalConnect.
2. Selects destination/locality or grants location permission.
3. Chooses category, enters natural-language need, or opens AI assistant.
4. Adds rental period and quantity.
5. Reviews available item cards.
6. Opens item detail page and inspects photos, condition, rental rate, locality, lender status and rules.
7. Selects pickup or delivery where available.
8. Sees a transparent quote before submitting.
9. Sends rental request.
10. Waits for lender acceptance.
11. On acceptance, pays through Razorpay Checkout.
12. Sees payment/rental confirmation only after trusted backend verification.
13. Collects item or receives delivery.
14. Uses item for agreed duration.
15. Returns item and receives return acknowledgement.
16. Leaves feedback after completion.

## 2. Local lender journey — list an item

1. Local person registers as lender.
2. Completes profile and locality information.
3. Submits verification details.
4. Admin reviews and approves/rejects.
5. Approved lender creates item listing.
6. Adds item description, category, condition, photos, quantity and rate.
7. Sets availability and handover/delivery rules.
8. Receives tourist request.
9. Checks requested period and item quantity.
10. Accepts/rejects.
11. Prepares item and records handover/delivery.
12. Receives returned item and records condition.
13. If damage is alleged, submits evidence for admin review.
14. Reviews rental history and earnings/fee ledger.

## 3. Admin journey

1. Admin signs in using a provisioned account.
2. Reviews lender verification queue.
3. Checks documents through private access.
4. Approves/rejects with reason.
5. Moderates listings and reported accounts.
6. Reviews disputed return/damage evidence.
7. Applies decision according to published policy.
8. Configures locality-specific platform and membership fees.
9. Monitors rental, payment and issue queues.

## 4. Rental status lifecycle

```text
REQUESTED
   ├── REJECTED
   ├── CANCELLED
   └── ACCEPTED
          |
          v
   AWAITING_PAYMENT
      ├── PAYMENT_FAILED
      └── PAID / CONFIRMED
             |
             v
        PREPARING
             |
       PICKUP_READY or OUT_FOR_DELIVERY
             |
             v
          ACTIVE
             |
       RETURN_REQUESTED
             |
             v
      RETURN_INSPECTION
        ├── DISPUTED
        └── COMPLETED
```

Additional terminal/exception states may include `REFUND_PENDING`, `REFUNDED`, `LOST` and `CANCELLED`. Use explicit transitions and actor permissions.

## 5. Damage/dispute journey

1. Lender records pre-handover condition and optional photos.
2. Tourist confirms receipt.
3. Tourist returns item.
4. Lender records post-return condition and evidence.
5. If condition differs beyond agreed wear/tear policy, lender opens claim.
6. Tourist receives claim and can respond with evidence.
7. Admin checks listing terms, before/after evidence and messages.
8. Admin records decision and reason.
9. Any penalty/refund is handled through an approved payment workflow.
10. Both parties receive a result notification.

AI may summarize evidence for an admin, but it must not make the final penalty decision.

## 6. Critical user-interface states

Every flow should include:
- Initial/loading state.
- Empty state with useful next action.
- Validation error.
- Permission denied.
- External service unavailable.
- Success confirmation.
- Pending state.
- Cancelled/rejected state.
- Retry/recovery path.
