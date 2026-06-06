# Deploy & Scale How-to Guide

---

## 1. Hosting Providers Strategy

To deploy the dual-stack architecture of VendorBridge, the recommended setup consists of the following cloud infrastructure:

*   **Frontend**: Next.js client deployed on **Vercel** for automatic build updates, edge routing, and caching.
*   **Backend**: Node.js Express server running on **Render** or **Railway** (configured with containerized resource allocations).
*   **Database**: A managed **PostgreSQL** instance on AWS RDS or Supabase.

---

## 2. Production Environment Configurations

Ensure the following variables are securely set in the production dashboard environments:

### 2.1 Next.js Frontend (Vercel Console)
*   `NEXT_PUBLIC_API_URL`: Fully qualified public URL of the backend service (e.g. `https://api.vendorbridge.com/api/v1`).

### 2.2 Node.js Backend Server (Railway / Render Dashboard)
*   `NODE_ENV`: Set to `production`.
*   `PORT`: Bind to host listener (default `8080`).
*   `DATABASE_URL`: Connection string of PostgreSQL with SSL enabled (`sslmode=require`).
*   `JWT_SECRET`: High-entropy string (e.g. 64-character hex sequence generated via OpenSSL).

---

## 3. Scale and Performance Optimizations

1.  **Connection Pooling**: Configure Prisma or pg-pool limits (`max: 20`) in Node.js server configurations to prevent PostgreSQL connection limit errors.
2.  **Stateless Sessions**: JWT tokens are stateless, avoiding database session checks on authenticated paths.
3.  **Static Page Generation (SSG)**: Statically pre-render landing layouts and dynamic dashboards in Next.js to reduce page render times.
4.  **Database Indexing**: Regularly verify indexing health on queries search columns (`vendors.gst_number`, `purchase_orders.po_number`).
