# VentureFlow REST API Specification

**Base URL:** `/api/v1`  
**Authentication:** HttpOnly Session Cookie (`ventureflow_session`) or `Authorization: Bearer <token>`  
**Content-Type:** `application/json`  

---

## 1. Response Envelope Format

### Successful Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 24,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INTEREST_ALREADY_EXISTS",
    "message": "You already expressed interest in this startup.",
    "details": null
  }
}
```

---

## 2. Authentication Endpoints

### Register User
- **POST** `/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Asha Shah",
  "email": "asha@ventureflow.demo",
  "password": "Password123!",
  "role": "FOUNDER" // "FOUNDER" or "INVESTOR"
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "673f8b1a5e12...",
      "name": "Asha Shah",
      "email": "asha@ventureflow.demo",
      "role": "FOUNDER",
      "createdAt": "2026-10-09T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```
- **Errors:** `409 EMAIL_ALREADY_EXISTS`, `400 VALIDATION_ERROR`

### Login User
- **POST** `/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "asha@ventureflow.demo",
  "password": "Password123!"
}
```
- **Response (200 OK):** Sets `ventureflow_session` HttpOnly cookie. Returns safe user and token.
- **Errors:** `401 INVALID_CREDENTIALS`

### Logout User
- **POST** `/auth/logout`
- **Access:** Authenticated
- **Response (204 No Content):** Clears cookie.

### Current User Profile
- **GET** `/auth/me`
- **Access:** Authenticated
- **Response (200 OK):** Returns authenticated safe user profile.
- **Errors:** `401 UNAUTHORIZED`

---

## 3. Startup Endpoints

### Discover Startups
- **GET** `/startups`
- **Access:** Public (Only PUBLISHED startups returned)
- **Query Parameters:**
  - `q` (string): Text search across name and tagline
  - `industry` (enum): `FINTECH`, `HEALTHTECH`, `EDTECH`, `SAAS`, `ECOMMERCE`, `OTHER`
  - `stage` (enum): `IDEA`, `MVP`, `EARLY_REVENUE`, `GROWTH`
  - `minTarget` (number): Minimum integer INR target
  - `maxTarget` (number): Maximum integer INR target
  - `sort` (enum): `newest`, `target-asc`, `target-desc`
  - `page` (number): Default `1`
  - `limit` (number): Default `12`, max `24`
- **Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "673f8b1a5e12...",
      "founderId": {
        "_id": "673f8a...",
        "name": "Asha Shah"
      },
      "name": "Northstar Health",
      "slug": "northstar-health-ab12c",
      "tagline": "Intelligent clinical triage and digital patient intake workflows",
      "industry": "HEALTHTECH",
      "stage": "MVP",
      "targetAmount": 2500000,
      "location": "Bengaluru, Karnataka",
      "status": "PUBLISHED",
      "publishedAt": "2026-10-03T12:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 12, "total": 1, "totalPages": 1 }
}
```

### Startup Detail
- **GET** `/startups/:id`
- **Access:** Public (PUBLISHED) or Founder-owner (DRAFT / ARCHIVED)
- **Response (200 OK):** Full startup profile including narrative description. Founder private email is strictly omitted.

### Create Startup Draft
- **POST** `/startups`
- **Access:** Founder Only
- **Request Body:**
```json
{
  "name": "Northstar Health",
  "tagline": "Intelligent clinical triage and digital patient intake workflows",
  "description": "Northstar Health modernizes outpatient clinics with automated intake summaries...",
  "industry": "HEALTHTECH",
  "stage": "MVP",
  "targetAmount": 2500000,
  "location": "Bengaluru, Karnataka"
}
```
- **Response (201 Created):** New startup persisted with `status: "DRAFT"`.

### Update Startup
- **PATCH** `/startups/:id`
- **Access:** Founder-owner only
- **Response (200 OK):** Updated startup document.
- **Errors:** `403 FORBIDDEN` if requested by non-owner.

### Update Startup Status
- **PATCH** `/startups/:id/status`
- **Access:** Founder-owner only
- **Request Body:** `{ "status": "PUBLISHED" }` or `{ "status": "ARCHIVED" }`
- **Response (200 OK):** Updated startup document.

### Get Founder's Own Startups
- **GET** `/me/startups`
- **Access:** Founder Only
- **Response (200 OK):** Array of own startups (including drafts and archived).

---

## 4. Interest Endpoints

### Express Interest
- **POST** `/startups/:id/interests`
- **Access:** Investor Only
- **Request Body:**
```json
{
  "message": "We lead seed-stage investments in digital health. We would love to evaluate your clinical pilot metrics."
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "673f8d...",
    "startupId": "673f8b...",
    "investorId": "673f8c...",
    "message": "We lead seed-stage...",
    "status": "PENDING",
    "createdAt": "2026-10-09T14:00:00.000Z"
  }
}
```
- **Errors:** `409 INTEREST_ALREADY_EXISTS` (enforced by compound unique index), `404 STARTUP_NOT_PUBLISHED`

### Get Investor's Submitted Interests
- **GET** `/me/interests`
- **Access:** Investor Only
- **Response (200 OK):** List of investor's outgoing interest requests with current status.

### Get Founder's Received Interests
- **GET** `/me/received-interests`
- **Access:** Founder Only
- **Response (200 OK):** List of received requests on founder's startups (investor personal email redacted).

### Respond to Interest
- **PATCH** `/interests/:id/status`
- **Access:** Founder-owner of target startup only
- **Request Body:** `{ "status": "ACCEPTED" }` or `{ "status": "DECLINED" }`
- **Response (200 OK):** Updated interest with `respondedAt`.
- **Errors:** `409 INVALID_STATE_TRANSITION` (if already responded or withdrawn), `403 FORBIDDEN`

### Withdraw Interest
- **POST** `/interests/:id/withdraw`
- **Access:** Author Investor Only
- **Response (200 OK):** Updated interest with `status: "WITHDRAWN"`.
- **Errors:** `409 INVALID_STATE_TRANSITION` if no longer pending.

---

## 5. Bookmark Endpoints (P1)

### Save Bookmark
- **POST** `/startups/:id/bookmark`
- **Access:** Investor Only
- **Response (200 OK):** Idempotently saves startup to investor's watchlist.

### Remove Bookmark
- **DELETE** `/startups/:id/bookmark`
- **Access:** Investor Only
- **Response (204 No Content):** Idempotently deletes bookmark.

### Check Bookmark Status
- **GET** `/startups/:id/bookmark/status`
- **Access:** Investor Only
- **Response (200 OK):** `{ "success": true, "data": { "isBookmarked": true } }`

### Get My Bookmarks
- **GET** `/me/bookmarks`
- **Access:** Investor Only
- **Response (200 OK):** Paginated array of bookmarked startups.

---

## 6. Dashboard Endpoints

### Founder Dashboard Aggregates
- **GET** `/dashboard/founder`
- **Access:** Founder Only
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalStartups": 3,
      "publishedStartups": 2,
      "draftStartups": 1,
      "archivedStartups": 0,
      "pendingInterests": 1,
      "acceptedInterests": 2,
      "declinedInterests": 0,
      "totalInterestsReceived": 3
    },
    "recentInterests": [ ... ],
    "activityLast7Days": [
      { "date": "2026-10-03", "count": 1 },
      { "date": "2026-10-04", "count": 1 },
      { "date": "2026-10-05", "count": 0 },
      { "date": "2026-10-06", "count": 0 },
      { "date": "2026-10-07", "count": 1 },
      { "date": "2026-10-08", "count": 0 },
      { "date": "2026-10-09", "count": 0 }
    ]
  }
}
```

### Investor Dashboard Aggregates
- **GET** `/dashboard/investor`
- **Access:** Investor Only
- **Response (200 OK):** Status counts (`pending`, `accepted`, `declined`, `withdrawn`), saved bookmarks total, recent submissions, and 7-day activity array.

### Health Check
- **GET** `/health`
- **Access:** Public
- **Response (200 OK):** `{ "success": true, "data": { "status": "operational", "uptime": 124.5 } }`
