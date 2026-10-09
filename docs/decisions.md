# Architectural Decision Records (ADRs)

## Project: VentureFlow — Startup Discovery & Investor Interest Platform
**Date:** October 2026  
**Status:** Accepted & Implemented  

---

### ADR-001: Modular Monolith Architecture over Microservices
- **Context:** The specification outlines a two-sided marketplace for founders and investors with discovery, interests, bookmarks, and role-specific dashboards.
- **Decision:** Build a single, modular TypeScript Express backend structured into feature domains (`auth`, `startups`, `interests`, `bookmarks`, `dashboard`) rather than distributed microservices.
- **Rationale:** A modular monolith eliminates network partition latencies, distributed transaction complexities, and excessive Docker orchestration overhead. It maintains clear domain boundaries, clean MVC service separation, and enables atomic database transactions while remaining easy to test with Vitest/Supertest.
- **Consequences:** Easy single-command deployment, simpler CI/CD pipelines, and instant local DX.

---

### ADR-002: MongoDB Compound Unique Indexes for Concurrency & Idempotency
- **Context:** Expressions of interest and bookmarks can be triggered concurrently by investors or double-clicked in network lag scenarios. Application-level `findOne` checks suffer from time-of-check to time-of-use (TOCTOU) race conditions.
- **Decision:** Enforce authoritative uniqueness at the storage engine level with MongoDB compound unique indexes:
  - `{ startupId: 1, investorId: 1 }` on `Interests`
  - `{ startupId: 1, investorId: 1 }` on `Bookmarks`
  - `{ slug: 1 }` on `Startups`
  - `{ email: 1 }` on `Users`
- **Rationale:** The database engine guarantees single-record uniqueness even when simultaneous parallel requests arrive at the same millisecond. The server catches MongoDB error code `11000` and gracefully maps it to HTTP `409 Conflict` (`INTEREST_ALREADY_EXISTS`), ensuring zero phantom duplicates.
- **Consequences:** Concurrency safety proven by automated parallel request integration tests.

---

### ADR-003: Integer INR Minor-Unit/Standard Amount Representation
- **Context:** Funding requirements need to be specified in Indian Rupees (INR). IEEE 754 floating point numbers cause precision and rounding display bugs.
- **Decision:** Represent all monetary funding targets as non-negative integer INR amounts (`targetAmount: number` validated via `Number.isInteger` and Zod `.int()`).
- **Rationale:** For an MVP without payment gateway escrow settlement, integer rupees prevent rounding errors and format cleanly into Indian numbering systems (`₹25 Lakhs`, `₹1.5 Crore`).
- **Consequences:** Predictable sorting (`target-asc`, `target-desc`), clean filtering, and mathematically exact aggregations.

---

### ADR-004: Strict Server-Side Role and Ownership Authorization (Anti-IDOR)
- **Context:** Insecure Direct Object References (IDOR) occur when servers trust client-provided IDs for ownership modifications.
- **Decision:** All mutations derive actor identity strictly from the verified JWT session (`req.user.id`). Ownership checks inspect `startup.founderId.toString() === req.user.id` or `interest.investorId.toString() === req.user.id`.
- **Rationale:** Hiding buttons in the React UI is not security. Every route enforces role authorization middleware (`requireRole('FOUNDER')`, `requireRole('INVESTOR')`) and database ownership verification before performing updates.
- **Consequences:** Unmatched updates are rejected with HTTP 403 Forbidden or safe 404 Not Found.

---

### ADR-005: Role-Specific Focused Aggregation Dashboards
- **Context:** Founders need to review inbound pipeline requests and track publish status. Investors need to evaluate outbound requests and saved bookmarks.
- **Decision:** Dedicated, scoped aggregation endpoints (`/api/v1/dashboard/founder` and `/api/v1/dashboard/investor`) that constrain MongoDB aggregations to the authenticated user's ID before running `$group` operations.
- **Rationale:** Never fetch global datasets to compute counts on the frontend. The backend queries only the founder's startups or investor's submissions, generating accurate status totals and 7-day grouped activity charts.
- **Consequences:** Fast database aggregation pipelines and protected privacy.

---

### ADR-006: HttpOnly Secure Cookie with CSRF Awareness & Flexible Bearer Header
- **Context:** Storing JWTs in `localStorage` exposes tokens to Cross-Site Scripting (XSS) extraction.
- **Decision:** Store session JWTs in `HttpOnly`, `SameSite=Lax` (or `None` when cross-site with HTTPS) cookies. Additionally, the auth middleware supports the `Authorization: Bearer <token>` header to simplify automated testing and API consumer access.
- **Rationale:** HttpOnly cookies prevent JavaScript from accessing the session token. Central error middleware catches expired/invalid tokens and clears expired sessions cleanly.
- **Consequences:** Robust security posture against credential theft.
