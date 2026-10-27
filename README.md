# 🦋 Koza — Multi-Tenant Task Management Platform

> *"Ideas and tasks mature in Koza."*

**Koza** is a modern, multi-tenant task and project management platform inspired by the design language of Trello. Built with a robust full-stack architecture, it enables organizations to manage workspaces, projects, and tasks with granular isolation and real-time auditability.

---

## 🚀 Key Features

- **🏢 Multi-Tenancy Architecture:** Strict company-level data isolation. Each organization operates in its own isolated workspace scope.
- **📋 Kanban Board:** Dynamic board stages (Backlog, In Progress, Review, Done) with smooth task movement, priority badges, and visual tags.
- **⏱️ Live Activity Logs (Audit Trail):** Automatic real-time activity logging for assignee updates, priority shifts, stage transitions, and task creations.
- **✅ Task Checklists & Progress:** Sub-task management with interactive progress bars, due-date tracking, and urgency tagging.
- **📦 Project Archiving:** Soft-archiving workflow to freeze completed projects in read-only mode with restore capability.
- **🔐 Secure Authentication:** Stateless JWT authentication paired with bcrypt password hashing.
- **🐳 Zero-Config Dockerization:** One-command setup running PostgreSQL 16, Node.js API (auto-migrated and seeded), and React Frontend in isolated containers via Docker Compose.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Custom Pure CSS (Atlassian/Trello Design), Axios, Context API |
| **Backend** | Node.js, Express.js, express-validator, node-pg-migrate |
| **Database** | PostgreSQL 16 (Relational Schema, Transactions, Foreign Keys) |
| **DevOps & Tooling** | Docker, Docker Compose |

---

## ⚡ Quick Start with Docker

You can run the entire ecosystem locally with a single command:

```bash
# Clone the repository
git clone https://github.com/Mohamadhaboush/koza-task-management.git
cd koza-task-management

# Build and start all services
docker compose up --build
```

The database migrations and initial demo data will be applied automatically on first launch!

### Access URLs:
- 🖥️ **Frontend (UI):** [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend API:** [http://localhost:3000](http://localhost:3000)
- 🗄️ **PostgreSQL:** `localhost:5433`

### 🔑 Pre-seeded Demo Credentials:
- **Company Slug:** `koza`
- **Email:** `admin@koza.com`
- **Password:** `Admin123!`

*(You can also register a brand new organization directly from the login page).*

---

## 👨‍💻 Author

- **Muhammed Nur Habbuş** — [GitHub](https://github.com/Mohamadhaboush)
