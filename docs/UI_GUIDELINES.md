# UI and Visual Design Guidelines

## 1. Product identity

**Name:** LocalConnect  
**Tagline:** Tourism made easy — rent what you need, from people who live there.

The interface should feel like a trustworthy local rental marketplace: simple, calm, practical and welcoming. Do not use a generic luxury travel-booking look that implies flights, hotels or tour packages.

## 2. Visual direction

- Light warm/neutral page background.
- Deep blue/indigo and teal accents inspired by the PPT's blue gradients, but use gradients sparingly.
- Dark charcoal headings and readable body text.
- White cards, subtle borders and soft shadows.
- Rounded cards and controls with consistent radii.
- Large clear photographs of rentable items and local context.
- Avoid excessive glassmorphism, animation and decorative gradients.

Suggested tokens:
- `--color-primary: #245B9A`
- `--color-primary-dark: #173F70`
- `--color-accent: #2C8C86`
- `--color-background: #F6F8FB`
- `--color-surface: #FFFFFF`
- `--color-text: #17212F`
- `--color-muted: #64748B`
- `--color-border: #E2E8F0`
- `--color-warning: #B7791F`
- `--color-danger: #B42318`

Use these as initial design tokens; maintain contrast and test them.

## 3. Main information architecture

### Public navigation
- LocalConnect logo.
- Explore rentals.
- How it works.
- For local lenders.
- Help/AI assistant.
- Login / Create account.

### Tourist pages
- Home/landing.
- Search results.
- Item details.
- Rental request/quote.
- Payment.
- My rentals.
- Rental details/status.
- AI assistant.

### Lender pages
- Lender onboarding.
- Dashboard overview.
- My items.
- Add/edit item.
- Incoming rental requests.
- Handover/return management.
- Earnings/fee summary and membership status.

### Admin pages
- Overview.
- Lender approvals.
- Item moderation.
- Rental monitoring.
- Damage claims/disputes.
- Locality fee and membership policies.
- Reports/audit log.

## 4. Landing page layout

1. Header and main navigation.
2. Hero with concise message: “Need something for your trip? Rent it locally.”
3. Search form: item/need, destination/locality, rental dates.
4. Popular categories: clothing, backpacks, utensils, puja materials, household essentials.
5. Use-case panel: Gaya Ji / Pind-daan / Pitru Paksha.
6. Featured nearby rentable items.
7. “How it works” for tourists and lenders.
8. Lender onboarding CTA.
9. Trust/supervision explanation.
10. Footer with policy/help links.

## 5. Item card

Every card should show:
- Primary image.
- Item name and category.
- Locality/approximate distance.
- Rental price and price unit (e.g. per day).
- Condition or key attribute.
- Availability indicator only when checked for requested dates.
- Lender verification indicator only if approved.
- View details action.

Do not show a generic star rating if no eligible reviews exist.

## 6. Item details

Include:
- Image gallery.
- Description and intended use.
- Condition.
- Quantity/variant.
- Rental pricing and unit.
- Date/quantity availability.
- Pickup/delivery options and charge.
- Lender profile and verification status.
- Public locality/landmark.
- Cancellation, late-return and damage rules.
- Quote summary before request/payment.

## 7. Lender dashboard

Prioritize incoming requests and inventory actions. Use status filters rather than displaying a huge unbounded table. Show:
- Verification status.
- Active listings.
- Pending requests.
- Active rentals.
- Returns requiring inspection.
- Damage claims.
- Fee/membership information.

## 8. AI assistant UI

- Floating launcher with accessible label.
- Side panel desktop / full-height sheet mobile.
- Suggested questions about renting items.
- Show parsed needs (category, location, dates) before search where useful.
- Display only actual inventory cards.
- Include loading, error and no-match states.
- Never make the chatbot look like a payment approval authority.

## 9. Forms and interaction

- Use explicit labels and validation messages.
- Preserve entered data after recoverable error.
- Confirm destructive listing deactivation/cancellation.
- Every button must perform a real action.
- Display currency, pricing unit and fee breakdown before commitment.
- Clearly label Razorpay test mode in development.

## 10. Responsive and accessibility

- Mobile-first from 320 px width upward.
- Keyboard accessible navigation/dialogs/chat.
- Visible focus states.
- Semantic headings and form labels.
- Sufficient colour contrast.
- Do not communicate status using colour alone.
- Images have useful alt text.
- Respect reduced motion preferences.
