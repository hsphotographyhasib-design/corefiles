# CoreFiles

> Self-hosted Enterprise Document Management System (EDMS) & secure private cloud storage platform.

**Company:** Hasanur Jaya Sdn. Bhd.
**Domain:** https://corefiles.hasanurjaya.com

CoreFiles is an enterprise-grade, scalable, secure document management platform designed for engineering teams. It provides file storage, version control, role-based access control, approval workflows, audit logging, and server monitoring — all deployable on a single Ubuntu server.

---

## ✨ Features

### Modules

- **Dashboard** — Storage usage, active users, uploads/downloads, CPU/RAM/Disk metrics, service status, network charts, real-time activity feed
- **Authentication** — JWT + refresh tokens, optional 2FA, session tracking
- **File Manager** — Folder tree, grid/list views, chunked resumable uploads, drag & drop, bulk actions, file preview (PDF/Word/Excel/PowerPoint/Image/Video/Audio/Text/DWG), version history, comments, tags, QR codes, watermarks, file locking, approval workflows
- **Folder Manager** — Hierarchical company structure mirroring org chart
- **File Sharing** — Signed URLs, expiry, password protection, view/comment/edit/download permissions
- **Version Control** — Full revision history with checksums (SHA-256) and restore
- **Favorites, Recent Files, Recycle Bin** — Quick access and recovery
- **Global Search** — Cross-department search with filters (type, owner, date, tags, status, size)
- **Notifications** — Real-time alerts for uploads, shares, approvals, security events
- **Audit Logs** — Immutable, append-only log of all administrative actions (7-year retention)
- **Login Logs** — IP, browser, OS, device, country, success/failed attempts
- **File Activity Logs** — Every file operation recorded with old/new values
- **Reports** — File type distribution, activity trends, storage growth, top accessed files
- **Admin Panel** — User management, role management, storage & quota control, backups, API keys, security policies, file approvals
- **Settings** — Profile, security (2FA, sessions), appearance (light/dark/system), storage, system info
- **Server Monitoring** — Live CPU/RAM/Disk/Network metrics, Docker service status, Prometheus/Grafana integration

### Roles & Permissions

7 configurable roles with 14 granular permissions:

| Role | Description |
|------|-------------|
| Super Admin | Full unrestricted access |
| Admin | Manage users, roles, storage, settings |
| Manager | Department oversight, approval workflows |
| Department Head | Manage own department, approve submissions |
| Employee | Standard upload/download/share access |
| Read Only | View & download shared files |
| Guest | Limited external access |

### Folder Structure

```
Company
├── Administration
│   ├── Policies
│   └── Company Contracts
├── HR
│   ├── Employee Records
│   └── Leave Applications
├── Finance
│   ├── Invoices
│   └── Reports
├── Projects
│   ├── Drawings
│   ├── Tender
│   ├── Photos
│   └── Videos
├── Electrical
├── Mechanical
├── HVAC
├── Plumbing
├── Civil
├── Architecture
├── Contracts
├── Procurement
└── Archive
```

---

## 🎨 Design

- **Brand color:** Green (`#10b981` — Hasanur Jaya brand)
- **Typography:** Poppins (300–800) + JetBrains Mono
- **Style:** Glassmorphism, floating navigation, rounded cards, soft shadows, premium animations
- **Themes:** Light, Dark, System
- **Accessibility:** WCAG AA compliant, semantic HTML, ARIA labels, keyboard shortcuts
- **Responsive:** Mobile-first, works on 375px → 4K

---

## 🛠 Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui (New York style)
- Framer Motion
- TanStack Query
- React Hook Form + Zod
- Zustand
- Recharts
- next-themes

### Backend (planned)
- Node.js LTS
- NestJS
- Prisma ORM
- BullMQ
- Redis

### Database (planned)
- PostgreSQL 16

### Storage (planned)
- MinIO (S3-compatible)

### Auth (planned)
- JWT + Refresh Tokens
- RBAC
- Optional 2FA (TOTP)

### Infrastructure (planned)
- Ubuntu Server
- Docker + Docker Compose
- Nginx reverse proxy
- Let's Encrypt SSL
- GitHub Actions CI/CD

### Monitoring (planned)
- Prometheus
- Grafana
- Uptime Kuma
- Node Exporter

### Security (planned)
- Helmet
- Rate limiting
- File encryption (AES-256 at rest)
- Signed download URLs
- ClamAV virus scanning
- CSRF / XSS / SQL injection protection
- Content Security Policy

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- npm / pnpm / bun

### Installation

```bash
# Clone the repository
git clone git@github.com:hsphotographyhasib-design/corefiles.git
cd corefiles

# Install dependencies
bun install
# or: npm install / pnpm install

# Start the development server
bun run dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Demo Login

The sandbox preview uses mock authentication:

- **Email:** `hasan@hasanurjaya.com`
- **Password:** `CoreFiles2026!`
- **2FA OTP:** any 6 digits (demo mode)

### Database

This project uses Prisma ORM. To set up the database:

```bash
# Push schema to SQLite (sandbox default)
bun run db:push

# Generate Prisma client
bun run db:generate

# Run migrations
bun run db:migrate
```

---

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server on port 3000 |
| `bun run build` | Build production bundle |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run database migrations |
| `bun run db:reset` | Reset database (destructive!) |

---

## 📁 Project Structure

```
corefiles/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (Poppins font, theme provider)
│   │   ├── page.tsx                  # Entry — renders AppShell
│   │   └── globals.css               # Tailwind + CoreFiles design system
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives
│   │   └── corefiles/
│   │       ├── app-shell.tsx         # Main app shell with view routing
│   │       ├── data/
│   │       │   └── mock.ts            # Mock data layer (PostgreSQL equivalent)
│   │       ├── shell/
│   │       │   ├── sidebar.tsx        # Floating glass navigation
│   │       │   ├── topbar.tsx        # Search + notifications + profile
│   │       │   ├── quick-find.tsx    # ⌘K command palette
│   │       │   └── upload-modal.tsx  # Chunked upload modal
│   │       ├── views/                # All 17 module views
│   │       │   ├── dashboard.tsx
│   │       │   ├── files.tsx
│   │       │   ├── users.tsx
│   │       │   ├── roles.tsx
│   │       │   ├── departments.tsx
│   │       │   ├── logs.tsx           # Audit + Login + Activity
│   │       │   ├── notifications.tsx
│   │       │   ├── reports.tsx
│   │       │   ├── admin.tsx
│   │       │   ├── monitoring.tsx
│   │       │   ├── settings.tsx
│   │       │   ├── collections.tsx    # Favorites + Recent + Trash + Search
│   │       │   └── login.tsx
│   │       ├── common/
│   │       │   ├── avatar.tsx
│   │       │   ├── icon.tsx
│   │       │   └── toast-bridge.tsx
│   │       └── theme-provider.tsx
│   ├── lib/
│   │   ├── utils.ts                  # shadcn utilities
│   │   ├── db.ts                     # Prisma client
│   │   └── corefiles/
│   │       └── store.ts              # Zustand store
│   └── hooks/                        # React hooks
├── prisma/
│   └── schema.prisma                 # Prisma schema
├── public/                           # Static assets
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open Quick Find (command palette) |
| `⌘U` / `Ctrl+U` | Open Quick Upload modal |
| `↑` / `↓` | Navigate Quick Find results |
| `↵` | Select Quick Find result |
| `ESC` | Close any modal/dialog |

---

## 🔐 Security Features

- JWT + Refresh Token authentication
- AES-256 file encryption at rest (MinIO SSE)
- Signed download URLs (5-minute expiry)
- ClamAV virus scanning on upload
- Rate limiting (100 requests/min)
- CSRF protection
- XSS protection
- SQL injection prevention (Prisma parameterized queries)
- Content Security Policy (CSP)
- Helmet security headers
- Password hashing (bcrypt)
- Optional 2FA (TOTP)
- Session timeout (configurable, default 30 min)
- IP allowlist (configurable)
- Watermark on download
- Immutable audit logs (WORM storage)

---

## 🐳 Docker Deployment (planned)

The production deployment uses Docker Compose with the following services:

- `frontend` — Next.js production build
- `backend` — NestJS API
- `postgres` — PostgreSQL 16
- `redis` — Redis 7
- `minio` — MinIO S3 storage
- `nginx` — Reverse proxy + TLS
- `clamav` — Virus scanner
- `watchtower` — Auto-update containers
- `prometheus` — Metrics
- `grafana` — Dashboards
- `uptime-kuma` — External monitoring

---

## 📊 Monitoring

- **Prometheus** — Metrics collection (15s scrape interval)
- **Grafana** — Pre-built dashboards (system, app, DB, Redis, MinIO)
- **Uptime Kuma** — External uptime monitoring
- **Node Exporter** — Host metrics
- **Docker Monitoring** — Container stats

---

## 💾 Backup Strategy

- **Daily** — Automatic at 03:00 SGT
- **Weekly** — Sundays at 03:00 SGT
- **Retention** — 30 days
- **Verification** — SHA-256 checksum + restore test
- **Restore** — One-click from Admin Panel

---

## 🤝 Contributing

This is a private repository for Hasanur Jaya Sdn. Bhd. Internal contributions only.

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit your changes: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Open a pull request

---

## 📝 License

Proprietary — © 2026 Hasanur Jaya Sdn. Bhd. All rights reserved.

---

## 📞 Support

- **Domain:** https://corefiles.hasanurjaya.com
- **Email:** hasan@hasanurjaya.com

---

**Built with ❤️ for engineering teams who take their documents seriously.**
