# Database Schema & Entity Relationships

---

## 1. Schema Entity Relationship Mapping

The database layer utilizes a structured relational PostgreSQL database. Below is the detailed table definitions, relationships, indexes, and triggers.

```
+------------+        +------------+
|   roles    |        |   users    |
+------------+        +------------+
| id (PK)    |<-------| id (PK)    |
| role_name  |        | email      |
+------------+        | password   |
                      | role_id(FK)|
                      +------------+

+-------------+        +-------------+        +-------------+
|   vendors   |        | rfq_vendors |        |    rfqs     |
+-------------+        +-------------+        +-------------+
| id (PK)     |<-------| id (PK)     |------->| id (PK)     |
| vendor_code |        | rfq_id (FK) |        | rfq_number  |
| company_name|        | vendor_id   |        | title       |
| status      |        +-------------+        | deadline    |
+-------------+                               | status      |
       ^                                      +-------------+
       |                                             ^
       |              +------------------+           |
       +--------------|    quotations    |-----------+
                      +------------------+
                      | id (PK)          |
                      | quotation_number |
                      | rfq_id (FK)      |
                      | vendor_id (FK)   |
                      | amount           |
                      | status           |
                      +------------------+
                               ^
                               |
                      +------------------+
                      |    approvals     |
                      +------------------+
                      | id (PK)          |
                      | quotation_id(FK) |
                      | status           |
                      +------------------+
                               ^
                               |
                      +------------------+
                      | purchase_orders  |
                      +------------------+
                      | id (PK)          |
                      | quotation_id(FK) |
                      | po_number        |
                      | status           |
                      +------------------+
                               ^
                               |
                      +------------------+
                      |     invoices     |
                      +------------------+
                      | id (PK)          |
                      | po_id (FK)       |
                      | invoice_number   |
                      | status           |
                      +------------------+
```

---

## 2. Table Schemas DDL

### 2.1 Role Table (`roles`)
```sql
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);
```

### 2.2 User Table (`users`)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
```

### 2.3 Supplier Table (`vendors`)
```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_code VARCHAR(30) NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    gst_number VARCHAR(15) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Active', 'Pending', 'Blocked')),
    rating DECIMAL(2, 1) DEFAULT 0.0,
    address TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_vendors_gst ON vendors(gst_number);
```

### 2.4 RFQ Table (`rfqs`)
```sql
CREATE TABLE rfqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_number VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    deadline DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Closed', 'Cancelled')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.5 RFQ Assign Table (`rfq_vendors`)
```sql
CREATE TABLE rfq_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    UNIQUE(rfq_id, vendor_id)
);
```

### 2.6 Quotation Table (`quotations`)
```sql
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number VARCHAR(30) NOT NULL UNIQUE,
    rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    delivery_time INT NOT NULL, -- in days
    remarks TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'Accepted', 'Rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_quotations_rfq ON quotations(rfq_id);
```

### 2.7 Approval Table (`approvals`)
```sql
CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    remarks TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.8 Purchase Order Table (`purchase_orders`)
```sql
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(30) NOT NULL UNIQUE,
    quotation_id UUID REFERENCES quotations(id) ON DELETE RESTRICT,
    vendor_id UUID REFERENCES vendors(id) ON DELETE RESTRICT,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Issued' CHECK (status IN ('Draft', 'Issued', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.9 Invoice Table (`invoices`)
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    po_id UUID REFERENCES purchase_orders(id) ON DELETE RESTRICT,
    tax_amount NUMERIC(12, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Generated' CHECK (status IN ('Draft', 'Generated', 'Sent', 'Paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2.10 Compliance Activity Log Table (`activity_logs`)
```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL,
    details TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Immutability Enforcements (Trigger Constraints)

To satisfy security audit compliance standards, the `activity_logs` table must be write-once. The following trigger function strictly blocks updates or deletions:

```sql
CREATE OR REPLACE FUNCTION block_activity_log_modifications() 
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Database Violation: Table activity_logs is immutable. Updates or deletions are forbidden.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_immutable_audit_logs
BEFORE UPDATE OR DELETE ON activity_logs
FOR EACH ROW EXECUTE FUNCTION block_activity_log_modifications();
```
