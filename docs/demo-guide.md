# VentureFlow — Evaluator Demo Guide (90–120 Seconds Walkthrough)

This guide walks an evaluator through the complete, two-sided end-to-end journey in under 2 minutes.

---

## Pre-Seeded Demo Accounts

| Role | Email | Password | Pre-loaded Context |
|:---|:---|:---|:---|
| **Founder** | `founder@ventureflow.demo` | `Password123!` | 2 Published Startups (*Northstar Health*, *LedgerStack AI*), 1 Draft (*Kavach Sentinel*), 3 Inbound Interests |
| **Investor** | `investor@ventureflow.demo` | `Password123!` | 2 Bookmarked Startups, 2 Expressed Interests, Inbound Evaluation Flow |
| **Founder 2** | `rohan@ventureflow.demo` | `Password123!` | Separate founder account for ownership testing |
| **Investor 2** | `priya@ventureflow.demo` | `Password123!` | Second investor account for concurrency verification |

> **Pro-Tip:** In the application header, use the **One-Click Demo Switcher** (`Demo: Founder | Investor`) to instantly toggle sessions without typing!

---

## Step-by-Step 90-Second Walkthrough Script

### Act 1: The Landing Experience (0:00 – 0:15)
1. Open `http://localhost:5173`.
2. Notice the modern Apple/Linear-inspired light SaaS aesthetic: off-white background (`#F8FAFC`), crisp navy ink (`#0F172A`), electric violet accents (`#6D5EF6`), and emerald badges.
3. Observe the hero headline: *"Find the startups shaping tomorrow."*
4. Scroll past the 3-step *How It Works* strip to the *Featured Live Ventures* card grid populated dynamically from MongoDB.

### Act 2: Founder Workflow — Create & Publish (0:15 – 0:40)
1. In the top nav bar, click **"Demo: Founder"** or log in with `founder@ventureflow.demo`.
2. Navigate to **Founder Dashboard** (`/dashboard/founder`):
   - Notice real aggregate counts: Published Ventures (2), Pending Interests (1), Accepted Connections (2), Total Received (3).
   - View the 7-day Inbound Activity area chart powered by Recharts.
3. Click **"+ Create Startup"**:
   - Enter Name: `QuantumScale Telemetry`
   - Enter Tagline: `Ultra-dense distributed IoT telemetry for cold-chain logistics`
   - Select Industry: `SAAS` | Stage: `MVP` | Funding Target: `₹35,00,000`
   - Enter Description (>100 characters): `QuantumScale replaces proprietary gateway hardware with software-defined Bluetooth mesh nodes across commercial refrigerated shipping containers.`
   - View the real-time live preview card on the right!
   - Click **"Publish Immediately"**.
4. The startup is instantly published live with generated unique slug and timestamp!

### Act 3: Investor Workflow — Discover, Filter & Express Interest (0:40 – 1:05)
1. In the top nav, click **"Demo: Investor"** or switch user session.
2. Navigate to **Discover Startups** (`/discover`):
   - Type in search: `triage` or `health` (debounced 300ms, updates URL seamlessly).
   - Select Sector: `Healthtech` (chips filter instantly).
   - Click the Bookmark icon on *Northstar Health* (saves instantly with toast).
3. Click on **Northstar Health** to view the full pitch page (`/startups/:id`):
   - Notice funding target: `₹25,00,000` (formatted in integer INR).
   - Notice founder name is shown as `Asha Shah`, but private email is strictly kept private!
4. Click **"Express Investor Interest"**:
   - Enter introductory message (>20 characters): `We lead seed healthtech rounds and would love to review your latest clinic pilot metrics.`
   - Click **"Submit Interest"**.
   - Notice the button transforms into an active status tracker: `You expressed interest: PENDING`.
   - *Test Race Safety:* Clicking again is prevented, and parallel server requests yield `409 INTEREST_ALREADY_EXISTS`.

### Act 4: Founder Responds to Request (1:05 – 1:25)
1. In the top nav, switch back to **"Demo: Founder"**.
2. Go to **Pipeline Requests** (`/dashboard/interests`):
   - The newly submitted request from Vikram Malhotra is listed at the top under `PENDING`.
3. Click **"Accept"**:
   - Confirm in the modal dialog.
   - Status updates atomically from `PENDING` to `ACCEPTED`.
   - Dashboard count increments to 3 Accepted Connections!

### Act 5: Investor Verification & Architecture Summary (1:25 – 1:45)
1. Switch back to **"Demo: Investor"**.
2. Visit **Investor Dashboard** (`/dashboard/investor`):
   - The status is immediately updated to `ACCEPTED`.
   - 7-day submitted activity chart reflects the updated totals.
3. Highlight architecture accomplishments:
   - MongoDB compound unique index `{ startupId: 1, investorId: 1 }` eliminates TOCTOU races.
   - 17/17 automated integration tests in Vitest passing.
   - Genuine Code0 assisted development log documented in `docs/code0-development-log.md`.
