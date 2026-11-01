# Testing and Quality Assurance Plan

## 1. Testing pyramid

### Unit tests
Test pure business logic:
- Pricing and fee calculation.
- Rental duration/billable unit calculation.
- Rental state transition validation.
- AI intent schema validation.
- Payment signature helper.
- Availability overlap calculation.

### Integration tests
Test:
- FastAPI + database repositories.
- RLS with role-specific identities.
- Rental request creation and acceptance.
- Availability race condition handling.
- Razorpay order/verification mocked against test gateway.
- Webhook signature and idempotency.
- Gemini failure/fallback.

### End-to-end tests
Test main browser journey:
1. Lender login.
2. Lender creates item.
3. Admin approves lender/listing if required.
4. Tourist searches item.
5. Tourist creates rental request.
6. Lender accepts.
7. Tourist uses Razorpay test checkout.
8. Backend verifies payment.
9. Handover/return status updated.
10. Review submitted after completion.

## 2. Role and authorization matrix tests

Use separate tourist A, tourist B, lender A, lender B and admin identities.

Verify:
- Tourist A cannot read tourist B private rental.
- Lender A cannot alter lender B item.
- Lender cannot accept a request assigned to another lender.
- Tourist cannot update rental state to paid/active/completed.
- Public user cannot read verification documents.
- Non-admin cannot approve lender or decide damage claim.
- Payment participant sees limited payment details only.

## 3. Payment test cases

- Missing Razorpay credentials.
- Accepted rental creates order.
- Rejected/unaccepted rental cannot create order.
- Wrong tourist cannot create order.
- Frontend-supplied amount is ignored/rejected.
- Signature mismatch rejected.
- Correct signature accepted.
- Payment ID/order ID mismatch rejected.
- Amount/currency mismatch rejected.
- Duplicate verify request idempotent.
- Invalid webhook signature rejected.
- Duplicate webhook event does not duplicate effects.
- Out-of-order webhook does not regress final state.
- Refund event updates ledger/state as designed.

## 4. Availability test cases

- Request entirely before existing rental.
- Request entirely after existing rental.
- Request overlaps start/end.
- Request nested inside existing rental.
- Same boundary time behavior.
- Quantity below available accepted.
- Quantity exceeding availability rejected.
- Two concurrent requests cannot oversubscribe inventory.

## 5. AI tests

- Single category query.
- Multi-category query.
- Query with locality/landmark.
- Query with start/end date.
- Missing date asks clarification when needed.
- Unsupported service request explains scope.
- No result does not fabricate a listing.
- Model returns invalid JSON.
- Model timeout/rate limit.
- Prompt-injection attempt cannot access secret/admin action.
- Result prices/availability match database.

## 6. UI quality checks

- 320px mobile, tablet and desktop layouts.
- Keyboard navigation and visible focus.
- All forms have labels and validation.
- Loading/empty/error/success states.
- Image loading fallback.
- Chat panel accessible on mobile.
- Fee breakdown understandable.
- Test-mode payment clearly labelled.
- No dead buttons or misleading placeholder controls.

## 7. Performance checks

- Search with realistic seed inventory.
- Explain plans for common queries.
- Verify page size bound.
- Check no N+1 queries.
- Measure AI latency and token usage.
- Check map marker limits and image loading.
- Test booking contention for same item/date.

## 8. Release gate

Do not call the MVP ready until:
- Frontend production build passes.
- Backend test suite passes.
- Database migrations apply cleanly.
- RLS policy tests pass.
- Booking transition tests pass.
- Payment signature/webhook tests pass.
- Demo journey succeeds with test data.
- Known limitations are documented.
