# API Contract

Base path: `/api/v1`  
Content type: `application/json`  
Protected calls: `Authorization: Bearer <Supabase access token>`

Identity and role are derived from validated access token and trusted profile. The client must not send a trusted `tourist_id`, `lender_id` or `admin` claim.

## 1. Health and configuration
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | Liveness |
| GET | `/ready` | Internal/ops | Dependency readiness |

## 2. Profiles and lender onboarding
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/users/me` | Authenticated | Current profile |
| PATCH | `/users/me` | Owner | Update profile |
| POST | `/lenders/onboarding` | Lender | Submit/update profile |
| POST | `/lenders/verification` | Lender | Submit verification |
| GET | `/lenders/me` | Lender | Own profile/status |
| GET | `/lenders/{id}` | Public safe fields | Approved lender profile |

## 3. Categories and inventory
| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/categories` | Public | Active categories |
| GET | `/items` | Public | Search active items |
| GET | `/items/{item_id}` | Public safe fields | Item detail |
| POST | `/items` | Approved lender | Create listing |
| PATCH | `/items/{item_id}` | Owner lender | Update listing |
| DELETE | `/items/{item_id}` | Owner lender | Deactivate listing |
| POST | `/items/{item_id}/images` | Owner lender | Add image metadata/upload flow |

`GET /items` parameters:
- `q`: search keywords.
- `category`: category slug/id.
- `locality`: locality slug/id.
- `lat`, `lng`, `radius_km`: optional location search.
- `start_at`, `end_at`: rental period.
- `quantity`: requested quantity.
- `min_price`, `max_price`: optional, only comparable within selected pricing basis.
- `sort`: relevance/distance/price.
- `cursor` or `page`, `page_size`: pagination.

Bound page size server-side (for example, maximum 50). Validate coordinate and radius ranges.

## 4. Availability and quote
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/items/{item_id}/availability-check` | Public/authenticated | Check quantity/date availability |
| POST | `/rentals/quote` | Authenticated tourist | Calculate server-side quote |

Quote request:
```json
{
  "item_id": "uuid",
  "quantity": 2,
  "start_at": "2026-12-01T10:00:00Z",
  "end_at": "2026-12-03T10:00:00Z",
  "handover_method": "pickup"
}
```

The server loads item price, locality fee policy and delivery policy. Client-provided amounts are not accepted.

## 5. Rental requests
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/rentals` | Tourist | Create request from validated quote inputs |
| GET | `/rentals` | Participant | List own rentals/incoming requests |
| GET | `/rentals/{rental_id}` | Participant | Detail |
| POST | `/rentals/{id}/decision` | Assigned lender | Accept/reject |
| POST | `/rentals/{id}/cancel` | Eligible participant | Cancel under policy |
| POST | `/rentals/{id}/handover` | Authorized participant | Record handover |
| POST | `/rentals/{id}/return-request` | Tourist | Request return |
| POST | `/rentals/{id}/return-inspection` | Assigned lender | Record inspection |

Use `Idempotency-Key` for create/payment operations where retry could create duplicates.

## 6. Payment
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/payments/create-order` | Owning tourist, accepted rental | Create Razorpay order |
| POST | `/payments/verify` | Owning tourist | Verify Checkout response |
| POST | `/payments/webhook` | Razorpay signed request | Trusted event reconciliation |
| GET | `/payments/{id}` | Rental participant | Limited payment status |

Create-order request:
```json
{ "rental_request_id": "uuid" }
```
The client does not send amount or currency.

## 7. AI assistant
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/ai/chat` | Public/authenticated, rate-limited | Interpret need and search real inventory |

Example:
```json
{
  "message": "I need white clothes, a utensil set and puja materials near Vishnupad for two days",
  "locality": "Gaya",
  "start_at": "2026-12-01T10:00:00Z",
  "end_at": "2026-12-03T10:00:00Z"
}
```

Response:
```json
{
  "reply": "I found matching rental items for your dates.",
  "intent": {
    "categories": ["clothing", "utensils", "puja-materials"],
    "keywords": ["white clothes"],
    "locality": "Gaya"
  },
  "items": [],
  "needs_clarification": false
}
```

All `items` must come from database search results, not model-generated objects.

## 8. Damage, reviews and reports
| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/rentals/{id}/damage-claims` | Participant | Submit claim/evidence |
| GET | `/rentals/{id}/damage-claims` | Participants/admin | Read claims |
| POST | `/reviews` | Eligible tourist | Review completed rental |
| POST | `/reports` | Authenticated | Report account/listing/transaction |

Admin routes:
- `GET /admin/lenders/pending`
- `POST /admin/lenders/{id}/decision`
- `GET /admin/disputes`
- `POST /admin/damage-claims/{id}/decision`
- `GET /admin/fee-policies`
- `POST /admin/fee-policies`
- `GET /admin/metrics`

## 9. Error contract

```json
{
  "error": {
    "code": "RENTAL_UNAVAILABLE",
    "message": "The requested quantity is not available for those dates.",
    "request_id": "opaque-request-id"
  }
}
```

Use correct HTTP statuses: 400, 401, 403, 404, 409, 422, 429 and 500. Do not return stack traces, tokens or gateway secrets.
