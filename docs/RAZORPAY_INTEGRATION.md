# Razorpay Payment Integration Specification

## 1. Purpose

Razorpay is used to collect the tourist's payable rental amount after the local lender accepts a rental request. The payment layer must not calculate prices independently; the rental/pricing service provides the authoritative quote.

## 2. Environment variables

Backend only:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `RAZORPAY_ENV=test|live`

Frontend may use the public key ID. Never expose secret/webhook secret through `VITE_*`.

## 3. Payment sequence

1. Tourist submits rental request.
2. Lender accepts request.
3. Backend recalculates/loads accepted quote snapshot.
4. Tourist clicks Pay.
5. Frontend calls `POST /api/v1/payments/create-order` with rental request ID only.
6. Backend verifies:
   - caller is the tourist associated with rental;
   - rental is in accepted/awaiting-payment state;
   - no successful payment already exists;
   - quote is current and payable;
   - amount and currency are loaded from trusted persisted data.
7. Backend creates Razorpay order using integer minor units.
8. Backend persists gateway order ID and pending payment attempt.
9. Backend returns public key ID, order ID, amount and currency.
10. Frontend launches Razorpay Checkout.
11. Checkout returns order ID, payment ID and signature.
12. Frontend submits these to backend verification endpoint.
13. Backend computes HMAC SHA-256 for the order/payment association using secret and constant-time compares signature.
14. Backend additionally verifies payment/order association, stored amount and currency through trusted gateway data/webhook as appropriate.
15. Backend persists verified payment state idempotently.
16. Rental advances to paid/confirmed according to business state machine.

## 4. Webhooks

Production must:
- Read raw request bytes.
- Verify `X-Razorpay-Signature` with configured webhook secret.
- Reject invalid signatures.
- Parse event after signature verification.
- Deduplicate using gateway event ID or stable dedupe key.
- Persist event processing record.
- Handle duplicate delivery safely.
- Handle out-of-order events without regressing a terminal state.
- Reconcile captured, failed, refunded and disputed events.
- Return success only after the event is durably recorded/processed according to design.

## 5. Idempotency and race conditions

- Create-order requests need an idempotency strategy tied to rental/payment attempt.
- Verification may be called more than once; repeated verified request must not duplicate ledger entries.
- Webhook and frontend verification can race; both must converge on one payment state.
- Use unique constraints on gateway order/payment/event IDs.
- Use database transaction for payment + rental state mutation.
- Do not use frontend-only state as proof of payment.

## 6. Amount handling

- Client sends rental request ID, not amount.
- Backend calculates rental subtotal, fee and delivery charge using persisted listing and fee-policy snapshot.
- Convert amount to paise (or currency minor unit) using Decimal-safe rounding.
- Persist currency and amount.
- Compare gateway values with expected amount/currency.
- Never use floating-point money calculations.

## 7. Lender settlement boundary

The presentation says the major share of earnings should go to local lenders and that LocalConnect acts as a bridge. This does not by itself define a payment split or payout provider configuration.

For MVP:
- Collect via test mode.
- Record gross amount, platform fee, delivery charge and lender share ledger.
- Clearly label settlement as pending/manual if no compliant automated settlement integration exists.

Do not claim escrow, split settlement or automatic lender payouts unless the appropriate gateway product, KYC, agreements and implementation are complete.

## 8. Refunds and damage penalties

Refunds and post-rental damage claims are separate workflows. A damage claim needs admin decision and evidence. Any additional charge/refund must use an approved gateway flow and be recorded in the ledger. Do not silently charge saved instruments.

## 9. Testing checklist

- Missing credentials returns safe configuration error.
- Invalid rental ID rejected.
- Wrong user cannot create order.
- Request not accepted cannot be paid.
- Client-supplied amount is ignored/rejected.
- Signature mismatch rejected.
- Correct signature verifies.
- Duplicate verification does not duplicate state.
- Duplicate webhook does not duplicate state.
- Captured and failed events update correctly.
- Refund event reconciles.
- Booking/rental cannot be marked paid by client request alone.
