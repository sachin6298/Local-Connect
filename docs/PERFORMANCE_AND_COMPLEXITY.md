# Performance, Time Complexity and Space Complexity Standards

This document defines practical performance requirements for LocalConnect. Complexity targets describe algorithmic growth; real latency also depends on database indexes, network, external services and data distribution.

## 1. Notation

- `n`: total rows/items in a dataset.
- `k`: rows returned after filtering.
- `p`: requested page size.
- `m`: messages in a conversation.
- `c`: candidate rows returned by a spatial index before final filtering.
- `t`: number of rental intervals for one item.
- `h`: number of chat-history messages sent to the model.

Always state which input size a complexity claim refers to.

## 2. Core principle: push filtering to the database

Do not download all inventory and then filter in React/Python.

Bad:
```python
items = await fetch_all_items()
nearby = [item for item in items if distance(item, user) < radius]
```

Preferred:
- Filter active status/category/date in SQL.
- Use B-tree indexes for common equality/range filters.
- Use PostGIS geography and GiST index for radius filtering.
- Fetch only selected columns.
- Apply server-side pagination.

Expected behavior: database index access plus result materialization, commonly `O(log n + k)` for suitable B-tree access patterns; actual query plan must be checked with `EXPLAIN ANALYZE`. Spatial queries depend on geographic distribution and index selectivity; do not promise a universal exact bound.

## 3. Search and pagination

Requirements:
- Default page size small (for example 12–24 cards).
- Hard maximum page size (for example 50).
- Cursor pagination for large/changing result sets where appropriate.
- Stable sort key (for example relevance/distance plus item ID).
- Select only fields required by result cards.
- Add composite/partial indexes based on actual filters.
- Avoid `SELECT *`.

Offset pagination may become expensive at large offsets; prefer keyset/cursor pagination for deep pages. Search response space should be `O(p)`, not `O(n)`.

## 4. Geospatial discovery

Use PostGIS `ST_DWithin` with a GiST index on geography. The index narrows candidates; exact distance filtering/order is performed on candidate rows.

Do not run an O(n) Haversine calculation in Python over all providers/items for every request. If a small in-memory calculation is required after index narrowing, its cost is `O(c)` time and `O(c)` or `O(p)` memory depending on implementation.

Map viewport should load only current result page or bounded marker set; cluster markers for dense regions.

## 5. Availability algorithm

A requested rental interval overlaps an existing interval when:
`existing_start < requested_end AND existing_end > requested_start`.

For a single-unit item, checking sorted intervals can be `O(log t + r)` using binary search then scanning relevant overlaps, where `r` is the number of overlapping intervals. For quantity-based inventory, total overlapping reserved quantity must be aggregated safely.

Preferred production approach:
- Query only overlapping reservations in SQL.
- Restrict by item ID and active reservation statuses.
- Use a transaction and appropriate locking/concurrency control.
- Add indexes for `(item_id, rental_start, rental_end, status)`.
- Revalidate during lender acceptance/payment, not only during initial browse.

Do not use an in-memory full scan of every rental in the system.

## 6. Pricing calculation

A quote consists of a constant number of arithmetic operations for one listing, so time `O(1)` and auxiliary space `O(1)`, excluding policy/database retrieval.

Use:
- Decimal arithmetic in Python or PostgreSQL `numeric`.
- Integer minor units for gateway amount.
- A persisted quote/fee snapshot.
- Centralized pricing function; do not duplicate formula in frontend and backend.

Never use JavaScript/Python binary floating point for authoritative money calculations.

## 7. AI chatbot complexity

AI inference latency is dominated by the external model and token count, not local CPU complexity. Keep:
- Input message length bounded.
- Conversation history truncated/summarized.
- Tool/database result count bounded.
- Structured output small.
- One intent-extraction call where possible.
- No repeated model call for each result card.

If `h` messages are sent, model context size grows with total tokens in those messages; cap context and retain only relevant summary/recent turns. Database result handling should be `O(p)` for bounded result page.

Do not call the model once per item. One request should extract intent, followed by one database search.

## 8. Frontend rendering

- Render only current page (`O(p)` cards).
- Use stable React keys.
- Avoid expensive derived computations in render loops.
- Memoize only measured costly pure calculations.
- Debounce search input (e.g. 250–350 ms).
- Abort/cancel stale requests.
- Lazy-load images below fold.
- Resize/compress images before upload.
- Avoid storing large image blobs in React state; use object URLs carefully and revoke them.

## 9. Realtime and chat

- Paginate message history.
- Load latest bounded batch.
- Subscribe only to the user's permitted conversation.
- Do not re-fetch all messages on every event.
- Append/dedupe by message ID.
- Index messages by `(conversation_id, created_at)`.
- Client memory for current conversation should scale with loaded messages `O(p)`; load older messages on demand.

## 10. Database query discipline

- Avoid N+1 queries. Use joins/select-in batching or a fixed number of bounded queries.
- Use `EXPLAIN ANALYZE` for slow queries.
- Index foreign keys used frequently for joins.
- Do not over-index write-heavy tables.
- Use connection pooling supported by deployment.
- Add query timeout and page limits.
- Avoid loading full audit log or payment event payloads into ordinary dashboards.

## 11. Caching

Cache public category lists and carefully scoped public catalogue metadata. Cache keys must include meaningful filters and locality. Do not cache private user data across users. Invalidate or use short TTL for availability-sensitive results; recheck availability before booking acceptance.

## 12. Complexity documentation requirement

For every non-trivial algorithm added, the agent must record:
- Inputs and constraints.
- Chosen algorithm/data structure.
- Time complexity.
- Auxiliary space complexity.
- Database indexes/query plan relied upon.
- Concurrency/race-condition handling.
- Why a simpler alternative is insufficient.

Optimize real bottlenecks, not hypothetical microseconds. Correct booking/payment/security behavior takes precedence over micro-optimization.
