# VendorBridge ERP Documentation

> [!NOTE]
> This directory is the single source of truth for all technical, architectural, and conceptual documentation for the VendorBridge ERP System. It is structured according to the **Diátaxis documentation framework**, separating docs by explanation, reference, tutorials, and how-to guides.

## Table of Contents

1. [Diátaxis Architecture](#1-diátaxis-architecture)
2. [Directory Structure](#2-directory-structure)
3. [Documentation Map](#3-documentation-map)
4. [Standards & Conventions](#4-standards-conventions)

---

## 1. Diátaxis Architecture

Diátaxis splits technical documents into four distinct quadrants based on the user's current cognitive goal:

| Mode | Purpose | Target Audience | Practical / Theoretical |
|---|---|---|---|
| **Explanation** | Understand system concepts, designs, and decisions | Architects, Product Managers, Leads | Theoretical |
| **Reference** | Look up technical details, schemas, and specs | Developers, Integrators, QA | Theoretical |
| **Tutorial** | Learn how to get started from zero | New Contributors, Onboarding | Practical |
| **How-to Guide** | Complete specific development/operational goals | DevOps, System Admins | Practical |

---

## 2. Directory Structure

```
doc/
├── explanation/                           # Conceptual understanding (the "Why")
│   ├── problem-statement.md               # Core challenges and the VendorBridge solution
│   ├── prd.md                             # Product Requirements Document (Goals, Personas, Scope)
│   ├── system-overview-and-architecture.md  # Technical Requirements Document (TRD, architecture)
│   ├── frontend-architecture.md           # Next.js App Router, Tailwind, Framer Motion routing/tech spec
│   ├── app-flow.md                        # App Flow & User Journeys (sequences, roles)
│   ├── ui-ux-brief.md                     # UI/UX Brief (styling variables, print rules, animations)
│   └── implementation-plan.md             # Phased rollout and integration milestones
│
├── reference/                            # Technical specifications (the "What")
│   ├── backend-schema.md                  # Database entity relationship mapping and PostgreSQL DDL
│   └── api-contracts.md                   # REST Endpoint specifications and schema structures
│
├── tutorials/                            # Getting-started guides (the "How to begin")
│   └── getting-started.md                 # Sandbox setup and mock data seeding guide
│
└── how-to/                               # Goal-oriented guides (the "How to do X")
    └── deploy-and-scale.md                # Multi-host deployments and performance tuning
```

---

## 3. Documentation Map

### 3.1 Explanation Documents
*   [Problem Statement](file:///Users/arththakkar/Documents/vendor-bridge-web-app/doc/explanation/problem-statement.md): Outlines the core pain points of traditional procurement workflows and how VendorBridge addresses them.
*   [Product Requirements Document (PRD)](file:///Users/arththakkar/Documents/vendor-bridge-web-app/doc/explanation/prd.md): Contains the core ERP product vision, user roles, functional scope of all 11 modules, and non-functional requirements.
*   [Technical Requirements Document (TRD)](file:///Users/arththakkar/Documents/vendor-bridge-web-app/doc/explanation/system-overview-and-architecture.md): System architecture design maps, technology choices (Next.js, Tailwind, Framer Motion, Node.js, PostgreSQL), and backend auth/session strategies.
*   [Frontend Architecture](file:///Users/arththakkar/Documents/vendor-bridge-web-app/doc/explanation/frontend-architecture.md): Details the Next.js, Tailwind CSS, Framer Motion, and TanStack Query setup, along with detailed App Router routing structure.
*   [App Flow & User Journeys](file:///Users/arththakkar/Documents/vendor-bridge-web-app/doc/explanation/app-flow.md): Sequence mapping of procurement lifecycle workflows, and navigation layout permissions.
*   [UI/UX Design Brief](file:///Users/arththakkar/Documents/vendor-bridge-web-app/doc/explanation/ui-ux-brief.md): Styling tokens, CSS layout grids, Framer Motion parameters, and document media print formats.
*   [Milestone Implementation Plan](file:///Users/arththakkar/Documents/vendor-bridge-web-app/doc/explanation/implementation-plan.md): Outlines project phases (Setup, Core database, backend API routes, frontend views, and deployment).

### 3.2 Reference Documents
*   [Backend Database Schema](file:///Users/arththakkar/Documents/vendor-bridge-web-app/doc/reference/backend-schema.md): Complete PostgreSQL relational schemas, triggers, indexes, and immutability lock declarations.
*   [API Contracts](file:///Users/arththakkar/Documents/vendor-bridge-web-app/doc/reference/api-contracts.md): Request/response payloads and controller endpoint specifications.

### 3.3 Tutorials & How-To's
*   [Getting Started Tutorial](file:///Users/arththakkar/Documents/vendor-bridge-web-app/doc/tutorials/getting-started.md): Installation, environment variables, local seeding, and dev server startups.
*   [Deployment How-To Guide](file:///Users/arththakkar/Documents/vendor-bridge-web-app/doc/how-to/deploy-and-scale.md): Configuration for cloud deployments (Vercel, Render/Railway, managed PostgreSQL).
