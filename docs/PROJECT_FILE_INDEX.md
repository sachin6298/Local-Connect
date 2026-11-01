# Project File Index

## Root
- `README.md`: overview, stack, setup and MVP flow.
- `AGENT_RULES.md`: mandatory coding-agent constraints.

## Documentation
- `PPT_SOURCE_ALIGNMENT.md`: maps the original presentation to product scope and identifies unspecified decisions.
- `PRD.md`: detailed product requirements and acceptance criteria.
- `USER_JOURNEYS.md`: tourist, lender and admin journeys.
- `ARCHITECTURE.md`: frontend/backend boundaries and data flows.
- `DATABASE_SCHEMA.md`: detailed relational schema, indexes and RLS.
- `API_DOCUMENTATION.md`: API contracts.
- `RENTAL_RULES_AND_PRICING.md`: rental terms, availability, charges, returns and damage.
- `RAZORPAY_INTEGRATION.md`: checkout, verification, webhooks and payment safety.
- `AI_CHATBOT.md`: Gemini assistant scope and grounding rules.
- `UI_GUIDELINES.md`: visual design and interaction requirements.
- `PERFORMANCE_AND_COMPLEXITY.md`: time/space efficiency requirements.
- `SECURITY_AND_PRIVACY.md`: authorization, privacy and safety.
- `TESTING_QA.md`: testing strategy and release gates.
- `DEPLOYMENT_OPERATIONS.md`: environment and deployment instructions.
- `DEVELOPMENT_ROADMAP.md`: stepwise implementation plan.

## Application scaffold
- `frontend/`: responsive rental marketplace landing page, sample catalogue, search/filter UI, rental request dialog and AI chat panel.
- `backend/`: FastAPI health endpoint, Gemini assistant scaffold, and fail-closed Razorpay integration endpoints.
- `frontend/.env.example` and `backend/.env.example`: environment placeholders only.

## Important scaffold boundary
The frontend catalogue is sample data. Supabase persistence, authentication, listing availability, rental request workflows and payment persistence/webhooks must be implemented according to the docs before real transactions. The Razorpay create-order endpoint intentionally refuses to create an order until it can calculate price from authenticated database records.
