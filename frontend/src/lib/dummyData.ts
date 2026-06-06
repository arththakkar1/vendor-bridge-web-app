export type Role = "Admin" | "Procurement Officer" | "Vendor" | "Manager";

export const DUMMY_USER = {
  id: "u-001",
  name: "Sarah Jenkins",
  email: "sarah.j@vendorbridge.com",
  role: "Admin" as Role,
};

export const MOCK_VENDORS = [
  { id: "v-001", companyName: "TechCorp Electronics", contactName: "Alice Smith", email: "alice@techcorp.com", phone: "+1 234-567-8900", category: "Hardware", status: "Active", rating: 4.8, gstNumber: "22AAAAA0000A1Z5" },
  { id: "v-002", companyName: "OfficeSupplies Inc", contactName: "Bob Jones", email: "bob@officesupplies.com", phone: "+1 987-654-3210", category: "Stationery", status: "Active", rating: 4.2, gstNumber: "27BBBBB0000B1Z6" },
  { id: "v-003", companyName: "CloudNet Services", contactName: "Charlie Brown", email: "charlie@cloudnet.io", phone: "+1 555-123-4567", category: "Software", status: "Inactive", rating: 3.9, gstNumber: "29CCCCC0000C1Z7" },
];

export const MOCK_RFQS = [
  { id: "rfq-001", rfqNumber: "RFQ-2026-001", title: "Q3 Laptop Procurement", description: "Need developer laptops for the engineering team.", quantity: 50, status: "Published", deadline: "2026-07-01", vendorCount: 3, attachments: ["Laptop_Specification.pdf", "Warranty_Requirements.pdf"], assignedVendors: ["TechCorp Electronics", "Dell", "HP"] },
  { id: "rfq-002", rfqNumber: "RFQ-2026-002", title: "Office Chairs", description: "Ergonomic chairs for new wing.", quantity: 120, status: "Draft", deadline: "2026-06-15", vendorCount: 0, attachments: [], assignedVendors: [] },
  { id: "rfq-003", rfqNumber: "RFQ-2026-003", title: "Cloud Hosting Renewal", description: "Annual AWS budget allocation.", quantity: 1, status: "Closed", deadline: "2026-05-30", vendorCount: 2, attachments: ["Current_Usage_Metrics.xlsx"], assignedVendors: ["CloudNet Services", "AWS Direct"] },
];

export const MOCK_QUOTATIONS = [
  { id: "q-001", rfqId: "rfq-001", vendorId: "v-001", amount: 1250000, deliveryTime: "14 days", status: "Under Review" },
  { id: "q-002", rfqId: "rfq-001", vendorId: "v-002", amount: 1300000, deliveryTime: "10 days", status: "Submitted" },
];

export const MOCK_APPROVALS = [
  { id: "app-001", quotationId: "q-001", rfqTitle: "Q3 Laptop Procurement", amount: 1250000, status: "Pending", requestedBy: "Procurement Officer", date: "2026-06-05", timeline: "L1 Approved, L2 Pending", remarks: "Vendor has excellent rating, but price is slightly high." },
];

export const MOCK_PURCHASE_ORDERS = [
  { id: "po-001", poNumber: "PO-2026-8901", vendorId: "v-003", totalAmount: 450000, status: "Issued", date: "2026-05-10" },
];

export const MOCK_INVOICES = [
  { id: "inv-001", invoiceNumber: "INV-2026-992", poId: "po-001", vendorName: "CloudNet Services", totalAmount: 450000, status: "Generated", dueDate: "2026-06-10" },
];

export const MOCK_ACTIVITY_LOGS = [
  { id: "log-006", action: "Invoice Paid", entityType: "Invoice", entityId: "inv-001", performedBy: "Sarah Jenkins", timestamp: "2026-06-06 12:00:00", status: "Success" },
  { id: "log-005", action: "Invoice Generated", entityType: "Invoice", entityId: "inv-001", performedBy: "System", timestamp: "2026-06-06 10:00:00", status: "Success" },
  { id: "log-004", action: "RFQ Notification sent to TechCorp", entityType: "RFQ", entityId: "rfq-001", performedBy: "System", timestamp: "2026-06-06 09:15:00", status: "Success" },
  { id: "log-001", action: "Approved Request for Quotation", entityType: "Approval", entityId: "app-001", performedBy: "Sarah Jenkins", timestamp: "2026-06-06 09:12:00", status: "Success" },
  { id: "log-002", action: "Submitted Quotation", entityType: "Quotation", entityId: "q-002", performedBy: "Alice Smith", timestamp: "2026-06-05 14:30:00", status: "Success" },
  { id: "log-003", action: "Published RFQ", entityType: "RFQ", entityId: "rfq-001", performedBy: "Procurement Officer", timestamp: "2026-06-04 10:15:00", status: "Success" },
];

export const MOCK_USERS = [
  { id: "usr-001", name: "Sarah Jenkins", email: "sarah.j@company.com", role: "Admin", status: "Active" },
  { id: "usr-002", name: "John Davis", email: "john.d@company.com", role: "Procurement Officer", status: "Active" },
  { id: "usr-003", name: "Emily Chen", email: "emily.c@company.com", role: "Manager", status: "Active" },
  { id: "usr-004", name: "Michael Roberts", email: "m.roberts@company.com", role: "Procurement Officer", status: "Inactive" },
];
