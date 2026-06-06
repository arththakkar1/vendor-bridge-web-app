# VendorBridge - Procurement & Vendor Management ERP

VendorBridge is a comprehensive Procurement & Vendor Management ERP system designed to digitize and streamline the procurement lifecycle for organizations. The platform centralizes vendor management, RFQ creation, quotation collection, approval workflows, purchase order generation, invoice management, and procurement analytics.

## Documentation

This project uses the **Diátaxis documentation framework**, separating documentation into explanations, references, tutorials, and how-to guides.

All architectural, technical, and conceptual documentation is located in the `doc/` directory.

**[Start here: View Full Documentation Index](doc/README.md)**

## Tech Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, TanStack Query
- **Backend:** Node.js (Express/NestJS)
- **Database:** PostgreSQL
- **Deployment:** Vercel (Frontend), Railway/Render (Backend)

## Features

- **Vendor Management:** Comprehensive supplier directory with performance tracking and rating.
- **RFQ & Quotations:** Streamlined creation of RFQs and automated side-by-side quotation comparisons.
- **Approval Workflows:** Multi-level approval chains with full audit history.
- **POs & Invoices:** Auto-generation of Purchase Orders and Invoices upon approval.
- **Immutable Audit Trails:** Database-level lock mechanisms on activity logs to guarantee compliance.

## Getting Started

Please see the [Getting Started Tutorial](doc/tutorials/getting-started.md) for local development setup instructions.
