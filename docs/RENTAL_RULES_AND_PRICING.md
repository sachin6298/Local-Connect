# Rental Lifecycle, Pricing and Operational Rules

## 1. Core principle

LocalConnect facilitates temporary rental of goods owned by local lenders. It is a platform bridge and supervises the interaction; the platform does not become the owner of listed inventory.

## 2. Rental duration model

The presentation does not specify whether a rental is hourly, daily or event-based. Support a configurable `price_unit` on each listing:
- Hour.
- Day.
- Event period.
- Fixed agreed period.

Do not compare prices across unlike units without explaining the unit.

## 3. Quote composition

A quote should provide a transparent breakdown:

```text
Rental subtotal
+ Platform fee (locality/category policy)
+ Delivery charge (if delivery selected)
+ Optional security deposit (only if approved policy requires it)
= Total amount payable now
```

The presentation explicitly names platform fee and delivery charges. It does not define a security deposit; therefore deposit is an optional policy decision, not a mandatory assumption.

Any damage penalty is assessed after return through a claim/inspection process. It is not silently included in the initial quote.

## 4. Pricing formula

Use integer minor units for gateway calculations. For display/database calculations use `Decimal`/PostgreSQL `numeric`, never binary floating-point.

For a daily-rate example:
`rental_subtotal = unit_rate × billable_days × quantity`

Billable day rounding, grace period, minimum duration and maximum duration must be explicit policy choices. Do not silently assume inclusive/exclusive end-date rules.

`platform_fee` can be configured as a fixed amount or percentage. `delivery_charge` can be fixed or quoted. Exact fee values are not supplied by the PPT and must be configured by admin.

## 5. Availability and concurrency

Availability must consider:
- Total quantity in listing.
- Existing overlapping accepted/paid/active rentals.
- Explicit owner blocks.
- Requested quantity.

Overlap condition:
`existing_start < requested_end AND existing_end > requested_start`.

Do the availability check within a transaction when accepting/confirming a rental. Two simultaneous requests must not reserve the same physical quantity twice.

## 6. Rental states

Suggested state machine:
- `requested`
- `accepted`
- `rejected`
- `awaiting_payment`
- `payment_failed`
- `paid`
- `preparing`
- `pickup_ready`
- `out_for_delivery`
- `active`
- `return_requested`
- `return_inspection`
- `completed`
- `cancelled`
- `refund_pending`
- `refunded`
- `disputed`
- `lost`

Define permitted transitions and actor for each transition. Record every transition in an append-only history table.

## 7. Handover and return condition

Recommended operational evidence:
- Photos at handover.
- Item condition note.
- Quantity/accessory checklist.
- Tourist acknowledgement of receipt.
- Return photos.
- Lender inspection result.
- Timestamp and responsible actor.

The presentation calls out damage penalties but does not define evidence or adjudication. This document recommends evidence capture and admin review to prevent arbitrary charges.

## 8. Damage and loss handling

1. Lender submits claim with a reason and evidence.
2. Tourist is notified and can respond.
3. Admin reviews initial condition, return condition, terms and both sides' evidence.
4. Admin records outcome and reason.
5. Only an approved outcome can trigger any additional payment/refund process.
6. Record all decisions in an audit log.

Never let AI assign penalty values or automatically charge a tourist.

## 9. Delivery

PPT revenue model includes delivery charges. MVP should:
- Let lender mark whether delivery is available.
- Capture pickup vs delivery.
- Show delivery charge before payment.
- Record dispatch/handover/delivery status manually.

Do not promise real-time courier tracking without a delivery partner integration.

## 10. Lender membership

PPT states local membership fees vary by place. Store fee plans by locality and effective date. The actual fee, duration and listing privileges require business approval. Do not hard-code a single nationwide fee.

## 11. Platform fee and local lender revenue

The PPT states a large part of revenue should go to locals, but does not define percentage or payout workflow. Record the rental subtotal and platform fee separately so the commercial model can be audited. Do not promise automated payouts until the selected payment/settlement configuration is implemented and approved.

## 12. Cancellation/refund policy

Before production, define:
- Tourist cancellation window and refund amount.
- Lender cancellation handling.
- No-show rules.
- Late return/grace period.
- Refund method and processing timeline.
- Dispute escalation.
- Responsibility for delivery failures.

The MVP can use an admin-configured policy and a test-only refund state, but must not invent binding consumer terms.
