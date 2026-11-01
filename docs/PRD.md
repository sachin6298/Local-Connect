# Product Requirements Document (PRD)

**Product:** LocalConnect — Tourism Made Easy  
**Product category:** Local item-rental marketplace  
**Platform:** Responsive web application  
**Primary scenario:** Tourists renting locally owned needful commodities during visits and pilgrimage events  
**Initial case study:** Gaya Ji / Pind-daan / Pitru Paksha  
**Source:** Uploaded Entrepreneurship PPT; see `PPT_SOURCE_ALIGNMENT.md`.

---

## 1. Executive summary

LocalConnect is a supervised digital bridge between tourists who need temporary-use goods and local people willing to lend/rent those goods. It adopts an e-commerce-like discovery and transaction experience, but the core transaction is **rental, not sale**.

The initial catalogue focuses on clothing, backpacks, utensils, puja materials and basic daily-use/household items. The product is especially relevant to visitors staying temporarily for a pilgrimage/event, where purchasing short-term-use goods may be unnecessary.

The platform earns revenue through a platform fee, delivery charges, locality-dependent lender membership fees and damage penalties under an approved damage policy.

## 2. Problem statement

Tourists may arrive at an unfamiliar destination and need essential goods for only a few hours or days. Existing travel infrastructure may cover tickets, guides or buses but not necessarily temporary access to local commodities. Visitors may have to travel between shops, face unclear pricing or buy items they will not use after the trip.

Local residents and shopkeepers may own useful goods but lack a structured way to make those items available to tourists.

## 3. Proposed solution

A web platform where:
- Local lenders register and list rentable items.
- Tourists search by item, category, use case, date and location.
- The platform displays real listings, lender details, price basis and availability.
- Tourists submit rental requests.
- Lenders accept/reject and coordinate handover/delivery.
- The platform records payments, fees, rental state, returns and disputes.
- Admin supervises lender onboarding, item quality and complaints.

## 4. Goals

1. Reduce the effort required for tourists to find temporary-use commodities.
2. Give local people a structured channel to earn from goods they own.
3. Make rental prices, dates, condition and charges transparent.
4. Supervise interactions through lender review, booking records and dispute handling.
5. Demonstrate a complete digital rental lifecycle.
6. Support Gaya Ji/Pitru Paksha inventory and a destination-specific catalogue.
7. Use AI to interpret tourist needs and search actual inventory.

## 5. Non-goals

- Selling goods.
- Flight/train/bus tickets.
- Hotel/homestay reservations.
- Taxi/driver booking.
- Tour-guide booking.
- Restaurant ordering.
- General local gig/service marketplace.
- Guaranteed delivery fleet/dispatch.
- Automated legal identity validation unless an approved provider is integrated.
- Escrow or automatic lender payouts unless a compliant marketplace payment product is explicitly implemented.

## 6. Personas

### 6.1 Tourist / renter
A visitor who needs a physical item temporarily and wants to find a nearby lender, compare terms and rent with predictable charges.

### 6.2 Local lender
A local resident, shopkeeper or small business that owns items and wants to make them available for rental. The lender needs listing management, availability control and rental history.

### 6.3 Admin / platform operator
A platform representative who reviews lenders/listings, monitors requests, sets fee policies and supervises returns, damage claims and complaints.

## 7. Roles and access

| Capability | Tourist | Local lender | Admin |
|---|---:|---:|---:|
| Browse active public items | Yes | Yes | Yes |
| Manage own tourist account | Yes | No | No |
| Manage own lender profile | No | Yes | Yes, moderation |
| Create/update own item listings | No | Yes | Moderate |
| Request rental | Yes | No | No |
| Accept/reject own incoming requests | No | Yes | No |
| Record handover/return | By workflow | By workflow | Supervise |
| View own rental/payment history | Yes | Yes | Authorized operational access |
| Submit damage/report dispute | Yes | Yes | Resolve |
| Configure platform/local fees | No | No | Yes |
| Approve lenders/listings | No | No | Yes |
| Grant admin role | No | No | Controlled operator process |

Admin role is never selectable on public registration.

## 8. Catalogue requirements

### 8.1 Core categories
- Clothing: saffron/white garments and other locally validated clothing needs.
- Backpacks and bags.
- Utensils and cooking/eating equipment.
- Puja/Pind-daan materials and kits.
- Basic household requirements.
- Other daily-use items approved by admin.

### 8.2 Item fields
Each listing should contain:
- Item title and category.
- Description and intended use.
- Images.
- Condition at listing time.
- Size/variant where relevant.
- Quantity/available units.
- Rental price and price unit.
- Minimum/maximum duration, if defined.
- Availability calendar.
- Pickup location/service area.
- Delivery availability and charge rule.
- Lender profile and verification status.
- Damage/loss terms visible before request.

Do not publish private home addresses. Public listing location should be approximate, such as locality/landmark, until a confirmed handover requires more detail.

## 9. Functional requirements

### FR-01 Account and authentication
- Supabase Auth for registration/login/password reset.
- User chooses tourist or local-lender path.
- Profile records role.
- Backend validates access token and role.
- Admin accounts provisioned securely.
- Sign-out and session expiry handled.

### FR-02 Local lender onboarding
- Lender submits display name, description, contact preference, locality and required verification evidence.
- Admin reviews submission.
- Status: `draft`, `submitted`, `approved`, `rejected`, `suspended`.
- Only approved lenders may publish public listings.
- Rejection includes reason and resubmission path.

### FR-03 Item listing management
- Lender creates/updates/deactivates own item listings.
- Listing includes category, description, quantity, condition, photos, price rule, availability and handover method.
- Images uploaded to storage with MIME/size checks.
- Public listing shows only safe fields.
- Admin can hide/suspend listing.

### FR-04 Search and discovery
- Keyword and category search.
- Destination/locality selection.
- Optional browser geolocation permission.
- Rental date range and quantity filters.
- Availability and location-radius filters.
- Price sort/filter only where a comparable price basis exists.
- Paginated result cards.
- Map and list modes.
- Default search returns only active items from approved lenders.

### FR-05 AI chatbot
- Persistent chat control in tourist UI.
- Understand natural language such as "I need white clothes, utensils and puja items for two days near Vishnupad".
- Extract multiple item categories/keywords, destination, date range and quantity where provided.
- Ask one focused follow-up where a required search parameter is missing.
- Query actual listings; show only database results.
- Explain rental steps, platform fee and configured policy using current backend data.
- Never invent availability, rates, lenders, delivery or penalties.
- Clearly label AI-generated text.

### FR-06 Rental request
- Tourist selects item, quantity, rental start/end and pickup/delivery preference.
- Backend checks listing active, lender approved, quantity/availability and valid rental period.
- Backend computes quote from trusted listing/policy data.
- Request state begins as `requested`.
- Lender accepts/rejects.
- Accepted request becomes ready for payment/confirmation according to policy.
- Duplicate submissions protected using idempotency key.

### FR-07 Fee calculation
Quote should break down:
- Rental subtotal.
- Platform fee.
- Delivery charge if selected.
- Optional configured deposit, only if business policy approves it.
- Total payable.
- Any damage penalty is not part of initial quote; it is assessed later through a documented inspection/dispute process.

Fee amounts and rules are configured by locality/category or platform policy. Do not hard-code arbitrary percentages.

### FR-08 Razorpay payment
- Backend creates order for accepted rental request.
- Backend loads quote/amount from DB; client cannot submit authoritative amount.
- Frontend launches Razorpay Checkout.
- Backend verifies payment signature.
- Production webhook validates event signature and updates payment idempotently.
- Rental confirmation follows verified payment state.
- Failed/refunded/disputed states shown to user.
- Payment and lender settlement are separate concerns; do not claim automatic lender payouts unless implemented and approved.

### FR-09 Handover/delivery
- Rental record tracks pickup or delivery option.
- Handover can record time and item condition.
- Delivery status is updated by authorized actors.
- Delivery charge must be visible before payment.
- Do not claim integrated courier tracking unless a delivery partner API is configured.

### FR-10 Return and condition
- Tourist requests/records return.
- Lender records received condition with notes and photos.
- State advances to returned/inspection pending/completed.
- If damage/loss alleged, create a claim and require admin-supervised resolution.
- A penalty amount is never generated solely by AI.

### FR-11 Damage/dispute
- Both parties can submit evidence.
- Admin reviews item condition before and after rental, policy terms and evidence.
- Decision and penalty/reversal are recorded with actor, timestamp and reason.
- Notify both parties.
- Refund/extra charge actions must follow payment provider capabilities and approved policy.

### FR-12 Membership
- Platform can configure local lender membership plans/fees by locality.
- MVP may record membership status manually or via a payment flow after terms are approved.
- Listing privileges may depend on active membership only if product policy explicitly sets that rule.
- Do not hard-code one universal fee.

### FR-13 Reviews and reports
- Eligible tourists can review completed rentals.
- Lenders can report abuse/non-return/damage.
- Tourists can report misrepresentation or misconduct.
- Admin handles reports.
- Reviews should be one per completed rental unless an explicit edit rule exists.

### FR-14 Admin console
- Lender verification queue.
- Listing moderation.
- Rental request/payment overview.
- Damage/dispute queue.
- Locality fee/membership configuration.
- Reports and audit log.
- Metrics for listings, rentals, fee totals and active lenders.

## 10. Non-functional requirements

- Mobile-first responsive UI.
- Server-side authorization and tested database RLS.
- Pydantic validation for all backend mutations.
- Pagination and bounded response payloads.
- PostGIS-backed geographic search.
- No N+1 query patterns.
- Secrets stored in backend secret manager.
- Payment signature and webhook verification.
- Structured logs without secrets/identity documents.
- Accessibility: keyboard use, focus visibility, semantic labels and sufficient contrast.
- Error/loading/empty/success states in every major workflow.

## 11. MVP priority

### Must have
- Auth and roles.
- Approved lender profile.
- Item listing creation.
- Item category/search.
- Rental request and lender decision.
- Fee breakdown.
- Razorpay test checkout and backend signature verification.
- Basic rental state tracking.
- Admin lender/listing moderation.
- Gemini chatbot that searches real items.

### Should have
- Map/list switch.
- Availability calendar.
- Handover/return photos.
- Local membership configuration.
- Delivery charge rule.
- Reviews/reports.

### Later
- Delivery partner integration.
- Automated lender settlements.
- Multilingual voice chatbot.
- Dynamic pricing.
- More destinations and event-specific catalogues.

## 12. Acceptance criteria

The MVP is accepted when:
1. Tourist and lender can register/login with correct roles.
2. Admin can approve a lender.
3. Approved lender can publish a rentable item.
4. Tourist can search by item/category/destination/date.
5. Search returns only real active items from approved lenders.
6. Availability prevents conflicting accepted rentals for the same unit/period.
7. Rental quote includes configured platform/delivery fees.
8. Lender can accept/reject a request.
9. Backend creates Razorpay order from database-calculated amount.
10. Backend verifies signature and handles duplicate events safely.
11. Handover, return and damage claim states can be recorded.
12. Admin can supervise a damage claim.
13. AI chatbot intent is validated and results are database-grounded.
14. RLS and backend authorization tests prevent unauthorized access.
