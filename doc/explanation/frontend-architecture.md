# Frontend Architecture

This document explains the architectural decisions, technology stack, routing structure, and structural design of the VendorBridge frontend application.

## Technology Stack

The frontend is built using a modern React ecosystem optimized for performance, scalability, and exceptional developer experience.

- **Framework:** Next.js (React) App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion (`motion`)
- **Data Fetching & State:** TanStack Query (React Query)
- **Forms & Validation:** React Hook Form + Zod

## Routing and Page Structure

The application uses the Next.js App Router. Below is the mapping of the core routes, their purpose, and the components they contain:

### `/(auth)` - Authentication
- **Routes:** `/login`, `/signup`, `/forgot-password`
- **Purpose:** Public-facing pages to handle user onboarding, session creation, and password recovery.
- **Contains:**
  - Login/Signup forms with Zod validation.
  - Centered layouts independent of the main dashboard shell.

### `/(dashboard)` - Dashboard
- **Route:** `/`
- **Purpose:** The main landing area post-login, presenting a high-level overview.
- **Contains:** 
  - Summary metric cards (Active RFQs, Pending Approvals, Total Spend).
  - Quick action buttons (e.g., "New RFQ", "Add Vendor").
  - Role-specific dashboard views (Admin sees all stats, Vendors see their pending quotes).

### `/vendors` - Vendor Management
- **Route:** `/vendors`
- **Purpose:** Directory and management interface for suppliers.
- **Contains:**
  - Data table of all registered vendors with filtering and sorting.
  - Vendor detail view (Slide-out or dedicated page `/vendors/[id]`) showing contact info, performance rating, and history.
  - "Add Vendor" modal/form.

### `/rfqs` - RFQ Management
- **Route:** `/rfqs`
- **Purpose:** Interface for viewing, tracking, and creating Requests for Quotation.
- **Contains:**
  - List view of all RFQs and their current statuses (Draft, Published, Closed).
  - **New RFQ Wizard:** A multi-step form to input RFQ details, line items, and select invited vendors.
  - RFQ Detail Page (`/rfqs/[id]`): Shows RFQ specifics and allows Procurement Officers to click "Compare Bids" to launch the Quotation Comparison Matrix.

### `/quotations` - Quotations & Bidding
- **Route:** `/quotations`
- **Purpose:** Where vendors submit their bids, and officers review submissions.
- **Contains:**
  - For Vendors: Interface to view assigned RFQs, enter unit prices, delivery days, and submit their quote.
  - For Officers: Aggregated view of submitted quotes awaiting review.

### `/approvals` - Approval Workflow
- **Route:** `/approvals`
- **Purpose:** Dedicated workspace for Managers and Approvers to review pending requests.
- **Contains:**
  - Pending approval queue.
  - Detailed view of a specific request showing the chosen quote, comparison data, and historical performance.
  - Action interface to input remarks and click "Approve" or "Reject".

### `/purchase-orders` - Purchase Orders
- **Route:** `/purchase-orders`
- **Purpose:** Contract and PO directory.
- **Contains:**
  - Data table of all generated Purchase Orders.
  - PO Detail View: Formal printable document layout (Bill to, Ship to, Line items).

### `/invoices` - Invoice Management
- **Route:** `/invoices`
- **Purpose:** Billing and payment tracking.
- **Contains:**
  - List of invoices with status indicators (Generated, Sent, Paid).
  - Invoice Detail View: Options to Print, Export to PDF, Email Vendor, and "Mark as Paid".

### `/reports-analytics` - Reports & Analytics
- **Route:** `/reports-analytics`
- **Purpose:** Data visualization and business intelligence.
- **Contains:**
  - Interactive charts (spending trends, vendor performance).
  - Utilities to export data to PDF/CSV.

### `/activity-logs` - Activity Logs
- **Route:** `/activity-logs`
- **Purpose:** Immutable audit ledger.
- **Contains:**
  - Chronological data table of all system activities (who did what and when), ensuring compliance and traceability.

## Architectural Principles

1. **Component-Driven Design:** The UI is composed of reusable, isolated, and highly cohesive components.
2. **Server-Side Rendering (SSR) & Static Site Generation (SSG):** Leveraging Next.js features for optimized initial load times and SEO.
3. **Type Safety:** End-to-end type safety using TypeScript.
4. **Optimistic Updates:** Utilizing TanStack Query for snappy UI interactions.
5. **Fluid UX:** Integrating Framer Motion for subtle micro-interactions and page transitions (glassmorphism aesthetic).

## Directory Structure Strategy

```text
src/
├── app/                  # Next.js App Router (pages, layouts, routing)
│   ├── (auth)/           # Authentication routes (/login, /signup)
│   ├── (dashboard)/      # Protected routes (/, /vendors, /rfqs, etc.)
│   └── layout.tsx        # Root layout (providers, global Sidebar/Navbar)
├── components/           # Shared UI components
│   ├── ui/               # shadcn/ui generic components
│   ├── forms/            # Reusable form components
│   └── layouts/          # Structural layout components
├── features/             # Feature-specific modules (domain logic)
│   ├── rfqs/             # RFQ specific components, hooks, and types
│   ├── vendors/          # Vendor management logic
│   └── approvals/        # Approval workflow logic
├── hooks/                # Global custom React hooks
├── lib/                  # Utility functions, API clients
├── store/                # Global state management
└── types/                # Global TypeScript definitions
```

## State Management

### Server State (TanStack Query)
For asynchronous data fetching and synchronization with the backend, we use TanStack Query. Queries are co-located within the `features/` directory. Mutations handle optimistic updates.

### Client State
For UI-only state (e.g., sidebar toggles), we rely on standard React hooks (`useState`). Global UI state uses Zustand or React Context.

## Forms and Validation
- **React Hook Form:** For performant form state management.
- **Zod:** For schema-based validation shared with the backend.

## Styling and Theming
VendorBridge employs a modern, premium "glassmorphism" aesthetic.
- **Tailwind CSS:** Utility-first styling.
- **shadcn/ui:** Unstyled, accessible component primitives.
- **Framer Motion:** Used for page transitions, micro-interactions, and list animations.

## Authentication & Security
- Authentication flows via JWT stored in secure, HttpOnly cookies.
- Protected routes enforced at the layout level in Next.js and via API middleware.
