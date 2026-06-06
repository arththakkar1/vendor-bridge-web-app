# Getting Started Tutorial

---

## 1. Local Environment Pre-requisites

Ensure the following runtimes and database servers are locally installed and running:
*   **Node.js**: v18.0.0 or higher.
*   **PostgreSQL**: v15 or higher.
*   **Package Manager**: `npm` or `yarn`.

---

## 2. Installation Steps

### 2.1 Backend Setup
1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install required dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables by creating `.env`:
    ```env
    PORT=5000
    DATABASE_URL="postgresql://user:password@localhost:5432/vendorbridge"
    JWT_SECRET="your-super-secure-secret-key"
    ```
4.  Run database migrations:
    ```bash
    npm run db:migrate
    ```
5.  Seed roles and default accounts:
    ```bash
    npm run db:seed
    ```
6.  Start local development backend server:
    ```bash
    npm run dev
    ```

### 2.2 Frontend Setup
1.  Navigate to the frontend folder:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure variables by creating `.env.local`:
    ```env
    NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
    ```
4.  Launch local Next.js environment:
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) in the browser.

---

## 3. Seed Accounts for Testing

Use the following profiles to test and navigate roles during development:

| Role Name | Test Username | Test Password |
|---|---|---|
| **Procurement Officer** | `officer@vendorbridge.com` | `password123` |
| **Vendor** | `vendor@infra-supplies.com` | `password123` |
| **Manager / Approver** | `manager@vendorbridge.com` | `password123` |
| **Admin** | `admin@vendorbridge.com` | `password123` |
