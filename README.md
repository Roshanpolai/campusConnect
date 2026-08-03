# CampusConnect

> An all-in-one campus platform for students, coordinators, moderators, and administrators.

CampusConnect is a full-stack **MERN** application designed to centralize common campus workflows in a single platform. It combines academic resources, timetable distribution, events, jobs and internships, marketplace listings, lost & found, team discovery, feedback, notifications, and profile management with role-based administration.

The application uses **React + Vite** on the client, **Node.js + Express** for the REST API, **MongoDB + Mongoose** for persistence, and **Cloudinary** for image and document storage. The backend follows an MVC-oriented structure with dedicated routes, middleware, controllers, and models.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [System Design](#system-design)
- [Core Data Flow](#core-data-flow)
- [Roles and Authorization](#roles-and-authorization)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [File Storage](#file-storage)
- [Academic Module](#academic-module)
- [Authentication and Password Reset](#authentication-and-password-reset)
- [Security](#security)
- [Production Deployment](#production-deployment)
- [Future Improvements](#future-improvements)

---

## Features

### Student

- Secure registration and authentication using institutional email addresses
- Personalized dashboard
- Department/year/section-specific timetable
- Notes, PYQs, and academic resource sharing
- Academic resource moderation workflow
- SGPA/CGPA calculator
- Campus events
- Jobs and internship opportunities
- Student marketplace
- Lost & found
- Team finder
- Feedback
- Notifications
- Profile, resume, skills, achievements, and social links
- Dark/light theme

### Administration

- User and role management
- User status management
- Timetable publishing by department, year, and section
- Notes/PYQ moderation
- Event management
- Job management
- Marketplace moderation
- Lost & found moderation
- Feedback management
- Notification publishing
- Administrative settings

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite |
| Styling | Tailwind CSS |
| Routing | React Router |
| HTTP Client | Axios |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT |
| Password Security | bcrypt |
| File Upload | Multer |
| Media Storage | Cloudinary |
| Email | SMTP |
| Architecture | REST API + MVC-oriented backend |

The application uses ES Modules throughout the backend.

---

# System Architecture

CampusConnect follows a client-server architecture.

````
┌──────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                │
│                     React 18 + Vite + Tailwind CSS                       │
│                                                                          │
│  [Auth]      [Dashboard]     [Academic]      [Events]     [Jobs]         │
│  [Market]    [Lost&Found]    [Teams]         [Profile]    [Admin]        │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     │ HTTPS / REST (Axios)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            APPLICATION LAYER                             │
│                         Node.js + Express REST API                       │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐   │
│   │ Routing & Middleware Layer                                       │   │
│   │  └─ JWT Auth  ·  RBAC Access  ·  Express Validator / Zod         │   │
│   └────────────────────────────────┬─────────────────────────────────┘   │
│                                    │                                     │
│   ┌────────────────────────────────▼─────────────────────────────────┐   │
│   │ Controller Business Logic                                        │   │
│   └──────┬─────────────────────────┬─────────────────────────┬───────┘   │
└──────────┼─────────────────────────┼─────────────────────────┼───────────┘
           │                         │                         │
           │ Mongoose ORM            │ SDK Uploads             │ Nodemailer
           ▼                         ▼                         ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│       MongoDB        │  ┌       Cloudinary     │  │     SMTP Server      │
│      (Database)      │  │    (Media Assets)    │  │      (Emails)        │
├──────────────────────┤  ├──────────────────────┤  ├──────────────────────┤
│ • Users              │  │ • Profile & Events   │  │ • Password Resets    │
│ • Schedules & Events │  │ • Marketplace & Items│  │ • Event Reminders    │
│ • Jobs & Products    │  │ • Timetables & Notes │  │ • Verification Codes │
│ • Resources & Teams  │  │ • Resumes / Documents│  │                      │
│ • Notifications      │  │                      │  │                      │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
````

### Architecture Principles

**Separation of concerns** — React handles presentation and client interaction, Express exposes APIs, controllers contain application logic, Mongoose models manage persistence, and middleware handles cross-cutting concerns.

**Thin routes** — API routes primarily connect middleware to controllers instead of containing business logic.

**Centralized persistence** — MongoDB stores application data and file metadata.

**External object storage** — uploaded binary assets are stored in Cloudinary rather than MongoDB. MongoDB keeps the file URL, Cloudinary public ID, metadata, ownership, and timestamps.

**Role-based access control** — protected backend endpoints validate authentication and authorization independently of frontend route guards.

---

# System Design

## High-Level Component Design

```text
User
 │
 ▼
React UI
 │
 ├── AuthContext
 ├── ProtectedRoute
 ├── AdminRoute
 └── Axios API Client
        │
        ▼
Express REST API
        │
        ├── Auth Middleware
        ├── Role Middleware
        ├── Upload Middleware
        ├── Error Middleware
        │
        ▼
Controllers
        │
        ├───────────────┬──────────────────┐
        ▼               ▼                  ▼
   Mongoose          Cloudinary           SMTP
        │
        ▼
     MongoDB
```

## Request Lifecycle

A typical authenticated request follows this flow:

```text
Browser
   ↓
React Component
   ↓
Axios
   ↓
Express Route
   ↓
JWT Authentication Middleware
   ↓
Role/Permission Check (when required)
   ↓
Controller
   ↓
Mongoose Model
   ↓
MongoDB
   ↓
JSON Response
   ↓
React State
   ↓
Updated UI
```

## Authentication Flow

```text
Registration
    ↓
Validate institutional email
    ↓
Hash password
    ↓
Store user in MongoDB
    ↓
Login
    ↓
Verify credentials
    ↓
Issue authentication token
    ↓
Protected API requests
    ↓
Authentication middleware
    ↓
req.user
```

Registration uses the institutional pattern:

```text
<branchcode>.<sicid>@silicon.ac.in
```

The client derives the address from the selected department and Student ID, while the backend independently validates the format.

## Timetable Distribution Design

```text
Super Admin
    ↓
Select Department + Year + Section
    ↓
Upload timetable PDF
    ↓
Cloudinary
    ↓
URL + publicId stored in MongoDB
    ↓
Student requests /api/schedule
    ↓
Backend reads student's Department + Year + Section
    ↓
Matching Schedule document
    ↓
Student sees timetable
```

A timetable is unique to a department/year/section group. Re-publishing for the same group replaces the previous timetable and removes the previous Cloudinary asset.

## Academic Resource Moderation

```text
Student uploads Notes / PYQ / Resource
                ↓
          status = pending
                ↓
      Moderator / Super Admin
                ↓
          Review submission
             ↙      ↘
        Approve     Reject
           ↓           ↓
       Browse       My Uploads
       visible      + reason
```

Pending submissions are not exposed to other students until approved.

## File Upload Design

```text
Client
   ↓
Multer validation
   ↓
Upload Controller
   ↓
Cloudinary
   ↓
Secure asset URL + publicId
   ↓
MongoDB metadata
```

The current design separates image and document uploads:

```text
POST /api/uploads/image
POST /api/uploads/document
```

Images are stored as Cloudinary image resources; documents such as PDF, Word, PowerPoint, and ZIP files use raw resources.

---

# Core Data Flow

## MongoDB

MongoDB acts as the primary application database.

Representative collections include:

```text
users
schedules
events
jobs
products
resources
notifications
feedback
lostfound
```

Uploaded files themselves are not stored in MongoDB.

For an uploaded asset, a document typically stores metadata such as:

```text
fileUrl
cloudinaryPublicId
fileName
fileSize
uploadedBy
createdAt
updatedAt
```

This keeps the database focused on structured application data while Cloudinary handles binary asset delivery.

---

# Roles and Authorization

CampusConnect uses role-based access control.

| Role | Primary Permissions |
| --- | --- |
| `student` | Student-facing campus features |
| `job_poster` | Student features + manage job postings |
| `event_coordinator` | Student features + manage events |
| `moderator` | Moderation, feedback management, academic resource review |
| `super_admin` | Full administrative access |

The source project defines these responsibilities in more detail.

Authorization should always be enforced by the API. Frontend route guards improve UX but are not treated as a security boundary.

---

# Project Structure

```text
campusconnect/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   └── admin/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── tailwind.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── README.md
```

The detailed source structure includes dedicated student/admin pages, reusable UI components, API configuration, route guards, backend controllers, middleware, models, and upload utilities.

---

# Getting Started

## Prerequisites

Install:

- Node.js
- npm
- MongoDB locally or MongoDB Atlas
- Cloudinary account
- SMTP credentials if real password-reset emails are required

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd campusconnect
```

## 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` from `.env.example` and configure the required variables.

Start the development server:

```bash
npm run dev
```

Default development URL:

```text
http://localhost:5000
```

The original project supports either a local MongoDB instance or MongoDB Atlas.

## 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Default Vite URL:

```text
http://localhost:5173
```

The current development configuration proxies `/api` requests to the backend.

---

# Environment Variables

Never commit real credentials.

Create:

```text
server/.env
```

A production-oriented example:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=replace_with_a_long_random_secret

CLIENT_URL=http://localhost:5173
ALLOWED_EMAIL_DOMAIN=silicon.ac.in

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

ADMIN_EMAIL=your_admin_email
ADMIN_PASSWORD=your_admin_password
ADMIN_NAME=your_admin_name
ADMIN_STUDENT_ID=your_student_id
ADMIN_DEPARTMENT=your_department
ADMIN_YEAR=your_year
ADMIN_SECTION=your_section

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
SMTP_FROM="CampusConnect <your_email>"
```

Keep `.env` out of version control:

```gitignore
.env
.env.local
.env.production
```

Do not place secrets in Vite variables. Variables prefixed with `VITE_` are bundled into client-side code.

---

# Initial Super Admin

Public registration does not create administrator accounts. New registrations start as students.

Configure the admin variables in `.env`, then run:

```bash
cd server
npm run seed
```

The seed flow promotes an existing matching account to `super_admin` or creates the initial account when one does not already exist.

Do not hard-code production administrator credentials in source code.

---

# File Storage

CampusConnect uses Cloudinary for both images and documents.

### Images

Examples:

- avatars
- event banners
- marketplace products
- lost & found images

### Documents

Examples:

- timetable PDFs
- Notes/PYQs
- academic resources
- resumes

Configure:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

For Cloudinary accounts that restrict PDF/ZIP delivery, the corresponding delivery setting may need to be enabled before raw documents can be opened.

---

# Academic Module

## Timetable

Administrators publish timetable PDFs for an exact:

```text
Department + Year + Section
```

Students retrieve the timetable associated with their own academic profile.

## Notes and PYQs

Students can submit:

- Notes
- Previous Year Questions (PYQs)
- Academic resources

Uploads enter a moderation workflow before becoming publicly browsable to the intended student audience.

## CGPA Calculator

The CGPA calculator operates client-side. Semester information is stored in browser `localStorage` rather than MongoDB.

---

# Authentication and Password Reset

CampusConnect supports:

```text
Register
Login
Protected Routes
Role Authorization
Forgot Password
Reset Password
Logout
```

For real password-reset emails, configure SMTP:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
SMTP_FROM="CampusConnect <your_email>"
```

The project supports development fallback behavior when SMTP is not configured.

For production, reset tokens should never be returned in API responses or printed to public application logs.

---

# Security

The application design includes:

- Password hashing
- JWT authentication
- Protected API routes
- Role-based authorization
- Institutional email validation
- File-type and upload-size restrictions
- Server-side authorization
- Centralized error handling
- Separation of secrets through environment variables

Recommended production hardening:

- HTTPS only
- Strong production JWT secret
- Rate limiting for authentication endpoints
- Security headers
- Strict CORS configuration
- Request-size limits
- Backend input validation
- Sanitized error responses
- Production-safe logging
- Expiring/signed private document URLs where stronger document access control is required

The current project stores permanent Cloudinary URLs, meaning possession of a direct URL may allow access outside the application. Signed/expiring URLs are a future option if documents need stronger access control.

---

# Production Deployment

A typical deployment topology is:

```text
                         Internet
                            │
                  ┌─────────▼─────────┐
                  │ React Frontend    │
                  │ Static Hosting    │
                  └─────────┬─────────┘
                            │ HTTPS
                            ▼
                  ┌───────────────────┐
                  │ Express API       │
                  │ Node.js Hosting   │
                  └──────┬─────┬──────┘
                         │     │
              ┌──────────┘     └──────────┐
              ▼                           ▼
       MongoDB Atlas                  Cloudinary
                                           │
                                           ▼
                                    Images/Documents

                  Express API ──────► SMTP Provider
```

Before production:

```bash
# Client
npm run build

# Server
npm test
```

Use the scripts that actually exist in each `package.json`.

Production environment variables should be configured in the hosting provider's environment settings rather than committed to Git.

After deployment, verify:

- registration and login
- authorization
- student/admin separation
- timetable matching
- file uploads
- marketplace
- jobs and events
- notifications
- password-reset email delivery
- mobile responsiveness
- refresh on nested frontend routes
- CORS
- database connectivity

---

# Future Improvements

Potential improvements include:

- Signed/expiring Cloudinary document URLs
- Real-time notifications using WebSockets
- Email verification during registration
- Audit logs for administrative actions
- Advanced search and pagination
- Redis caching
- Background job queues
- Automated integration and end-to-end tests
- CI/CD pipeline
- API documentation with OpenAPI/Swagger
- Observability and centralized production logging
- Database backup and recovery automation

---

# Contributing

1. Create a feature branch.
2. Make focused changes.
3. Test the affected frontend and backend flows.
4. Commit using a descriptive message.
5. Open a pull request.

Example:

```bash
git checkout -b feat/marketplace-product-details
git add .
git commit -m "feat: add marketplace product details"
git push origin feat/marketplace-product-details
```

---

# License

Add the project's chosen license here before public distribution.

---

## Project Status

CampusConnect currently provides a functional MERN foundation for student and administrative campus workflows, including role-based access, academic resource management, Cloudinary-backed uploads, and institutional account handling.

Built with the goal of bringing essential campus services into one consistent student experience.
