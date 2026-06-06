# Backend Architecture — VendorBridge ERP

> **Hackathon-Ready Specification** — This document is the single source of truth for the VendorBridge backend. It covers the tech stack, request lifecycle, database schema (Prisma), all REST API contracts, the critical atomic transaction block, RBAC middleware, security configuration, and the directory blueprint. Read this before writing a single line of backend code.

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [System Architecture & Request Lifecycle](#2-system-architecture--request-lifecycle)
3. [Database Schema (Prisma)](#3-database-schema-prisma)
4. [Complete API Reference](#4-complete-api-reference)
   - [Auth](#41-auth-module--authv1auth)
   - [Vendors](#42-vendor-module--apiv1vendors)
   - [RFQs](#43-rfq-module--apiv1rfqs)
   - [Quotations](#44-quotation-module--apiv1quotations)
   - [Approvals](#45-approval-module--apiv1approvals)
   - [Purchase Orders](#46-purchase-order-module--apiv1purchase-orders)
   - [Invoices](#47-invoice-module--apiv1invoices)
   - [Activity Logs](#48-activity-log-module--apiv1activity-logs)
   - [Analytics](#49-analytics-module--apiv1analytics)
5. [Critical Transaction Block — Approval → PO → Invoice](#5-critical-transaction-block--approval--po--invoice)
6. [Role-Based Access Control (RBAC)](#6-role-based-access-control-rbac)
7. [Security Architecture](#7-security-architecture)
8. [Immutable Audit Trail](#8-immutable-audit-trail)
9. [Directory Blueprint](#9-directory-blueprint)
10. [Environment Variables](#10-environment-variables)
11. [Hackathon Delivery Scope](#11-hackathon-delivery-scope)

---

## 1. Technology Stack

| Layer | Choice | Why |
|---|---|---|
| **Runtime** | Node.js 20 LTS | Non-blocking async I/O, huge ecosystem |
| **Language** | TypeScript 5 | Compile-time safety, shared types with frontend |
| **Framework** | Express.js | Minimal, composable middleware model |
| **ORM** | Prisma | Type-safe queries, declarative schema, auto-migrations |
| **Database** | PostgreSQL 15+ | ACID transactions, UUID keys, trigger support, JSONB |
| **Auth** | JWT + bcrypt | Stateless sessions; passwords salted at cost-factor 12 |
| **Validation** | Zod | Runtime schema validation for body / params / env |
| **PDF Engine** | PDFKit | Server-side binary stream generation |
| **Email** | Nodemailer / Resend | Invoice & approval notification emails |
| **Logger** | Winston | Structured JSON logs with severity levels |
| **Security Headers** | Helmet | Sets safe HTTP response headers automatically |
| **Rate Limiter** | express-rate-limit | Prevents brute-force on auth endpoints |

---

## 2. System Architecture & Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Frontend (Port 3000)                  │
│          HTTPS Request + HttpOnly JWT Cookie (token=...)         │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Express API Server (Port 5000)                  │
│                                                                  │
│  Global Middleware Chain (applied to every request):            │
│  ┌──────────┐ ┌───────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  Helmet  │→│    CORS   │→│Rate Limit│→│  Morgan (Logger) │  │
│  └──────────┘ └───────────┘ └──────────┘ └──────────────────┘  │
│                               │                                  │
│  Route-level Middleware:      │                                  │
│  ┌──────────────────┐ ┌───────────────┐ ┌──────────────────┐    │
│  │  authenticate()  │→│  authorize()  │→│  validate(schema)│    │
│  │  (JWT Guard)     │ │  (RBAC Guard) │ │  (Zod Validator) │    │
│  └──────────────────┘ └───────────────┘ └──────────────────┘    │
│                               │                                  │
│  Domain Modules:              │                                  │
│  ┌─────┐ ┌────────┐ ┌─────┐ ┌──────────┐ ┌─────────┐ ┌──────┐ │
│  │Auth │ │Vendors │ │RFQs │ │Quotations│ │Approvals│ │PO/Inv│ │
│  └──┬──┘ └───┬────┘ └──┬──┘ └────┬─────┘ └────┬────┘ └──┬───┘ │
│     └────────┴──────────┴─────────┴─────────────┴─────────┘     │
│                               │                                  │
│  Services Layer:              │                                  │
│  ┌───────────────┐ ┌──────────────┐ ┌──────────────────────┐    │
│  │  audit.service│ │  pdf.service │ │  email.service       │    │
│  └───────────────┘ └──────────────┘ └──────────────────────┘    │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Prisma ORM Client                           │
│                      (Type-safe query builder)                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                          │
│                                                                  │
│  Tables: users, vendors, rfqs, rfq_vendors, quotations,         │
│          approvals, purchase_orders, invoices, activity_logs    │
│                                                                  │
│  Triggers: enforce_immutable_audit_logs (write-once protection) │
└─────────────────────────────────────────────────────────────────┘
```

### Request-Response Pipeline (Step by Step)

1. **Transport** — Request arrives over HTTPS. `Helmet` applies security headers. `CORS` validates origin matches `FRONTEND_URL` env var.
2. **Rate Limiting** — Sensitive paths (`/auth/login`, `/auth/register`) are throttled to 15 requests per 15-minute window.
3. **Authentication** — `authenticate()` middleware reads the `token` HttpOnly cookie, verifies the JWT signature using `JWT_SECRET`, and attaches `req.user = { userId, role }`.
4. **Authorization** — `authorize(['ROLE_A', 'ROLE_B'])` compares `req.user.role` against the allowed list. Returns `403 Forbidden` immediately if not matched.
5. **Validation** — `validate(schema)` runs the Zod schema against `req.body` / `req.params` / `req.query`. Returns `400 Bad Request` with field-level error messages on failure.
6. **Controller** — Passes clean, typed data to the domain service layer.
7. **Service + Transaction** — Business logic executes. Multi-table mutations use `prisma.$transaction()` to guarantee atomicity.
8. **Audit Write** — State-changing operations call `auditService.log()` to write an immutable record to `activity_logs`.
9. **Response** — Controller returns a structured JSON response.
10. **Error Handler** — Global `error.middleware.ts` catches any uncaught exceptions and returns a consistent error envelope.

---

## 3. Database Schema (Prisma)

> Full DDL (SQL) is available in [`doc/reference/data-schema-and-er.md`](../reference/data-schema-and-er.md). The Prisma schema below is the implementation source of truth.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ────────────────────────────────────────────────────────────────────

enum SystemRole {
  ADMIN
  OFFICER
  VENDOR
  MANAGER
}

enum VendorStatus {
  Active
  Pending
  Blocked
}

enum RfqStatus {
  Draft
  Published
  Closed
  Cancelled
}

enum QuotationStatus {
  Submitted
  Under_Review
  Accepted
  Rejected
}

enum ApprovalStatus {
  Pending
  Approved
  Rejected
}

enum PoStatus {
  Draft
  Issued
  Completed
  Cancelled
}

enum InvoiceStatus {
  Draft
  Generated
  Sent
  Paid
}

// ─── Models ───────────────────────────────────────────────────────────────────

model Role {
  id       Int        @id @default(autoincrement())
  roleName SystemRole @unique @map("role_name")
  users    User[]

  @@map("roles")
}

model User {
  id           String        @id @default(uuid()) @db.Uuid
  name         String        @db.VarChar(100)
  email        String        @unique @db.VarChar(150)
  passwordHash String        @map("password_hash") @db.VarChar(255)
  roleId       Int           @map("role_id")
  createdAt    DateTime      @default(now()) @map("created_at") @db.Timestamptz

  role         Role          @relation(fields: [roleId], references: [id], onDelete: Restrict)
  rfqs         Rfq[]
  approvals    Approval[]
  activityLogs ActivityLog[]

  @@index([email])
  @@map("users")
}

model Vendor {
  id            String          @id @default(uuid()) @db.Uuid
  vendorCode    String          @unique @map("vendor_code") @db.VarChar(30)
  companyName   String          @map("company_name") @db.VarChar(150)
  contactName   String          @map("contact_name") @db.VarChar(100)
  email         String          @unique @db.VarChar(150)
  phone         String          @db.VarChar(20)
  gstNumber     String          @unique @map("gst_number") @db.VarChar(15)
  category      String          @db.VarChar(50)
  status        VendorStatus    @default(Pending)
  rating        Decimal         @default(0.0) @db.Decimal(2, 1)
  address       String          @db.Text
  createdAt     DateTime        @default(now()) @map("created_at") @db.Timestamptz

  rfqVendors     RfqVendor[]
  quotations     Quotation[]
  purchaseOrders PurchaseOrder[]

  @@index([gstNumber])
  @@index([vendorCode])
  @@map("vendors")
}

model Rfq {
  id          String      @id @default(uuid()) @db.Uuid
  rfqNumber   String      @unique @map("rfq_number") @db.VarChar(30)
  title       String      @db.VarChar(150)
  description String?     @db.Text
  category    String      @db.VarChar(50)
  deadline    DateTime    @db.Date
  status      RfqStatus   @default(Draft)
  createdBy   String?     @map("created_by") @db.Uuid
  createdAt   DateTime    @default(now()) @map("created_at") @db.Timestamptz

  creator    User?        @relation(fields: [createdBy], references: [id], onDelete: SetNull)
  rfqVendors RfqVendor[]
  quotations Quotation[]

  @@map("rfqs")
}

model RfqVendor {
  id       String @id @default(uuid()) @db.Uuid
  rfqId    String @map("rfq_id") @db.Uuid
  vendorId String @map("vendor_id") @db.Uuid

  rfq    Rfq    @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  vendor Vendor @relation(fields: [vendorId], references: [id], onDelete: Cascade)

  @@unique([rfqId, vendorId])
  @@map("rfq_vendors")
}

model Quotation {
  id              String          @id @default(uuid()) @db.Uuid
  quotationNumber String          @unique @map("quotation_number") @db.VarChar(30)
  rfqId           String          @map("rfq_id") @db.Uuid
  vendorId        String          @map("vendor_id") @db.Uuid
  amount          Decimal         @db.Decimal(12, 2)
  deliveryTime    Int             @map("delivery_time") // in days
  remarks         String?         @db.Text
  status          QuotationStatus @default(Submitted)
  createdAt       DateTime        @default(now()) @map("created_at") @db.Timestamptz

  rfq            Rfq             @relation(fields: [rfqId], references: [id], onDelete: Cascade)
  vendor         Vendor          @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  approvals      Approval[]
  purchaseOrders PurchaseOrder[]

  @@index([rfqId])
  @@map("quotations")
}

model Approval {
  id          String         @id @default(uuid()) @db.Uuid
  quotationId String         @map("quotation_id") @db.Uuid
  approverId  String         @map("approver_id") @db.Uuid
  status      ApprovalStatus @default(Pending)
  remarks     String?        @db.Text
  updatedAt   DateTime       @default(now()) @updatedAt @map("updated_at") @db.Timestamptz

  quotation Quotation @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  approver  User      @relation(fields: [approverId], references: [id], onDelete: Restrict)

  @@map("approvals")
}

model PurchaseOrder {
  id          String   @id @default(uuid()) @db.Uuid
  poNumber    String   @unique @map("po_number") @db.VarChar(30)
  quotationId String   @map("quotation_id") @db.Uuid
  vendorId    String   @map("vendor_id") @db.Uuid
  totalAmount Decimal  @map("total_amount") @db.Decimal(12, 2)
  status      PoStatus @default(Issued)
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz

  quotation Quotation @relation(fields: [quotationId], references: [id], onDelete: Restrict)
  vendor    Vendor    @relation(fields: [vendorId], references: [id], onDelete: Restrict)
  invoices  Invoice[]

  @@index([poNumber])
  @@map("purchase_orders")
}

model Invoice {
  id            String        @id @default(uuid()) @db.Uuid
  invoiceNumber String        @unique @map("invoice_number") @db.VarChar(30)
  poId          String        @map("po_id") @db.Uuid
  taxAmount     Decimal       @map("tax_amount") @db.Decimal(12, 2)
  totalAmount   Decimal       @map("total_amount") @db.Decimal(12, 2)
  status        InvoiceStatus @default(Generated)
  createdAt     DateTime      @default(now()) @map("created_at") @db.Timestamptz

  purchaseOrder PurchaseOrder @relation(fields: [poId], references: [id], onDelete: Restrict)

  @@index([invoiceNumber])
  @@map("invoices")
}

model ActivityLog {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String?  @map("user_id") @db.Uuid
  actionType String   @map("action_type") @db.VarChar(50)
  details    String   @db.Text
  timestamp  DateTime @default(now()) @db.Timestamptz

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("activity_logs")
}
```

### Entity Relationship Summary

```
roles ──< users ──< rfqs ──< rfq_vendors >── vendors
                    rfqs ──< quotations ──< approvals
                                quotations ──< purchase_orders ──< invoices
users ──< activity_logs
```

---

## 4. Complete API Reference

**Base URL**: `http://localhost:5000/api/v1`

All responses follow this envelope:
```json
{ "success": true,  "data": { ... } }
{ "success": false, "message": "Human-readable error", "errors": [ ... ] }
```

All **protected routes** require the `token` HttpOnly cookie to be present.

---

### 4.1 Auth Module — `/api/v1/auth`

#### `POST /auth/register`
Creates an internal user account (Admin, Officer, Manager) or vendor account.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | Min 2 chars |
| `email` | string | ✅ | Valid email format |
| `password` | string | ✅ | Min 8 chars |
| `role` | enum | ✅ | `ADMIN` \| `OFFICER` \| `VENDOR` \| `MANAGER` |

**Access**: Public

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@org.com",
  "password": "Secure123!",
  "role": "OFFICER"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "user": {
    "id": "e229e614-2c6c-48c6-b333-e18e11a14c62",
    "name": "Jane Doe",
    "email": "jane@org.com",
    "role": "OFFICER"
  }
}
```

---

#### `POST /auth/login`
Validates credentials, signs a JWT, sets it as an HttpOnly cookie.

**Access**: Public | **Rate Limited**: 15 req / 15 min

**Request:**
```json
{
  "email": "jane@org.com",
  "password": "Secure123!"
}
```

**Response `200 OK`:**
```
Set-Cookie: token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=86400
```
```json
{
  "success": true,
  "user": { "id": "...", "name": "Jane Doe", "role": "OFFICER" }
}
```

---

#### `POST /auth/logout`
Expires the token cookie.

**Access**: Authenticated (any role)

**Response `200 OK`:**
```
Set-Cookie: token=; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970
```
```json
{ "success": true, "message": "Logged out successfully." }
```

---

#### `GET /auth/me`
Returns the current session user's profile.

**Access**: Authenticated (any role)

**Response `200 OK`:**
```json
{
  "success": true,
  "user": {
    "id": "e229e614-2c6c-48c6-b333-e18e11a14c62",
    "name": "Jane Doe",
    "email": "jane@org.com",
    "role": "OFFICER"
  }
}
```

---

### 4.2 Vendor Module — `/api/v1/vendors`

#### `GET /vendors`
Returns a paginated, filterable vendor directory.

**Access**: `ADMIN`, `OFFICER`, `MANAGER`

**Query Parameters:**

| Param | Type | Default | Example |
|---|---|---|---|
| `page` | int | `1` | `?page=2` |
| `limit` | int | `10` | `?limit=20` |
| `search` | string | — | `?search=TechCore` |
| `status` | enum | — | `?status=Active` |
| `category` | string | — | `?category=IT` |

**Response `200 OK`:**
```json
{
  "success": true,
  "vendors": [
    {
      "id": "a548...",
      "vendorCode": "VND-001",
      "companyName": "Alpha Office Solutions",
      "contactName": "Rahul Mehta",
      "email": "rahul@alpha.com",
      "phone": "+919876543210",
      "gstNumber": "27AAACA1234A1Z1",
      "category": "Furniture",
      "status": "Active",
      "rating": "4.5",
      "address": "101 Industrial Area, Pune"
    }
  ],
  "pagination": { "total": 45, "page": 1, "limit": 10, "totalPages": 5 }
}
```

---

#### `GET /vendors/:id`
Returns a single vendor's full profile.

**Access**: `ADMIN`, `OFFICER`, `MANAGER`

**Response `200 OK`:** Same shape as one vendor object above.

---

#### `POST /vendors`
Registers a new supplier in the directory. Auto-generates `vendorCode`.

**Access**: `ADMIN`, `OFFICER`

**Request:**
```json
{
  "companyName": "TechCore Supplies",
  "contactName": "Sarah Connor",
  "email": "sarah@techcore.com",
  "phone": "+919988776655",
  "gstNumber": "27AABCT9876D1Z2",
  "category": "IT",
  "address": "404 Tech Blvd, Mumbai"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "vendor": { "id": "c1fe...", "vendorCode": "VND-046", "companyName": "TechCore Supplies" }
}
```

---

#### `PATCH /vendors/:id`
Updates a vendor's profile fields.

**Access**: `ADMIN`, `OFFICER`

---

#### `PATCH /vendors/:id/status`
Activates, blocks, or sets a vendor status.

**Access**: `ADMIN`, `OFFICER`

**Request:**
```json
{ "status": "Blocked" }
```

**Response `200 OK`:**
```json
{
  "success": true,
  "vendor": { "id": "a548...", "companyName": "Alpha Office Solutions", "status": "Blocked" }
}
```

---

### 4.3 RFQ Module — `/api/v1/rfqs`

#### `GET /rfqs`
Lists RFQs.

**Access**: Authenticated (all roles)

**Behavior (role-scoped)**:
- `ADMIN` / `OFFICER` → all RFQs
- `VENDOR` → only RFQs where vendor is listed in `rfq_vendors`
- `MANAGER` → all RFQs (read-only context)

**Response `200 OK`:**
```json
{
  "success": true,
  "rfqs": [
    {
      "id": "6a9c...",
      "rfqNumber": "RFQ-2026-0012",
      "title": "Corporate Laptop Procurement",
      "category": "IT",
      "deadline": "2026-06-20",
      "status": "Published",
      "createdAt": "2026-06-06T00:00:00.000Z"
    }
  ]
}
```

---

#### `GET /rfqs/:id`
Returns full RFQ details including assigned vendor list.

**Access**: Authenticated (role-scoped as above)

---

#### `POST /rfqs`
Creates and optionally publishes an RFQ. Inserts records into `rfqs` and `rfq_vendors`.

**Access**: `OFFICER`, `ADMIN`

**Request:**
```json
{
  "title": "Ergonomic Chairs",
  "description": "Supply of 30 adjustable mesh chairs for the engineering floor.",
  "category": "Furniture",
  "deadline": "2026-06-18",
  "status": "Published",
  "invitedVendorIds": ["a548...", "c1fe..."]
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "rfq": { "id": "ff22...", "rfqNumber": "RFQ-2026-0013", "status": "Published" }
}
```

---

#### `PATCH /rfqs/:id`
Updates a Draft RFQ's fields.

**Access**: `OFFICER`, `ADMIN`

---

#### `POST /rfqs/:id/publish`
Moves a Draft RFQ to Published, triggering vendor notification events.

**Access**: `OFFICER`, `ADMIN`

**Response `200 OK`:**
```json
{ "success": true, "rfq": { "id": "ff22...", "status": "Published" } }
```

---

### 4.4 Quotation Module — `/api/v1/quotations`

#### `GET /quotations`
Lists quotations.

**Access**: Authenticated (role-scoped)

**Behavior**:
- `VENDOR` → only their own submitted quotations
- `OFFICER` / `ADMIN` → all quotations

---

#### `POST /quotations`
Vendor submits a pricing proposal for an assigned RFQ.

**Access**: `VENDOR` only

**Request:**
```json
{
  "rfqId": "ff22c83d-e304-42ea-a4df-0092cbbb0011",
  "amount": 18000.00,
  "deliveryTime": 5,
  "remarks": "Includes 3-year warranty on base structure."
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "quotation": {
    "id": "bb44...",
    "quotationNumber": "QT-2026-0091",
    "amount": "18000.00",
    "deliveryTime": 5,
    "status": "Submitted"
  }
}
```

---

#### `GET /quotations/compare/:rfqId`
Returns all quotations for an RFQ in a comparison-ready shape. Automatically marks the lowest price bid.

**Access**: `OFFICER`, `ADMIN`

**Response `200 OK`:**
```json
{
  "success": true,
  "rfq": { "id": "ff22...", "rfqNumber": "RFQ-2026-0013", "title": "Ergonomic Chairs" },
  "quotations": [
    {
      "id": "bb44...",
      "quotationNumber": "QT-2026-0091",
      "companyName": "Alpha Office Solutions",
      "vendorRating": 4.5,
      "amount": 18000.00,
      "deliveryTime": 5,
      "isLowestPrice": true
    },
    {
      "id": "cf66...",
      "quotationNumber": "QT-2026-0092",
      "companyName": "TechCore Supplies",
      "vendorRating": 4.2,
      "amount": 19500.00,
      "deliveryTime": 3,
      "isLowestPrice": false
    }
  ]
}
```

---

#### `POST /quotations/select`
The Procurement Officer nominates a quotation for approval. Sets the quotation to `Under_Review` and creates an `Approval` record with status `Pending`.

**Access**: `OFFICER`, `ADMIN`

**Request:**
```json
{ "quotationId": "bb44d21e-12fa-45b0-91ff-ee212cb10123" }
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Quotation nominated. Approval workflow initialized.",
  "approvalId": "a18c..."
}
```

---

### 4.5 Approval Module — `/api/v1/approvals`

#### `GET /approvals`
Lists all pending approval requests for the approval queue.

**Access**: `MANAGER`, `ADMIN`

**Response `200 OK`:**
```json
{
  "success": true,
  "approvals": [
    {
      "id": "a18c...",
      "status": "Pending",
      "createdAt": "2026-06-06T11:00:00.000Z",
      "quotation": { "quotationNumber": "QT-2026-0091", "amount": 18000.00 },
      "vendor": { "companyName": "Alpha Office Solutions" },
      "rfq": { "rfqNumber": "RFQ-2026-0013", "title": "Ergonomic Chairs" }
    }
  ]
}
```

---

#### `GET /approvals/:id`
Full detail view of a single approval with quotation breakdown, remarks history, and associated RFQ.

**Access**: `MANAGER`, `ADMIN`, `OFFICER`

---

#### `POST /approvals/:id/action`
Approves or rejects the nominated proposal.

> ⚠️ **If `action: "Approved"`**, this triggers the [atomic transaction block](#5-critical-transaction-block--approval--po--invoice) that auto-generates the Purchase Order and Invoice.

**Access**: `MANAGER`, `ADMIN`

**Request:**
```json
{
  "action": "Approved",
  "remarks": "Budget within Q2 allocation. Vendor rating satisfactory."
}
```

**Response `200 OK` (Approved):**
```json
{
  "success": true,
  "status": "Approved",
  "generated": {
    "purchaseOrder": { "id": "e44b...", "poNumber": "PO-2026-0001" },
    "invoice": { "id": "ff33...", "invoiceNumber": "INV-2026-0001" }
  }
}
```

**Response `200 OK` (Rejected):**
```json
{
  "success": true,
  "status": "Rejected",
  "message": "Procurement request rejected. Officer has been notified."
}
```

---

### 4.6 Purchase Order Module — `/api/v1/purchase-orders`

#### `GET /purchase-orders`
Lists all Purchase Orders.

**Access**: All authenticated roles (vendor sees only their own)

---

#### `GET /purchase-orders/:id`
Returns the full PO document data, formatted for rendering or printing.

**Access**: All authenticated roles (vendor sees only their own)

**Response `200 OK`:**
```json
{
  "success": true,
  "purchaseOrder": {
    "id": "e44b...",
    "poNumber": "PO-2026-0001",
    "status": "Issued",
    "createdAt": "2026-06-06T11:05:00.000Z",
    "totalAmount": "18000.00",
    "vendor": {
      "companyName": "Alpha Office Solutions",
      "gstNumber": "27AAACA1234A1Z1",
      "address": "101 Industrial Area, Pune",
      "contactName": "Rahul Mehta"
    },
    "quotation": { "quotationNumber": "QT-2026-0091", "deliveryTime": 5 }
  }
}
```

---

#### `GET /purchase-orders/:id/pdf`
Streams the PO as a printable PDF binary.

**Access**: `ADMIN`, `OFFICER`, `VENDOR`

**Response Headers:**
```
Content-Type: application/pdf
Content-Disposition: inline; filename="PO-2026-0001.pdf"
```

---

### 4.7 Invoice Module — `/api/v1/invoices`

#### `GET /invoices`
Lists all invoices.

**Access**: All authenticated roles (vendor sees only their own)

---

#### `GET /invoices/:id`
Returns full invoice data with tax breakdown.

**Access**: All authenticated roles (vendor sees only their own)

**Response `200 OK`:**
```json
{
  "success": true,
  "invoice": {
    "id": "ff33...",
    "invoiceNumber": "INV-2026-0001",
    "status": "Generated",
    "createdAt": "2026-06-06T11:05:00.000Z",
    "purchaseOrder": { "poNumber": "PO-2026-0001" },
    "vendor": { "companyName": "Alpha Office Solutions", "gstNumber": "27AAACA1234A1Z1" },
    "breakdown": {
      "subtotal": "18000.00",
      "cgst": "1620.00",
      "sgst": "1620.00",
      "taxAmount": "3240.00",
      "grandTotal": "21240.00"
    }
  }
}
```

---

#### `PATCH /invoices/:id/pay`
Marks an invoice as Paid.

**Access**: `OFFICER`, `ADMIN`

**Response `200 OK`:**
```json
{ "success": true, "invoice": { "id": "ff33...", "status": "Paid" } }
```

---

#### `POST /invoices/:id/email`
Sends the invoice as a PDF email attachment to the linked vendor.

**Access**: `OFFICER`, `ADMIN`

**Response `200 OK`:**
```json
{ "success": true, "message": "Invoice emailed to sarah@techcore.com." }
```

---

#### `GET /invoices/:id/pdf`
Streams invoice as a PDF binary.

**Access**: `ADMIN`, `OFFICER`, `VENDOR`

---

### 4.8 Activity Log Module — `/api/v1/activity-logs`

> **Immutable** — No POST, PUT, PATCH, or DELETE routes exist for this resource. Logs are written only by the system internally.

#### `GET /activity-logs`
Returns chronological audit trail.

**Access**: `ADMIN`, `OFFICER`

**Query Parameters:** `page`, `limit`, `actionType`, `userId`

**Response `200 OK`:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "d1a2...",
      "actionType": "PO_GENERATED",
      "details": "PO-2026-0001 generated on approval of QT-2026-0091 by Manager John.",
      "timestamp": "2026-06-06T11:05:00.000Z",
      "user": { "name": "Manager John", "email": "manager@org.com" }
    }
  ],
  "pagination": { "total": 128, "page": 1, "limit": 20, "totalPages": 7 }
}
```

**Tracked Action Types:**

| `actionType` | Trigger Event |
|---|---|
| `USER_REGISTERED` | New user signup |
| `USER_LOGGED_IN` | Successful login |
| `VENDOR_CREATED` | New vendor registered |
| `VENDOR_STATUS_CHANGED` | Vendor blocked / activated |
| `RFQ_CREATED` | RFQ saved as Draft |
| `RFQ_PUBLISHED` | RFQ moved to Published |
| `QUOTATION_SUBMITTED` | Vendor submits a bid |
| `QUOTATION_SELECTED` | Bid nominated for approval |
| `APPROVAL_APPROVED` | Manager approves requisition |
| `APPROVAL_REJECTED` | Manager rejects requisition |
| `PO_GENERATED` | Purchase Order auto-created |
| `INVOICE_GENERATED` | Invoice auto-created |
| `INVOICE_PAID` | Invoice marked as paid |
| `INVOICE_EMAILED` | Invoice sent to vendor |

---

### 4.9 Analytics Module — `/api/v1/analytics`

#### `GET /analytics/dashboard`
Returns KPI summary cards for the dashboard.

**Access**: `ADMIN`, `OFFICER`, `MANAGER`

**Response `200 OK`:**
```json
{
  "success": true,
  "kpis": {
    "totalVendors": 45,
    "activeRfqs": 8,
    "pendingApprovals": 3,
    "totalPurchaseOrders": 22,
    "totalInvoices": 19,
    "overdueInvoices": 2,
    "monthlySpend": "284500.00"
  }
}
```

---

#### `GET /analytics/spending`
Returns monthly spend aggregated over the last 6 months.

**Access**: `ADMIN`, `OFFICER`, `MANAGER`

**Response `200 OK`:**
```json
{
  "success": true,
  "spending": [
    { "month": "2026-01", "total": "48200.00" },
    { "month": "2026-02", "total": "62100.00" },
    { "month": "2026-03", "total": "55800.00" },
    { "month": "2026-04", "total": "71400.00" },
    { "month": "2026-05", "total": "68900.00" },
    { "month": "2026-06", "total": "41500.00" }
  ]
}
```

---

#### `GET /analytics/vendors`
Returns vendor performance metrics.

**Access**: `ADMIN`, `OFFICER`, `MANAGER`

---

## 5. Critical Transaction Block — Approval → PO → Invoice

When a Manager approves a quotation, the system must atomically execute 8 sequential database operations. **If any step fails, the entire block rolls back.** This prevents orphaned Purchase Orders or Invoices from existing in the database.

```
                         Manager hits POST /approvals/:id/action
                                         │
                                         ▼
                         ┌─────────────────────────────┐
                         │   prisma.$transaction(...)   │
                         │                             │
                         │  1. Fetch Approval record   │
                         │  2. Update Approval → Approved│
                         │  3. Update Quotation → Accepted│
                         │  4. Reject all other bids   │
                         │     for this RFQ            │
                         │  5. Update RFQ → Closed     │
                         │  6. Generate PO Number      │
                         │     (PO-2026-XXXX)          │
                         │  7. Create PurchaseOrder    │
                         │  8. Calculate GST 18%       │
                         │     Generate Invoice Number │
                         │     (INV-2026-XXXX)         │
                         │  9. Create Invoice          │
                         │ 10. Write ActivityLog       │
                         │     (write-once, immutable) │
                         │                             │
                         │       COMMIT ✅             │
                         └─────────────────────────────┘
                                         │
                                         ▼
                         Return: { approvalId, poNumber, invoiceNumber }
```

### Reference Implementation

```typescript
// modules/approvals/approvals.service.ts

import { PrismaClient } from '@prisma/client';

export async function processApproval(
  db: PrismaClient,
  approvalId: string,
  approverId: string,
  action: 'Approved' | 'Rejected',
  remarks: string
) {
  if (action === 'Rejected') {
    return db.$transaction(async (tx) => {
      const approval = await tx.approval.update({
        where: { id: approvalId },
        data: { status: 'Rejected', remarks },
      });

      await tx.activityLog.create({
        data: {
          userId: approverId,
          actionType: 'APPROVAL_REJECTED',
          details: `Approval ${approvalId} rejected. Remarks: ${remarks}`,
        },
      });

      return { approval };
    });
  }

  // ── Approved Path: Atomic PO + Invoice Generation ──────────────────────────
  return db.$transaction(async (tx) => {
    // 1. Fetch approval with full context
    const approval = await tx.approval.findUniqueOrThrow({
      where: { id: approvalId },
      include: {
        quotation: { include: { rfq: true, vendor: true } },
      },
    });

    if (approval.status !== 'Pending') {
      throw new Error('This approval has already been actioned.');
    }

    // 2. Approve the approval record
    await tx.approval.update({
      where: { id: approvalId },
      data: { status: 'Approved', remarks, approverId },
    });

    // 3. Accept the selected quotation
    await tx.quotation.update({
      where: { id: approval.quotationId },
      data: { status: 'Accepted' },
    });

    // 4. Reject all competing quotations for this RFQ
    await tx.quotation.updateMany({
      where: {
        rfqId: approval.quotation.rfqId,
        id: { not: approval.quotationId },
      },
      data: { status: 'Rejected' },
    });

    // 5. Close the RFQ
    await tx.rfq.update({
      where: { id: approval.quotation.rfqId },
      data: { status: 'Closed' },
    });

    // 6. Generate sequential PO Number
    const poCount = await tx.purchaseOrder.count();
    const year = new Date().getFullYear();
    const poNumber = `PO-${year}-${String(poCount + 1).padStart(4, '0')}`;

    // 7. Create Purchase Order
    const purchaseOrder = await tx.purchaseOrder.create({
      data: {
        poNumber,
        quotationId: approval.quotationId,
        vendorId: approval.quotation.vendorId,
        totalAmount: approval.quotation.amount,
        status: 'Issued',
      },
    });

    // 8. Calculate GST (CGST 9% + SGST 9% = 18% total)
    const subtotal = Number(approval.quotation.amount);
    const taxRate = 0.18;
    const taxAmount = subtotal * taxRate;
    const grandTotal = subtotal + taxAmount;

    // 9. Generate Invoice Number & create Invoice
    const invoiceCount = await tx.invoice.count();
    const invoiceNumber = `INV-${year}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoice = await tx.invoice.create({
      data: {
        invoiceNumber,
        poId: purchaseOrder.id,
        taxAmount,
        totalAmount: grandTotal,
        status: 'Generated',
      },
    });

    // 10. Write immutable audit log
    await tx.activityLog.create({
      data: {
        userId: approverId,
        actionType: 'PO_GENERATED',
        details: `Approval granted. ${poNumber} and ${invoiceNumber} auto-generated from quotation ${approval.quotation.quotationNumber}.`,
      },
    });

    return { purchaseOrder, invoice };
  });
}
```

---

## 6. Role-Based Access Control (RBAC)

### Role Permission Matrix

| Route / Action | `ADMIN` | `OFFICER` | `MANAGER` | `VENDOR` |
|---|:---:|:---:|:---:|:---:|
| Register / Login | ✅ | ✅ | ✅ | ✅ |
| View Vendor List | ✅ | ✅ | ✅ | ❌ |
| Create / Edit Vendor | ✅ | ✅ | ❌ | ❌ |
| Block / Unblock Vendor | ✅ | ✅ | ❌ | ❌ |
| View All RFQs | ✅ | ✅ | ✅ | ❌ |
| View Assigned RFQs | — | — | — | ✅ |
| Create / Publish RFQ | ✅ | ✅ | ❌ | ❌ |
| Submit Quotation | ❌ | ❌ | ❌ | ✅ |
| View Comparison Matrix | ✅ | ✅ | ❌ | ❌ |
| Select / Nominate Bid | ✅ | ✅ | ❌ | ❌ |
| View Approval Queue | ✅ | ❌ | ✅ | ❌ |
| Approve / Reject | ✅ | ❌ | ✅ | ❌ |
| View Purchase Orders | ✅ | ✅ | ✅ | ✅ (own) |
| Mark Invoice Paid | ✅ | ✅ | ❌ | ❌ |
| Email Invoice | ✅ | ✅ | ❌ | ❌ |
| View Activity Logs | ✅ | ✅ | ❌ | ❌ |
| View Analytics | ✅ | ✅ | ✅ | ❌ |

### Middleware Implementations

```typescript
// middleware/auth.middleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No session token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorized: Token invalid or expired.' });
  }
}
```

```typescript
// middleware/role.middleware.ts
import { SystemRole } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

export function authorize(allowedRoles: SystemRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role as SystemRole;

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${role}' is not permitted to perform this action.`,
      });
    }
    next();
  };
}
```

```typescript
// middleware/validate.middleware.ts
import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors: result.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    req.body = result.data;
    next();
  };
}
```

### Applying Guards on Routes

```typescript
// modules/rfqs/rfqs.router.ts
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createRfqSchema } from './rfqs.schema';
import * as rfqController from './rfqs.controller';

const router = Router();

router.use(authenticate); // All RFQ routes require a valid session

router.get('/', rfqController.listRfqs);                                           // role-filtered inside controller
router.get('/:id', rfqController.getRfq);
router.post('/', authorize(['OFFICER', 'ADMIN']), validate(createRfqSchema), rfqController.createRfq);
router.patch('/:id', authorize(['OFFICER', 'ADMIN']), rfqController.updateRfq);
router.post('/:id/publish', authorize(['OFFICER', 'ADMIN']), rfqController.publishRfq);

export default router;
```

---

## 7. Security Architecture

### Token Configuration

```typescript
// Signing JWT on login
const token = jwt.sign(
  { userId: user.id, role: user.role.roleName },
  process.env.JWT_SECRET!,
  { expiresIn: '24h', algorithm: 'HS256' }
);

// Setting the cookie
res.cookie('token', token, {
  httpOnly: true,    // Blocks JavaScript access — mitigates XSS
  secure: true,      // HTTPS only
  sameSite: 'strict',// Blocks cross-site requests — mitigates CSRF
  maxAge: 86400000,  // 24 hours in ms
  path: '/',
});
```

### Global App Configuration

```typescript
// app.ts
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

const app = express();

// Security headers
app.use(helmet());

// CORS — only allow the frontend origin with credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limit auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: { success: false, message: 'Too many requests. Please try again in 15 minutes.' },
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
```

### Security Checklist

| Threat | Mitigation |
|---|---|
| XSS (Cookie theft) | `httpOnly: true` on JWT cookie |
| CSRF | `sameSite: 'strict'` cookie policy |
| Brute-force login | `express-rate-limit` on `/auth/login` |
| SQL Injection | Prisma parameterized queries — no raw SQL |
| Insecure headers | `helmet()` global middleware |
| Plaintext passwords | `bcrypt` hashing at cost-factor 12 |
| Unauthorized access | JWT guard + RBAC guard on every protected route |
| Audit tampering | PostgreSQL DB-level trigger blocking UPDATE/DELETE on `activity_logs` |

---

## 8. Immutable Audit Trail

The `activity_logs` table uses a **PostgreSQL trigger** to enforce write-once integrity. This runs at the database engine level — no application code or ORM call can bypass it.

```sql
-- Run this after initial migration
CREATE OR REPLACE FUNCTION block_activity_log_modifications()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION
      'Database Violation: Table activity_logs is immutable. Updates and deletions are forbidden.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_immutable_audit_logs
  BEFORE UPDATE OR DELETE ON activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION block_activity_log_modifications();
```

### Audit Service Wrapper

```typescript
// services/audit.service.ts
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export async function logAction(
  actionType: string,
  details: string,
  userId?: string
): Promise<void> {
  await db.activityLog.create({
    data: { userId: userId ?? null, actionType, details },
  });
}
```

---

## 9. Directory Blueprint

```
backend/
├── src/
│   │
│   ├── server.ts                  # Entry point: creates HTTP server, binds port
│   ├── app.ts                     # Express app: global middleware, route mounts
│   │
│   ├── config/
│   │   ├── env.ts                 # Zod-validated env var schema (fails fast on startup)
│   │   └── database.ts            # Prisma client singleton export
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT extraction & verification
│   │   ├── role.middleware.ts     # RBAC authorize() factory function
│   │   ├── validate.middleware.ts # Zod schema validator factory function
│   │   └── error.middleware.ts    # Global catch-all error handler (returns JSON)
│   │
│   ├── modules/                   # Domain-Driven module grouping
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schema.ts     # Zod schemas for register & login bodies
│   │   │
│   │   ├── users/
│   │   │   ├── users.router.ts
│   │   │   ├── users.controller.ts
│   │   │   └── users.service.ts
│   │   │
│   │   ├── vendors/
│   │   │   ├── vendors.router.ts
│   │   │   ├── vendors.controller.ts
│   │   │   ├── vendors.service.ts
│   │   │   └── vendors.schema.ts
│   │   │
│   │   ├── rfqs/
│   │   │   ├── rfqs.router.ts
│   │   │   ├── rfqs.controller.ts
│   │   │   ├── rfqs.service.ts
│   │   │   └── rfqs.schema.ts
│   │   │
│   │   ├── quotations/
│   │   │   ├── quotations.router.ts
│   │   │   ├── quotations.controller.ts
│   │   │   ├── quotations.service.ts
│   │   │   └── quotations.schema.ts
│   │   │
│   │   ├── approvals/
│   │   │   ├── approvals.router.ts
│   │   │   ├── approvals.controller.ts
│   │   │   ├── approvals.service.ts  # Contains the $transaction block
│   │   │   └── approvals.schema.ts
│   │   │
│   │   ├── purchase-orders/
│   │   │   ├── purchase-orders.router.ts
│   │   │   └── purchase-orders.controller.ts
│   │   │
│   │   ├── invoices/
│   │   │   ├── invoices.router.ts
│   │   │   └── invoices.controller.ts
│   │   │
│   │   ├── activity-logs/
│   │   │   ├── activity-logs.router.ts
│   │   │   └── activity-logs.controller.ts
│   │   │
│   │   └── analytics/
│   │       ├── analytics.router.ts
│   │       └── analytics.controller.ts
│   │
│   ├── services/                  # Shared cross-domain services
│   │   ├── audit.service.ts       # Centralized activity log writer
│   │   ├── pdf.service.ts         # PDFKit PO & Invoice generator
│   │   └── email.service.ts       # Nodemailer / Resend wrapper
│   │
│   └── utils/
│       ├── logger.ts              # Winston configuration
│       └── generateNumber.ts     # PO / Invoice number generators
│
├── prisma/
│   ├── schema.prisma              # Canonical data model
│   └── migrations/                # Auto-generated by prisma migrate
│
├── .env                           # Local environment variables (never commit)
├── .env.example                   # Safe template for env variables
├── tsconfig.json
└── package.json
```

---

## 10. Environment Variables

```bash
# .env.example

# Server
PORT=5000
NODE_ENV=development

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/vendorbridge_db"

# Auth
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="24h"

# Frontend (CORS allowlist)
FRONTEND_URL="http://localhost:3000"

# Email (choose one)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="noreply@yourorg.com"
SMTP_PASS="your-app-password"
# OR
RESEND_API_KEY="re_xxxxxxxxxxxxxxxx"
```

```typescript
// config/env.ts — Fails fast at startup if any required var is missing
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  FRONTEND_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
```

---

## 11. Hackathon Delivery Scope

### ✅ Must-Build (MVP — Core Procurement Loop)

These modules form the critical path. The app is non-functional without them.

| Module | Key Deliverables |
|---|---|
| **Auth** | Register, Login, Logout, JWT cookie, RBAC middleware |
| **Vendors** | CRUD, status toggle, GST/category fields |
| **RFQs** | Create, Publish, Assign vendors via `rfq_vendors` |
| **Quotations** | Vendor bid submission, comparison endpoint |
| **Bid Comparison** | `GET /compare/:rfqId` with `isLowestPrice` flag |
| **Approvals** | Queue view, Approve/Reject with remarks |
| **Atomic PO + Invoice** | `prisma.$transaction` block generating both documents on approval |
| **Activity Logs** | Write-once log on every state mutation, `GET /activity-logs` |
| **Analytics Dashboard** | KPI aggregations — `GET /analytics/dashboard` |

### 🟡 Nice-to-Have (Build if time permits)

| Feature | Notes |
|---|---|
| **PDF Export** | PDFKit streaming binary for POs and Invoices |
| **Invoice Emailing** | Nodemailer / Resend attachment on `POST /invoices/:id/email` |
| **Vendor Ratings** | `PATCH /vendors/:id/rating` for post-PO feedback |
| **Spend Analytics** | Monthly spend chart data via `GET /analytics/spending` |

### ❌ Out of Scope for MVP

| Feature | Why skipped |
|---|---|
| Redis Caching | Premature optimisation for hackathon scale |
| WebSocket Notifications | HTTP polling sufficient for demo |
| AWS S3 File Uploads | Use local Multer disk storage for attachments |
| Multi-Tenant Architecture | Single-org scope for this version |
| Kafka / Event Queues | Overkill for synchronous MVP workflows |
| Microservice Extraction | Monolith is correct for hackathon velocity |

---

*VendorBridge backend is built on the PERN stack (PostgreSQL + Express + React/Next.js + Node.js) with TypeScript throughout. This document maps 1:1 to the schemas in [`doc/reference/data-schema-and-er.md`](../reference/data-schema-and-er.md), the API contracts in [`doc/reference/api-contracts.md`](../reference/api-contracts.md), and the system overview in [`doc/explanation/system-overview-and-architecture.md`](./system-overview-and-architecture.md).*
