# Security, Privacy and Trust Requirements

## 1. Security principles
- Least privilege.
- Server-side authorization.
- Defense in depth: API checks plus database RLS.
- Data minimization.
- Secure secret storage.
- Auditable financial and admin actions.

## 2. Authentication
- Supabase Auth for identity lifecycle.
- Validate access token cryptographically on backend.
- Check expiration, issuer and intended audience.
- Do not trust user ID or role sent in JSON.
- Rotate/revoke sessions when appropriate.
- Admin accounts provisioned separately.

## 3. Authorization matrix
- Tourist can access only own profile, rental requests, payments, messages and claims.
- Lender can manage only own lender profile, items, incoming requests and handover/return records.
- Admin has narrowly scoped moderation/operational access.
- Public can read active listings from approved lenders through safe projections only.

## 4. Database RLS
Enable RLS on all tables exposed through Supabase APIs. Write explicit SELECT/INSERT/UPDATE/DELETE policies. Use negative tests with unrelated accounts. Service-role key bypasses RLS and therefore must remain backend-only and be used sparingly.

## 5. Payment security
- Secret keys never reach browser.
- Client sends rental ID, not total amount.
- Backend computes amount from trusted quote.
- Verify Razorpay signature with HMAC and constant-time comparison.
- Verify payment/order/amount/currency association.
- Verify webhook raw-body signature.
- Deduplicate webhook events.
- Use transactions for financial and rental state changes.
- Do not log secrets or complete sensitive gateway payloads.

## 6. AI security
- Treat model output as untrusted.
- Validate schema, category IDs, dates and quantity.
- Use parameterized queries.
- Do not let AI invoke arbitrary database or payment operations.
- AI can initiate search only; booking/payment require explicit user action and backend validation.
- Avoid sharing identity documents, phone numbers or private addresses with model.

## 7. Privacy
- Request geolocation only after permission.
- Provide manual locality entry.
- Do not expose a lender's private home address.
- Store verification documents in private storage.
- Use short-lived signed access URLs.
- Keep profile public fields separate from private contact/verification data.
- Define retention and deletion processes before production.
- Inform users what information is used for rental coordination.

## 8. Item trust and physical handover
- Admin review of lender and item listings.
- Item condition description and handover/return photos.
- Clear rental term and damage policy before confirmation.
- Report and dispute workflow.
- Never let AI decide a damage penalty.
- Admin decisions require reason and audit record.

## 9. Upload security
- Validate MIME type and file extension.
- Enforce file size/count limits.
- Generate storage object names server-side.
- Prevent path traversal.
- Private bucket for verification/evidence.
- Public bucket only for approved public item images.

## 10. Abuse controls
- Rate-limit signup-sensitive, AI, search and payment endpoints.
- Throttle repeated requests and OTP/login abuse.
- Validate request sizes.
- Add spam/report moderation.
- Keep structured security logs without sensitive data.

## 11. Production review
Complete threat modelling, privacy notice, user terms, rental liability/insurance review, payment-provider approval, local consumer requirements and incident process before handling real users' money or identity documents.
