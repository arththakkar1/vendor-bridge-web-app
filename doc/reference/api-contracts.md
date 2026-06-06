# API Contracts Specification

---

## 1. Authentication Router

### 1.1 `POST /api/v1/auth/register`
Creates a user account profile.

*   **Request Payload**:
    ```json
    {
      "name": "Jane Doe",
      "email": "jane@vendorbridge.com",
      "password": "secure_password",
      "role": "officer",
      "phone": "+919876543210",
      "country": "India"
    }
    ```
*   **Response Payload (Status: 201 Created)**:
    ```json
    {
      "success": true,
      "user": {
        "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "name": "Jane Doe",
        "email": "jane@vendorbridge.com",
        "role": "officer"
      }
    }
    ```

### 1.2 `POST /api/v1/auth/login`
Authenticates credentials, returning the user role, and sets cookie.

*   **Request Payload**:
    ```json
    {
      "email": "jane@vendorbridge.com",
      "password": "secure_password"
    }
    ```
*   **Response Payload (Status: 200 OK)**:
    ```json
    {
      "success": true,
      "user": {
        "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        "name": "Jane Doe",
        "role": "officer"
      }
    }
    ```

---

## 2. Supplier (Vendor) Router

### 2.1 `GET /api/v1/vendors`
Fetches paginated, categorizable, and filterable vendor list.

*   **Parameters**:
    *   `page` (int, default: `1`)
    *   `search` (string)
    *   `status` (Active, Pending, Blocked)
    *   `category` (IT, Furniture, etc.)
*   **Response Payload (Status: 200 OK)**:
    ```json
    {
      "vendors": [
        {
          "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
          "vendor_code": "VND-001",
          "company_name": "Infra Supplies Pvt Ltd",
          "gst_number": "24AAACG1234F1Z0",
          "category": "Furniture",
          "status": "Active"
        }
      ],
      "total": 28,
      "pages": 3
    }
    ```

### 2.2 `POST /api/v1/vendors`
Creates a new supplier profile.

*   **Request Payload**:
    ```json
    {
      "company_name": "TechCore Ltd",
      "contact_name": "John Smith",
      "email": "john@techcore.com",
      "phone": "+919988776655",
      "gst_number": "24AABCI7890D1Z2",
      "address": "456 IT Lane, Surat",
      "category": "IT"
    }
    ```
*   **Response Payload (Status: 201 Created)**:
    ```json
    {
      "success": true,
      "vendor": {
        "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
        "vendor_code": "VND-002",
        "company_name": "TechCore Ltd"
      }
    }
    ```
