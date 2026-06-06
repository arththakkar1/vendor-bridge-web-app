# User Roles & Role-Based Access Control (RBAC)

VendorBridge uses a strict Role-Based Access Control (RBAC) model to ensure data privacy, streamline workflows, and restrict actions based on organizational responsibilities. The system defines four primary user roles:

---

## 1. Admin
The **Admin** is the system administrator with full, unrestricted access to the entire platform. This role is responsible for overseeing the entire procurement lifecycle, managing users, and monitoring system health.

### Access Rights
- **Dashboard:** Sees high-level global metrics (Total Vendors, Active RFQs, Pending Approvals, Total Spend).
- **Navigation Access:** 
  - `Dashboard` (`/`)
  - `Vendors` (`/vendors`)
  - `RFQs` (`/rfqs`)
  - `Quotations` (`/quotations`)
  - `Approvals` (`/approvals`)
  - `Purchase Orders` (`/purchase-orders`)
  - `Invoices` (`/invoices`)
  - `Activity Logs` (`/activity-logs`)
- **Key Capabilities:** Can view the immutable activity logs, create/delete any entity, and override approval processes.

---

## 2. Procurement Officer
The **Procurement Officer** acts as the primary operator of the platform. They initiate the procurement process, invite vendors to bid, compare submissions, and facilitate final payments.

### Access Rights
- **Dashboard:** Sees identical global metrics and action items as the Admin.
- **Navigation Access:** Full access to all functional and audit routes, identical to the Admin.
- **Key Capabilities:** 
  - Create and publish new Requests for Quotation (RFQs).
  - Use the "Compare Bids" matrix to nominate a vendor for approval.
  - Issue Payments and email invoices to vendors.
  - Read access to `Activity Logs`.

---

## 3. Manager (Approver)
The **Manager** (or Requisition Approver) is responsible for financial oversight and governance. They do not initiate requests but act as the gatekeeper before a Purchase Order can be legally generated.

### Access Rights
- **Dashboard:** Sees a focused dashboard highlighting the **Pending Approvals** queue to encourage immediate action on bottlenecks.
- **Navigation Access:** 
  - `Dashboard` (`/`)
  - `Approvals` (`/approvals`)
  - `Purchase Orders` (`/purchase-orders`)
  - `Reports` (`/reports-analytics`) *(Planned)*
- **Key Capabilities:**
  - View detailed justification and comparison matrices for nominated bids.
  - Approve or Reject procurement requests, providing mandatory remarks.

---

## 4. Vendor (Supplier)
The **Vendor** is an external third party invited to bid on RFQs. Their view of the system is strictly siloed—they can only see data explicitly assigned or addressed to their company profile.

### Access Rights
- **Dashboard:** Sees an action-oriented "Supplier Portal" highlighting **Assigned RFQs**, **Pending Quotes**, and **Active POs**. They do *not* see internal action items or global metrics.
- **Navigation Access:** 
  - `Dashboard` (`/`)
  - `RFQs` (`/rfqs`)
  - `Quotations` (`/quotations`)
  - `Purchase Orders` (`/purchase-orders`)
  - `Invoices` (`/invoices`)
- **Key Capabilities:**
  - Review RFQ line items and submit Quotations with pricing and delivery terms.
  - Track the status of their submitted bids.
  - Download formal PDF copies of issued Purchase Orders.
  - Track invoice payment statuses.

---

## Implementation Details

In the frontend prototype, this RBAC model is simulated using a global React Context (`AuthContext`). 
- When a user logs in, their selected role is stored in state.
- The `Sidebar` component dynamically filters its `navItems` array to render only the permitted routes based on the active role.
- The `Dashboard` (`page.tsx`) conditionally renders different UI components (e.g., metric cards, activity feeds) depending on the user's role.
