# LocalConnect — Tourism Made Easy

LocalConnect is a **local item-rental marketplace for tourists**. It connects tourists who need temporary-use goods with local people who are willing to lend/rent those goods. The platform is the digital bridge between both groups and provides discovery, booking coordination, payment collection records, delivery coordination, return tracking and administrative supervision.

This repository is based on the uploaded *Entrepreneurship PPT: Tourism Made Easy*. It is **not** a general travel-booking, hotel, taxi or tour-guide marketplace.

## 1. Core idea taken from the presentation

The presentation identifies a gap in tourism: common services such as ticketing, guides and tour buses are widely available, while tourists' needful commodities are not as easily arranged. The proposed response is to let tourists temporarily rent items from local lenders instead of purchasing items they need only during a trip.

The presentation specifically mentions:
- Clothing and daily-use items.
- Backpacks.
- Utensils.
- Puja materials.
- Saffron and white clothes.
- Basic household requirements.
- A Gaya Ji / Pind-daan / Pitru Paksha use case.
- Platform partnership between local lenders and tourists.
- Supervision/regulation of interaction by the platform.
- Revenue through platform fee, delivery charges, local membership fee (varying by place) and damage penalties.

The platform should initially focus on these rental needs. Additional categories may be configured later, but selling goods and unrelated travel services are outside the initial scope.

## 2. User roles

- **Tourist / renter:** searches for items, requests rental dates, selects delivery/pick-up, pays applicable charges, returns items and provides feedback.
- **Local lender:** lists rentable items, sets availability/rental terms, accepts or rejects requests, hands over items and records returns.
- **Admin / platform operator:** reviews lender onboarding and listings, supervises transactions, handles reports/disputes and configures locality-specific fees.

## 3. Technology stack

- Frontend: React + TypeScript + Vite + Tailwind CSS.
- Backend: Python + FastAPI + Pydantic.
- Database/Auth/Storage/Realtime: Supabase PostgreSQL, Supabase Auth, Supabase Storage and Supabase Realtime where appropriate.
- Geospatial: PostGIS.
- AI assistant: Gemini API through FastAPI only.
- Payments: Razorpay Checkout with server-side order creation, signature verification and signed webhooks.
- Maps: Leaflet with a tile/geocoding provider whose terms permit the intended usage.
- Hosting: Vercel frontend and Render (or equivalent) FastAPI backend.

## 4. Repository layout

```text
LocalConnect/
├── frontend/
│   └── src/
│       ├── app/
│       ├── components/
│       ├── features/
│       │   ├── auth/
│       │   ├── discovery/
│       │   ├── items/
│       │   ├── rental-requests/
│       │   ├── payments/
│       │   ├── lender/
│       │   ├── chatbot/
│       │   └── admin/
│       ├── hooks/
│       ├── lib/
│       └── types/
├── backend/
│   └── app/
│       ├── api/
│       ├── core/
│       ├── integrations/
│       ├── modules/
│       │   ├── auth/
│       │   ├── lenders/
│       │   ├── items/
│       │   ├── discovery/
│       │   ├── rentals/
│       │   ├── payments/
│       │   ├── chatbot/
│       │   └── admin/
│       └── main.py
├── database/
│   ├── migrations/
│   └── seed/
├── docs/
└── AGENT_RULES.md
```

There is intentionally **no prompts folder and no prompt Markdown file**. The staged implementation prompts are supplied in the project handoff chat.

## 5. Development setup

### Backend

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend normally runs on `http://localhost:5173`; the backend on `http://localhost:8000`; FastAPI's OpenAPI page is `/docs`.

## 6. Environment variables

Backend-only secrets:
- `GEMINI_API_KEY`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY` (only if server operations require it)

Public frontend configuration may include:
- `VITE_API_BASE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_RAZORPAY_KEY_ID` (public key ID only; preferably returned by backend order response)

Never put secret keys into `VITE_*` variables or commit `.env` files.

## 7. MVP end-to-end acceptance flow

1. A local lender registers and submits a profile.
2. Admin approves the lender.
3. The lender lists a backpack, utensil set, garment or puja-essential kit with availability and rental terms.
4. A tourist chooses a destination and rental period.
5. The tourist finds available items from local lenders.
6. The tourist submits a rental request.
7. The lender accepts or rejects it.
8. The backend computes the rental amount, applicable platform fee and delivery charges.
9. The backend creates a Razorpay order for the accepted request.
10. Razorpay payment is verified by the backend; production webhook events are also verified and processed idempotently.
11. The item is handed over/delivered, used and returned.
12. The lender records return condition; any damage claim follows an admin-supervised process.
13. Eligible users can leave feedback.

## 8. Important boundaries

- The core marketplace is for **renting/borrowing**, not selling.
- The platform acts as a bridge and supervises the interaction; it does not own the listed goods.
- The PPT does not define a deposit amount, rental unit, delivery SLA, penalty formula or legal liability model. These must be configurable policies approved before production.
- Do not imply that lenders automatically receive payouts through Razorpay unless a compliant payout/marketplace settlement product is separately implemented.
- Do not mark a rental as paid from a browser callback alone.
