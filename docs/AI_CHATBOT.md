# Gemini AI Chatbot Specification

## 1. Product purpose

The LocalConnect assistant helps tourists explain what physical items they need, identify relevant rental categories, search by destination and rental dates, and understand the rental process.

Example:
> “I am visiting Gaya for Pind-daan. I need white clothes, puja materials and utensils for two days near Vishnupad.”

The assistant should interpret this into catalogue search criteria and display real available listings.

## 2. Out-of-scope behavior

The assistant is not:
- A general trip-booking agent for flights/hotels/taxis.
- A source of guaranteed inventory or prices.
- A payment authority.
- A damage-penalty adjudicator.
- An emergency/medical service.

## 3. Architecture

Browser chat panel → FastAPI `/api/v1/ai/chat` → Gemini intent extraction → Pydantic validation → catalogue search service → PostgreSQL/PostGIS → grounded response.

Gemini API key remains in backend environment. Do not call Gemini directly from React.

## 4. Intent schema

Suggested structured intent:

```json
{
  "categories": ["clothing", "puja-materials", "utensils"],
  "keywords": ["white clothes"],
  "locality": "Gaya",
  "landmark": "Vishnupad",
  "start_at": null,
  "end_at": null,
  "quantity": 1,
  "price_preference": "budget",
  "needs_clarification": true,
  "clarification_question": "What dates do you need the items?"
}
```

All fields must be optional/validated where missing information is common. Never assume date, quantity or destination if not supplied.

## 5. Request pipeline

1. Validate message length and request frequency.
2. Remove or avoid sending unnecessary personal data.
3. Call Gemini with a short system instruction and structured response schema.
4. Validate JSON, category slugs, quantity and date formats with Pydantic.
5. Normalize synonyms using a controlled category dictionary.
6. Execute normal inventory search using database query.
7. Construct a response from actual results, fees and policies.
8. Return assistant text, structured filters and item records.
9. Keep conversation state limited and bounded; do not submit entire chat history indefinitely.

## 6. Grounding rules

- Provider/lender names, item titles, rates, availability, ratings and distances come only from database results.
- Fees come from active fee policy or persisted quote.
- Do not say an item is available until availability service confirms the date/quantity.
- If no item matches, state no matching result was found and suggest adjusting category, dates or location.
- If user requests a category the marketplace does not support, explain that and offer available categories.
- AI output is not used to set payable amount or booking state.

## 7. Conversation UX

- Persistent but non-obstructive launcher.
- On desktop, side panel; on mobile, accessible full-screen sheet.
- Suggested prompts focused on item rental.
- Typing/loading state and retry state.
- Show interpreted filters so user can correct them.
- Result cards link to actual item pages.
- Preserve conversation context only when useful and bounded.
- Include a clear AI-generated response notice.

## 8. Reliability

- Timeout Gemini calls.
- Rate-limit by user/session/IP with abuse controls.
- Add a normal keyword/category fallback.
- Return structured error codes, not provider stack traces.
- Track latency, error rate and token usage without logging sensitive personal text unnecessarily.
- Do not retry a request indefinitely.
