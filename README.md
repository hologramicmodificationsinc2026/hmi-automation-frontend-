
# Hologramic Engine: Secure Multi-Tenant Visual Automation Core

The core architectural backbone for an enterprise-ready, multi-tenant visual workflow automation engine. Built with focus on responsive visual controls, cryptographic runtime security, and structural AI generation pipelines.

---

## ⚡ Core Infrastructure Pillars

### 1. High-Precision Visual Canvas (`WorkflowCanvas.tsx`)
A mouse-optimized, mouse-responsive visual graph interface featuring a premium dark-mode aesthetic with interactive neon accents. 
* **Custom Node Interfaces:** Fully custom implementations for webhook triggers (cyan glow) and script executors (magenta glow).
* **Sliding Inspector Deck:** A state-driven contextual panel that slides into view when a node is clicked, allowing real-time label modification and schema configuration.

### 2. Isolated V8 Memory Sandbox (`jsRunner.ts`)
A secure runtime environment designed to execute untrusted, user-submitted JavaScript transformations safely without threatening the host container.
* **Isolate Micro-Containers:** Leverages raw V8 execution isolates with a strict **8MB memory limit** to thwart resource-exhaustion attacks.
* **Deep-Frozen Payloads:** Injects incoming data safely as a frozen global object.
* **Execution Interceptor:** Implements a strict **2000ms execution timeout** to cleanly terminate infinite loops or hung processes.

### 3. Multi-Tenant Database Topology (`supabase_schema.sql`)
A robust Postgres relational schema structure optimized for absolute tenant segregation in SaaS configurations.
* **Row-Level Security (RLS):** Enforces cryptographic data isolation across organizations, members, and workflows.
* **Tenancy Barriers:** Prevents cross-tenant data leaks; users can strictly interface with assets mapped to their explicit organization ID.

### 4. Structured AI Generation Handler (`magic_build_route.ts`)
The API orchestration layer driving the "Magic Build" generative feature.
* **Schema Enforcement:** Employs a strict JSON schema configuration forcing language models to output predictable canvas nodes, wiring layout definitions, and relative coordinates.

---

## 🛠️ Tech Stack & Dependencies
* **Frontend:** React, TypeScript, Tailwind CSS, `@xyflow/react` (React Flow)
* **Backend:** Next.js App Router (Server Actions / Route Handlers)
* **Database & Security:** Supabase (PostgreSQL), `isolated-vm` (V8 Isolates)

---
Developed by **Hologramic Modifications Inc. © 2026**
