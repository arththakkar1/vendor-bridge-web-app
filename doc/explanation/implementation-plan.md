# Milestone Implementation Plan

---

## 1. Project Phases & Rollout Milestones

The VendorBridge ERP system is mapped into five implementation phases spanning database structure, backend APIs, frontend styling, cross-role workflows, and cloud deployments.

```
+-------------------------------------------------------+
|  Phase 1: DB setup & DDL migrations                  |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|  Phase 2: Express REST API Controllers & Auth         |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|  Phase 3: Next.js Layout, Context & shadcn components |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|  Phase 4: Multi-role Workflow & Page Integrations     |
+-------------------------------------------------------+
                           |
                           v
+-------------------------------------------------------+
|  Phase 5: Automated Testing & Cloud deployment        |
+-------------------------------------------------------+
```

---

## 2. Phase Breakdown

### Phase 1: Database Initialization
*   Setup a PostgreSQL local container.
*   Deploy migrations for `users`, `roles`, `vendors`, `rfqs`, `rfq_vendors`, `quotations`, `approvals`, `purchase_orders`, `invoices`, and `activity_logs`.
*   Establish DB schema audit trigger ensuring log immutability.
*   *Validation*: Run schema migration logs verification.

### Phase 2: Backend REST Service (Node.js & Express)
*   Setup routes for authentication (password crypt hashing with bcrypt, signing token).
*   Code JWT middleware guarding operations.
*   Build routes for managing vendor profiles, creating RFQs, submitting quotations, selecting bids, approving transactions, and generating POs/Invoices.
*   Add compliance log middleware tracking state-changing mutations.
*   *Validation*: Express integration test suites.

### Phase 3: Frontend Layout Framework (Next.js)
*   Initialize Next.js workspace using TypeScript, Tailwind CSS, Framer Motion, and TanStack Query.
*   Install shadcn/ui library elements (Dialog, Dropdown, Table, Input, Toast).
*   Code the navigation layout shell, user profile avatar header, and togglable theme selector.
*   *Validation*: Local compilation checks without typescript errors.

### Phase 4: Workflow Views Implementation
*   **Auth**: Next.js login/registration page.
*   **Vendors**: Directory grid featuring status change drawers.
*   **RFQs**: Step-by-step RFQ builder.
*   **Bidding**: Vendor proposal pricing form.
*   **Comparison**: Bids comparison matrix table.
*   **Approvals**: Manager approvals chain dashboard.
*   **PO/Invoices**: Printable PDF-ready invoicing sheets.
*   **Activity Ledger**: Compliance timeline dashboard.
*   **Analytics**: Spent distribution SVGs.
*   *Validation*: End-to-end user navigation flow.

### Phase 5: Verification & Deployments
*   Add unit test suites (Vitest for frontend components, Jest/Supertest for API endpoints).
*   Verify cross-role workflow manually.
*   Publish Next.js client on Vercel; host Node.js backend on Render/Railway.
