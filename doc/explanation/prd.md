# Product Requirements Document (PRD)

---

## 1. Product Vision & Value Proposition
VendorBridge is a specialized, end-to-end Procurement & Vendor Management ERP system designed to centralize and automate organizational purchasing activities. By digitizing supplier onboarding, RFQ creation, quotation bidding, comparison logic, approval gates, purchase order execution, and invoicing, the platform eliminates manual inefficiencies, minimizes procurement delay, enforces authorization compliance, and provides real-time financial spending transparency.

---

## 2. Target Audience & Roles (User Personas)

### 2.1 Admin (System Administrator)
*   **Objective**: Configure system properties, manage users and roles, audit audit logs, and manage supplier statuses.
*   **Core Tasks**: Create internal users, reset access tokens, override incorrect statuses, review immutable activity logs, and observe master reports.

### 2.2 Procurement Officer
*   **Objective**: Manage the day-to-day procurement pipeline by finding vendors, dispatching RFQs, and generating contracts.
*   **Core Tasks**: Create and publish RFQs, evaluate quotes side-by-side, nominate bids for L1/L2 approval, issue purchase orders, and monitor corresponding invoices.

### 2.3 Vendor / Supplier
*   **Objective**: Participate in open RFQ bids and manage delivery compliance.
*   **Core Tasks**: Review assigned RFQ line items, submit structured financial quotes, track PO awards, and view billing invoices.

### 2.4 Manager / Approver (L1 & L2 Approval Chain)
*   **Objective**: Review proposed quotation awards and approve/reject based on budget limits and performance compliance.
*   **Core Tasks**: Read comparison sheets, add approval remarks, sign off requisitions (L1/L2), and track PO/Invoice statuses.

---

## 3. Module Specifications & Functional Requirements

### 3.1 Authentication & RBAC Module
*   **Access Control**: Enforcement of Role-Based Access Control (RBAC) across Admin, Officer, Vendor, and Approver roles.
*   **Registration**: Public-facing registration for vendors to submit credentials, categories, contact information, and tax identification (GSTIN/PAN).
*   **Session Management**: Secure JSON Web Token (JWT) state management stored in secure HttpOnly cookies.

### 3.2 Dashboard Module
*   **Dynamic Metrics**:
    *   *Procurement Officer*: Active RFQs, Pending Approvals, Monthly PO spend total, Overdue Invoices.
    *   *Vendor*: Assigned bids count, active quotes submitted, POs awarded, pending payment invoices.
    *   *Approver*: Pending reviews inbox count, monthly spend threshold.
*   **Recent Activity Feed**: Shortlist of recently updated POs, invoices, or activity logs.
*   **Visualization**: Inline SVG visualization of spending trends over a sliding 6-month period.

### 3.3 Vendor Directory Module
*   **Search & Filters**: Multi-parameter search by Company Name, GSTIN, and Category. Filtering tabs for `All`, `Active`, `Pending Audit`, and `Blocked`.
*   **Supplier Detail Drawer**: Detailed view displaying tax details, address, contact name, rating, and status controls to block/unblock.

### 3.4 RFQ Creation Module
*   **Three-Step Wizard**:
    1.  *Details*: Title, Category (IT, Furniture, Logistics, Construction, Stationery), Deadline, and descriptions.
    2.  *Line Items*: Multiple line entries tracking Description, Quantity, and Unit type (e.g. NOS, KG, Pack).
    3.  *Assign & Upload*: Assign specific target vendors from the categories, upload attachment specifications, and save as draft or publish immediately.

### 3.5 Vendor Bidding (Quotation) Module
*   **Response Portal**: Vendors can view assigned RFQs, fill in unit pricing per line item, delivery turnaround times, tax/GST percentage (e.g., 18%), payment terms, and submit bid calculations.
*   **Auto-Calculations**: Automatic computation of Subtotal, GST, and Grand Total.

### 3.6 Bid Comparison Module
*   **Comparison Matrix**: Side-by-side alignment of bids displaying Grand Total, GST%, Delivery Days, Vendor Rating, and Payment Terms.
*   **Highlighting**: Automated highlighting of the lowest price in green. Selecting a bid initiates the Approval Workflow state machine.

### 3.7 Multi-Gate Approval Module
*   **Approval Pipeline**: Visual step tracker (`Submitted` → `L1 Review` → `L2 Approval` → `Generate PO`).
*   **Action Drawer**: Managers can review nominated quotation summaries, view remarks history, write custom remarks, and trigger "Approve" or "Reject".

### 3.8 Purchase Order & Invoice Module
*   **PO/Invoice Generation**: Automated generation of document numbers. Displays shipping details, itemized quantities, unit prices, CGST (9%), SGST (9%), grand total, and payment status.
*   **Actions**: "Print Document" styled for media formatting, "Export PDF", "Email Vendor", and "Mark as Paid".

### 3.9 Compliance Audit Log Module
*   **Immutable Trail**: Write-once activity log database. Actions like RFQ creation, quote bids, approvals, PO issuance, and payments are logged chronologically. **No edit or delete endpoints exist for logs.**

### 3.10 Reports & Analytics Module
*   **KPI Breakdown**: Total Spend, Active vendors, PO fulfillment rate, and Overdue bills.
*   **Distribution**: Visual SVG donut chart illustrating category spend distribution (IT, Construction, Furniture).
*   **CSV Exporter**: Raw CSV download of procurement items and financial totals.

---

## 4. Non-Functional Requirements (NFRs)

*   **Security & Encryption**: Mandatory HTTPS, password salting via bcrypt, JWT tokens stored in HttpOnly secure cookies to prevent XSS.
*   **Data Integrity / Immutability**: Activity log database schema constraints to prevent updates (`ON UPDATE RESTRICT`) and deletions (`ON DELETE RESTRICT`).
*   **Performance**: Core dashboard pages should load in under 1.5 seconds. Query indices on critical search keys (`gst_number`, `vendor_code`, `po_number`).
*   **Accessibility & UX**: responsive grids for dashboard layouts, AA compliance color contrast, togglable light/dark interface modes.
