# VentureFlow — Startup Discovery & Investor Interest Platform

> **StartupMeu Software Engineer Intern (MERN Stack) Assignment**  
> *Production-Minded Two-Sided Platform for Founders and Early-Stage Investors*

---

## 1. Executive Overview

**VentureFlow** is a modern, responsive two-sided discovery and interest platform that connects early-stage startup founders with prospective investors. Founders publish deal pitches with integer INR funding requirements, development stages, and sector taxonomy. Investors browse through a debounced, multi-parameter discovery feed, bookmark ventures into a personal watchlist, and submit non-binding expressions of interest. Founders review inbound inquiries in a dedicated pipeline and respond with atomic, race-safe accept or decline transitions. Both roles receive focused, real-data aggregated dashboards with 7-day activity trend visualizations.

---

## 2. Live Demo & Repository

- **Public GitHub Repository:** [https://github.com/25Rohit25/Venture-Flow](https://github.com/25Rohit25/Venture-Flow)
- **Interactive Walkthrough Guide:** See [docs/demo-guide.md](file:///c:/Users/dell/OneDrive/Desktop/Venture%20flow/docs/demo-guide.md) for the structured 90-second evaluator script.
- **Architectural Decision Records:** See [docs/decisions.md](file:///c:/Users/dell/OneDrive/Desktop/Venture%20flow/docs/decisions.md).
- **Code0 Development Log:** See [docs/code0-development-log.md](file:///c:/Users/dell/OneDrive/Desktop/Venture%20flow/docs/code0-development-log.md).
- **REST API Documentation:** See [docs/api.md](file:///c:/Users/dell/OneDrive/Desktop/Venture%20flow/docs/api.md).

---

## 3. Key Features & Role-Based Workflows

| Capability | Guest | Founder | Investor | Enforcement Mechanism |
|:---|:---:|:---:|:---:|:---|
| **View Published Startups & Details** | Yes | Yes | Yes | Public discovery route; published status enforced server-side |
| **Create & Edit Startup Drafts** | No | Yes | No | Server middleware `requireRole('FOUNDER')` + owner verification |
| **Publish / Archive Startup** | No | Yes | No | Atomic status transition; draft hidden from public |
| **Bookmark / Watchlist Startups** | No | No | Yes | Idempotent upsert with compound index `{ startupId: 1, investorId: 1 }` |
| **Submit Expression of Interest** | No | No | Yes | Unique index constraint prevents race conditions / duplicates (409) |
| **Accept / Decline Inbound Inquiries** | No | Yes (Own) | No | Atomic conditional update (`status: 'PENDING'`) prevents conflicting transitions |
| **Withdraw Pending Interest** | No | No | Yes (Own) | Atomic update from author investor only |
| **Role-Specific Dashboard Analytics** | No | Yes | Yes | MongoDB `$group` scoped strictly to authenticated user's records |

---

## 4. Technology Stack & Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 18 + TypeScript + Vite         │
│  React Router v7 · TanStack Query · Tailwind CSS       │
│  Lucide Icons · Recharts · React Hook Form + Zod       │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS JSON + HttpOnly Cookies
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Node.js LTS + Express.js             │
│  Helmet · CORS (credentials) · Cookie Parser           │
│  Rate Limiters · Zod Validation · Central AppError     │
│  Modular Modules: Auth, Startups, Interests, Bookmarks │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose ODM
                            ▼
┌────────────────────────────────────────────────────────┐
│                   MongoDB Database                     │
│  Compound Unique Indexes:                               │
│    • { startupId: 1, investorId: 1 } on Interests      │
│    • { startupId: 1, investorId: 1 } on Bookmarks      │
│    • { slug: 1 } on Startups                           │
│    • { email: 1 } on Users                             │
└────────────────────────────────────────────────────────┘
```

- **Client:** React 18, TypeScript, Vite, Tailwind CSS (with Apple/Linear design tokens: `#F8FAFC`, `#0F172A`, `#6D5EF6`, `#10B981`), TanStack Query v5, Recharts, Lucide React.
- **Server:** Node.js LTS, Express, TypeScript, Mongoose 8, Zod, bcryptjs, jsonwebtoken, cookie-parser, cors, helmet, express-rate-limit.
- **Testing:** Vitest + Supertest integration test suite against live MongoDB.

---

## 5. Seeded Demo Accounts (Non-Sensitive)

The repository includes a deterministic seeder script (`npm run seed`) with pre-configured accounts:

| Role | Email | Password | Pre-Seeded Context |
|:---|:---|:---|:---|
| **Primary Founder** | `founder@ventureflow.demo` | `Password123!` | 2 published startups (*Northstar Health*, *LedgerStack AI*), 1 draft (*Kavach Sentinel*), 3 inbound requests |
| **Primary Investor** | `investor@ventureflow.demo` | `Password123!` | 2 bookmarks, 2 expressions of interest (*1 Pending, 1 Accepted*) |
| **Secondary Founder** | `rohan@ventureflow.demo` | `Password123!` | Isolated founder account for ownership testing |
| **Secondary Investor** | `priya@ventureflow.demo` | `Password123!` | Second investor for concurrency testing |

> **Evaluator Convenience:** In the application navbar, an instant **"Demo: Founder | Investor"** switch button allows reviewers to toggle authenticated sessions with 1 click without typing passwords!

---

## 6. Local Setup & Quickstart

### Prerequisites
- Node.js LTS (v20+ or v23+)
- npm v10+
- Running MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas connection string

### 1. Clone & Setup Workspace
```bash
git clone https://github.com/<YOUR_USERNAME>/ventureflow.git
cd ventureflow
```

### 2. Configure Environment Files

**Server:** Create `server/.env` (or copy from `server/.env.example`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ventureflow
JWT_SECRET=ventureflow_super_secret_jwt_key_2026_production_grade
JWT_EXPIRES_IN=2h
CLIENT_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
```

**Client:** Create `client/.env` (or copy from `client/.env.example`):
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Install Dependencies & Seed Database
```bash
# Install server dependencies
cd server && npm install

# Seed demo users and startups
npm run seed

# Run integration test suite
npm test

# In separate terminal tab: install client dependencies
cd ../client && npm install
```

### 4. Run Development Servers
```bash
# Terminal 1: Start Express API (runs on http://localhost:5000)
cd server && npm run dev

# Terminal 2: Start Vite Client (runs on http://localhost:5173)
cd client && npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 7. Automated Test Suite (17 Integration Tests)

Run the Vitest integration suite:
```bash
cd server && npm test
```

### Test Coverage Matrix:
- `AUTH-01`: Founder registration + login (201/200, sets signed HttpOnly cookie).
- `AUTH-02`: Duplicate registered email returns 409 `EMAIL_ALREADY_EXISTS`.
- `AUTH-03`: Unauthenticated access to protected route returns 401 `UNAUTHORIZED`.
- `RBAC-01`: Investor role attempting to create startup rejected with 403 `FORBIDDEN_ROLE`.
- `OWN-01`: Founder editing another founder's startup rejected with 403 `FORBIDDEN`.
- `DISC-01`: Draft startups are absent from public discovery listings; private emails unexposed.
- `DISC-02`: Search, sector filter, and pagination return correct metadata and results.
- `INT-01`: Investor expresses interest on published venture returns 201 `PENDING`.
- `INT-02`: Same investor submits second interest returns 409; exactly 1 document in database.
- `INT-03`: Investor attempting interest on draft venture returns 404.
- `INT-04`: Non-owner founder attempting to accept interest returns 403.
- `INT-05`: Founder accepts then attempts declining yields 409 invalid state transition.
- `INT-06`: Investor withdraws then founder accepts yields 409 invalid state transition.
- `SEC-01`: Malformed MongoDB ObjectIds or bad JSON payloads return safe 400 without crashing.
- **Concurrency Test:** Two parallel HTTP POST requests for the same startup-investor pair fired simultaneously with `Promise.all()` yield exactly **one 201 Created** and **one 409 Conflict**, verified by MongoDB document count = 1.

---

## 8. Code0 Confirmation & AI Development Protocol

As required by StartupMeu's assignment guidelines:
- **Code0 Installation:** Code0 was installed and actively utilized during development.
- **Terminal Execution:** Workspace repository initialization (`git init`), dependency installations, build checks, and Git commits were executed through the Code0 terminal.
- **Supervision & Review:** Every code structure, schema proposal, and test generation was critically reviewed and adjusted. Fragile proposals were rejected in favor of robust, secure patterns.

---

## 9. AI Development Experience: Evaluation & Adjustments

During implementation, Code0 suggestions were evaluated with rigorous engineering standards:

1. **Rejected Microservices Proposal:** When prompted for project structure, Code0 initially suggested 3 independent microservices communicating over HTTP. This was rejected because a Modular Monolith avoids distributed failures, network latency, and orchestration overhead for an MVP under a 72-hour window.
2. **Eliminated TOCTOU Race Condition in Interest Submission:** Code0 proposed checking for existing interest using an application-level `findOne` query before inserting. This was recognized as vulnerable to race conditions under concurrent requests. It was replaced with a MongoDB **compound unique index** `{ startupId: 1, investorId: 1 }` and atomic conditional status updates.
3. **Fixed Express 5 Controller Type Mismatches:** Code0 suggested silencing TypeScript compiler errors using `@ts-ignore` in controllers. This was rejected. The actual issue—Express 5's upgraded `req.params.id` typing (`string | string[]`)—was properly resolved by explicit type narrowing.
4. **Added Vite Ambient Environment Declarations:** Code0 generated API client calls referencing `import.meta.env` without Vite client type shims, breaking `tsc`. Created `client/src/vite-env.d.ts` to cleanly satisfy TypeScript.
5. **Replaced Mocked Unit Tests with Real Supertest Integration Tests:** Instead of shallow mocked tests that miss database constraint bugs, built 17 end-to-end integration tests running against MongoDB.

*(Full logs with timestamps and validation evidence are documented in [docs/code0-development-log.md](file:///c:/Users/dell/OneDrive/Desktop/Venture%20flow/docs/code0-development-log.md)).*

---

## 10. Architectural Decisions & Tradeoffs

- **Integer INR Amounts (ADR-003):** All target funding figures are stored as integer rupees to prevent IEEE 754 floating point rounding drift.
- **Compound Unique Constraints (ADR-002):** Concurrency safety is guaranteed by MongoDB storage engine constraints rather than volatile in-memory locks.
- **Server-Side Authorization (ADR-004):** UI button hiding is never relied upon for security; all protected mutations verify session role and resource ownership.
- **Aggregated Scoped Dashboards (ADR-005):** Dashboard metrics are computed via focused MongoDB `$group` pipelines constrained by user ID, avoiding expensive client-side filtering.
- **Known Limitations:** The MVP does not implement real-money payment escrow, KYC/AML regulatory compliance, or investor accreditation verification, as explicitly bounded in the assignment specification.

---

## 11. Final Submission Acceptance Checklist

- [x] **Public GitHub Repository:** Clean directory structure, `.gitignore` protects secrets, `.env.example` provided.
- [x] **README Structure:** Contains all required sections, demo credentials, and AI development logs.
- [x] **MERN Runtime:** Genuine React 18, Express, MongoDB, Node.js implementation.
- [x] **End-to-End Workflow:** Founder registers & publishes; investor discovers & submits interest; founder accepts; investor views updated status.
- [x] **Automated Tests:** 17/17 integration tests pass including concurrency and IDOR protections.
- [x] **Aesthetics & Responsive Design:** Apple/Linear design system, tested across viewports down to 375px mobile.
- [x] **No Fake Metrics:** No fabricated testimonials or false claims of actual financial transactions.
