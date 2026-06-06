# User Roles & Role-Based Access Control (RBAC)

VendorBridge uses a strict Role-Based Access Control (RBAC) model to ensure data privacy, streamline workflows, and restrict actions based on organizational responsibilities. The system defines four primary user roles:

---

## 1. Procurement Officer
The Procurement Officer acts as the primary operator of the platform, facilitating the actual procurement process from initiation to invoice generation.
- Create RFQs
- Compare quotations
- Generate purchase orders
- Generate invoices

## 2. Vendor (Supplier)
The Vendor is an external third party invited to bid on RFQs. Their view is restricted to their own assigned transactions.
- Submit quotations
- Track RFQ status
- View purchase orders

## 3. Manager / Approver
The Manager (or Requisition Approver) is responsible for financial oversight and governance.
- Approve or reject procurement requests
- Monitor procurement workflows

## 4. Admin
The Admin handles system-level configuration and high-level analytical oversight.
- Manage users
- Manage vendors
- View procurement analytics

---

## Implementation Details

In the frontend prototype, this RBAC model is simulated using a global React Context (`AuthContext`). 
- When a user logs in, their selected role is stored in state.
- The `Sidebar` component dynamically filters its `navItems` array to render *only* the permitted routes based on the active role's exact responsibilities.
- The `Dashboard` (`page.tsx`) conditionally renders different UI components (e.g., metric cards, activity feeds) depending on the user's role.
