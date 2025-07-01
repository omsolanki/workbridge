# WorkBridge

A modern, modular MERN + TypeScript freelancing platform inspired by Upwork.

---

## 🚀 Tech Stack
- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Express.js + TypeScript
- **Database:** MongoDB (Mongoose)
- **State Management:** Redux Toolkit
- **Authentication:** JWT (Role-based: Freelancer, Client, Admin)
- **File Uploads:** AWS S3
- **Realtime:** Socket.IO (chat, notifications)
- **Payments:** Stripe/PayPal skeleton, simulated escrow
- **Deployment:** Docker-ready

---

## 📁 Project Structure

```
workbridge/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                 # Express backend (TypeScript)
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── config/
│   │   └── sockets/
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── env.example
└── README.md
```

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm (v8+)
- MongoDB (local or Atlas)
- Docker (optional, for full stack)
- AWS S3 bucket (for file uploads)

### 2. Clone the Repository
```bash
git clone <repo-url>
cd workbridge
```

### 3. Environment Variables
Copy and configure environment variables:
```bash
cp env.example .env
# Edit .env with your credentials (MongoDB, AWS, email, etc.)
```

### 4. Install Dependencies
#### Backend
```bash
cd server
npm install
```
#### Frontend
```bash
cd ../client
npm install
```

### 5. Running in Development
#### Start Backend
```bash
cd server
npm run dev
```
#### Start Frontend
```bash
cd ../client
npm run dev
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/ping
- Swagger Docs: http://localhost:5000/api/docs

### 6. Running with Docker
```bash
docker-compose up --build
```
- All services (MongoDB, Redis, backend, frontend, Nginx, admin tools) will start.

### 7. Seeding Sample Data
```bash
cd server
npm run seed
```

---

## 🧪 Testing
- Backend: `npm run test` (Jest)
- Frontend: `npm run test` (Vitest)

---

## 🔐 Authentication & Roles
- **Freelancer:** Can submit proposals, track time, receive payments
- **Client:** Can post jobs, hire freelancers, manage contracts
- **Admin:** Can manage users, resolve disputes, view analytics

---

## 📦 Features
- Modular codebase (easy to extend)
- Type-safe API routes and DTOs
- Middleware for authentication, error handling
- Real-time chat and notifications (Socket.IO)
- File uploads (AWS S3)
- Simulated escrow payments
- Admin dashboard
- Docker-ready for deployment

---

## 📄 API Documentation
- Swagger UI: http://localhost:5000/api/docs
- Health Check: http://localhost:5000/api/ping

---

## 📝 License
MIT 