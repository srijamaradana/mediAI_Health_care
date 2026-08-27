# MediAI (MediTrack Pro) — Full-Stack Healthcare Management Platform

A complete healthcare management platform built with **React.js, Node.js, Express.js, MongoDB, and Socket.IO**.
Patients book appointments, track medications, log health metrics, and store medical reports.
Doctors manage their schedule and confirm/complete appointments. Admins manage all users.

## ✨ Features
- **JWT authentication** — short-lived access tokens + httpOnly-cookie refresh tokens, with automatic silent refresh on the frontend
- **Password hashing** with bcrypt (12 salt rounds)
- **Role-based access control** (patient / doctor / admin) enforced via Express middleware
- **REST APIs** for users, doctors, appointments, medications, health records, reports, notifications
- **Real-time notifications** via Socket.IO (per-user rooms, JWT-authenticated socket handshake)
- **File uploads** (medical reports) via Multer → Cloudinary
- Security hardening: Helmet, CORS allowlist, rate limiting, centralized error handling, input validation (express-validator)
- React frontend: protected/role-gated routes, Axios interceptors with token refresh, Recharts trend charts, Tailwind UI

## 🏗️ Project Structure
```
mediai/
├── backend/
│   ├── config/          # db.js, cloudinary.js
│   ├── models/          # User, Doctor, Appointment, Medication, Prescription, HealthRecord, Report, Notification
│   ├── middleware/       # auth (JWT), role (RBAC), upload (Multer), validate, error
│   ├── controllers/      # business logic per resource
│   ├── routes/           # REST endpoints per resource
│   ├── utils/            # tokens, email, ApiError, asyncHandler, seed script
│   ├── socket.js         # Socket.IO server + auth + emitToUser helper
│   ├── app.js / server.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── context/      # AuthContext, SocketContext
    │   ├── services/     # axios instance + endpoint wrappers
    │   ├── components/   # Layout, Navbar, Sidebar, ProtectedRoute
    │   ├── pages/         # Login, Register, Dashboard, Doctors, Appointments,
    │   │                  #   Medications, HealthRecords, Reports, Users
    │   └── App.jsx
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI
- (Optional) Cloudinary account for report uploads, SMTP credentials for email

### 1. Backend
```bash
cd backend
cp .env.example .env      # fill in MONGO_URI, JWT secrets, etc.
npm install
npm run seed               # creates demo admin/doctor/patient accounts
npm run dev                 # starts on http://localhost:5000
```

Demo accounts after seeding:
| Role    | Email               | Password       |
|---------|---------------------|----------------|
| Admin   | admin@mediai.com    | Admin@12345    |
| Doctor  | doctor@mediai.com   | Doctor@12345   |
| Patient | patient@mediai.com  | Patient@12345  |

### 2. Frontend
```bash
cd frontend
cp .env.example .env      # points to the backend API/socket URL
npm install
npm run dev                 # starts on http://localhost:5173
```

Open http://localhost:5173 and log in with one of the demo accounts above.

## 🔑 Auth Flow
1. `POST /api/auth/login` returns a short-lived **access token** (JSON body) and sets a long-lived **refresh token** as an httpOnly cookie.
2. The frontend stores the access token in memory/localStorage and attaches it as `Authorization: Bearer <token>` on every request.
3. On a `401`, an Axios interceptor calls `POST /api/auth/refresh` (cookie sent automatically) to silently get a new access token and retries the original request.
4. `POST /api/auth/logout` clears the refresh token server-side and the cookie.

## 🔒 Role-Based Access Control
Middleware `protect` verifies the JWT and loads `req.user`; `authorize('admin', 'doctor', ...)` restricts a route to specific roles. Example:
```js
router.get("/", authorize("admin"), getAllUsers);
```

## 📡 Real-Time Notifications
Socket.IO clients authenticate their handshake with the same JWT access token. Each user joins a private room (`user:<id>`); server-side events like appointment status changes call `emitToUser(userId, "notification:new", payload)`, which the frontend listens for and surfaces as toasts + a notification bell.

## 📝 Notes / Next Steps
- This is a strong portfolio-ready MVP. Natural extensions: doctor-approval admin UI, video consultations, prescription PDF generation, push notifications, unit/integration tests, Docker Compose for one-command local setup, CI/CD pipeline.
- Set `NODE_ENV=production` and real secrets before deploying; never commit `.env`.
