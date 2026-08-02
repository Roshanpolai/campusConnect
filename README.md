# CampusConnect

An all-in-one campus platform for university students, built as a **MERN** app
(MongoDB, Express, React, Node) using **ES Modules** throughout and a clean
**MVC** structure on the backend.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router + Axios + lucide-react icons
- **Backend:** Node.js + Express (ES modules, `"type": "module"`) + MongoDB + Mongoose + JWT auth
- **Architecture:** Model – View (React) – Controller, with routes and middleware as thin, single-purpose layers

## Folder structure

```
campusconnect/
├── server/                  # Express API (MVC)
│   ├── config/                # db.js (Mongo), cloudinary.js
│   ├── models/                # Mongoose schemas (User, Event, Job, Product, Resource, Schedule, ...)
│   ├── controllers/           # Business logic per resource (incl. uploadController, resourceController)
│   ├── routes/                # Express routers (thin, wire controllers + middleware)
│   ├── middleware/            # auth (JWT), role guard, upload (multer), error handler, asyncHandler
│   ├── utils/                 # generateToken.js, sendEmail.js, cloudinaryUpload.js, seed.js
│   ├── server.js              # App entry point
│   └── .env.example
│
└── client/                  # React app
    ├── src/
    │   ├── api/axios.js        # Axios instance with JWT interceptor
    │   ├── context/AuthContext.jsx
    │   ├── routes/              # ProtectedRoute, AdminRoute guards
    │   ├── utils/constants.js   # Departments/years/sections/resource types (single source of truth)
    │   ├── components/
    │   │   ├── layout/          # Sidebar, AdminSidebar, Navbar, DashboardLayout, AdminLayout
    │   │   └── ui/               # Badge, EmptyState, Skeleton, Modal, ImageUploadField, FileUploadField
    │   ├── pages/
    │   │   ├── auth/             # Login, Register, ForgotPassword, ResetPassword
    │   │   ├── student/          # Dashboard, Academic (+ academic/Timetable, Resources, CgpaCalculator),
    │   │   │                     # Events, Jobs, JobDetail, Marketplace, LostFound, TeamFinder,
    │   │   │                     # Feedback, Profile, Settings
    │   │   └── admin/            # AdminDashboard, UserManagement, AcademicManagement
    │   │                         # (+ academic/TimetableManagement, ResourceReview), JobManagement,
    │   │                         # EventManagement, MarketplaceModeration, LostFoundModeration,
    │   │                         # FeedbackManagement, NotificationCompose, AdminSettings
    │   ├── App.jsx               # All routes
    │   └── main.jsx
    └── tailwind.config.js     # Design tokens (purple #6D5EF8, 16px card radius, soft shadows)
```

## Getting started

### 1. Backend

```bash
cd server
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET as needed
npm install
npm run dev               # starts on http://localhost:5000
```

Requires a MongoDB instance — either local (`mongodb://127.0.0.1:27017/campusconnect`)
or a MongoDB Atlas connection string.

### 2. Frontend

```bash
cd client
npm install
npm run dev                # starts on http://localhost:5173
```

Vite is pre-configured to proxy `/api` requests to `http://localhost:5000`, so no
extra `.env` is needed on the client.

### 3. Email format

Registration emails must follow **`<branchcode>.<sicid>@silicon.ac.in`**, e.g.
`ece.23becf33@silicon.ac.in`. On the Register page this is generated for you — pick
your Department (which maps to a branch code: `cse`, `ece`, `mech`, `civil`, `eee`)
and enter your Student ID, and the email field fills in automatically as read-only.
The backend also validates this exact pattern, so a manually-crafted request with a
different email shape will be rejected.

### 4. Getting into the Admin Dashboard (`/admin`) for the first time

There's no "Sign up as admin" option by design — every new registration starts as
`role: "student"`. To get your **first** Super Admin account, run the seed script
from `server/`:

```bash
cd server
ADMIN_EMAIL=ece.23becf33@silicon.ac.in ADMIN_PASSWORD=YourPass123 npm run seed
```

- If that email is already registered, it's promoted to `super_admin` in place.
- If not, a new Super Admin account is created with it.

Then just log in with that email/password — the sidebar and `/admin` route become
available automatically because the UI checks `user.role`.

### 5. Making someone else an admin (after you have one Super Admin)

Once you're logged in as `super_admin`: **Admin → Users**, find the person, and
change their **Role** dropdown (`student` / `job_poster` / `event_coordinator` /
`moderator` / `super_admin`). It saves immediately — no separate "save" button.
That's also how you promote a Job Poster or Event Coordinator so they can create
job posts or events.

## Roles & permissions

| Role                | Can do |
|---------------------|--------|
| `student`            | Everything in the student sidebar: Academic (timetable, notes/PYQ, CGPA calculator), events, jobs, marketplace, lost & found, team finder, feedback, profile |
| `job_poster`          | + create/edit/delete/pin job postings |
| `event_coordinator`   | + create/edit/delete events, view registrations |
| `moderator`           | + moderate marketplace & lost & found, manage feedback, **review Notes/PYQ uploads** |
| `super_admin`         | Full access to every admin page, including user role/status management and publishing timetables |

Route protection is enforced both in the API (`protect` + `authorize(...)` middleware)
and in the React router (`ProtectedRoute`, `AdminRoute`), so the UI and API stay in sync.

## Media & file storage: Cloudinary (images *and* documents)

Everything uploaded in the app — profile photos, event banners, marketplace/lost&found
photos, **and** notes, PYQs, timetable PDFs, resumes — goes to **Cloudinary**. There's
no second storage provider to configure. Two upload endpoints handle it:

- `POST /api/uploads/image?folder=...` → Cloudinary `resource_type: "image"` (jpg, png,
  webp, gif, svg — capped at 8MB)
- `POST /api/uploads/document?folder=...` → Cloudinary `resource_type: "raw"` (PDF, Word,
  PowerPoint, ZIP — capped at 25MB)

**Video is rejected everywhere** — both by the multer file filter and by pinning the
Cloudinary `resource_type`, so it can't be smuggled through regardless of what a client
sends.

Set these in `server/.env` (from your [Cloudinary dashboard](https://cloudinary.com/console)):

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Important:** newer Cloudinary accounts block unsigned delivery of raw PDF/ZIP assets by
default (a security change Cloudinary made in 2023). If timetable/notes PDFs 404 or show
an "access denied" page when opened, go to **Cloudinary Console → Settings → Security**
and enable **"Allow delivery of PDF and ZIP files"**.

Mongo only ever stores the Cloudinary URL + `publicId` + basic metadata (title, uploader,
timestamps) — never the file itself — matching the intended architecture: Cloudinary for
the asset, MongoDB for the pointer.

## Academic module: Timetable, Notes/PYQ, and CGPA Calculator

The old slot-by-slot timetable builder is gone — it's now just a PDF, matching how most
colleges actually publish timetables. Everything lives under **Academic** in the student
sidebar (**Admin → Academic** for admins), with three parts:

### 1. Timetable (PDF, per department + year + section)

As `super_admin`, go to **Admin → Academic → Timetable**:

1. Pick **Department**, **Year**, and **Section**.
2. Upload the timetable PDF you already have from your college (no re-typing schedules).
3. Click **Publish Timetable**.

Every student in that exact department/year/section sees it immediately under
**Academic → Timetable**, with an inline preview and a download button. Re-publishing for
the same group replaces the old PDF (the previous Cloudinary file is deleted automatically
to avoid orphaned files).

### 2. Notes, PYQs & Academic Resources — with moderation

Students upload from **Academic → Notes & PYQ → Upload**: pick a type (**Notes**, **PYQ**,
or **Academic Resource**), subject, and attach a file. It's saved as `status: "pending"`
and is **not visible to anyone else yet** — the student can track it under the **My
Uploads** tab, which shows Pending / Approved / Rejected (with a reason, if rejected).

A `moderator` or `super_admin` reviews the queue at **Admin → Academic → Notes & PYQ
Review** and approves or rejects each upload. Only once approved does it appear in the
**Browse** tab for other students in that department/year to find and download.

### 3. CGPA Calculator

A self-contained, no-login-required-elsewhere calculator at **Academic → CGPA
Calculator**: add courses with credits + grade (standard 10-point scale: O=10, A+=9, A=8,
B+=7, B=6, C=5, P=4, F=0), get your semester SGPA, then save each semester to build up a
credit-weighted overall CGPA. This is entirely client-side — saved semesters live in the
browser's `localStorage`, not on the server.

## Dark mode

The moon/sun icon in the top navbar toggles it, and the choice is now saved to
`localStorage` so it persists across reloads (it also respects your OS's dark-mode
preference on first visit). Under the hood, the light/dark palettes are CSS
variables (`--surface`, `--ink-900`, etc. in `client/src/index.css`) that Tailwind's
`surface-*` and `ink-*` classes read from — so this is also the place to tweak the
color values, or the `.dark { ... }` block specifically.

## Password reset emails

By default, `POST /api/auth/forgot-password` doesn't have an SMTP server
configured, so no real email gets sent — but the flow still works: the reset link
is logged to the **server console**, and returned as `devResetToken` in the API
response (the Forgot Password page shows a clickable dev link in that case, so you
can test the flow without setting up email).

To send real emails, set these in `server/.env` (Gmail example — use an
[App Password](https://myaccount.google.com/apppasswords), not your normal Gmail
password):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your16charapppassword
SMTP_FROM="CampusConnect <you@gmail.com>"
```

Restart the server after changing `.env` — `utils/sendEmail.js` picks these up and
starts actually sending. Any other SMTP provider (SendGrid, Mailgun, your college's
mail server, etc.) works the same way — just point `SMTP_HOST`/`SMTP_PORT` at it.

## Notes & next steps

- **Email delivery** for password reset falls back to a dev token/console log until
  SMTP is configured (see above) — that's expected, not a bug.
- **File uploads** (avatars, event/marketplace/lost&found photos, job logos, notes/PYQs,
  timetables, resumes) are fully wired to Cloudinary via `ImageUploadField` /
  `FileUploadField` — nothing left to swap in.
- The MVC pattern used for Jobs/Events/Marketplace/Resources/etc. is consistent across
  every resource, so adding a new module (model → controller → routes → page) follows
  the same recipe throughout the codebase.
- **Resource downloads outside your college's `@silicon.ac.in` domain**: since every
  Cloudinary URL is stored directly and permanently in Mongo, anyone with the link can
  view it, even signed out — that matches "public Cloudinary bucket" behavior. If you
  need download links to expire or be gated by login, that would mean switching to
  Cloudinary's [signed URLs](https://cloudinary.com/documentation/signed_uploads) — a
  reasonable next step, not implemented here to keep things simple.
