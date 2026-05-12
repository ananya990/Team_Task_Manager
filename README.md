# Team Task Manager

> A production-ready, full-stack collaborative task management platform.

![TaskManager Banner](https://via.placeholder.com/1200x400?text=TaskManager)

---

## ✨ Features

- 🔐 JWT Authentication (Access + Refresh Tokens)
- 📁 Project Management with team collaboration
- ✅ Full task workflow with Kanban drag-and-drop
- 📊 Analytics dashboard with charts
- 👥 Role-Based Access Control (Admin / Member)
- 🌙 Dark / Light theme toggle
- ⚡ Real-time updates via Socket.IO
- 📱 Fully responsive mobile-first UI
- 🔔 Toast notifications + activity logs
- 🐳 Docker support

---

## 🧱 Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| Next.js 14 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| ShadCN UI | Component library |
| Zustand | State management |
| React Hook Form + Zod | Forms & validation |
| Axios | HTTP client |
| Framer Motion | Animations |
| Recharts | Charts |
| Socket.IO Client | Real-time |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | Server |
| TypeScript | Type safety |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcrypt | Password hashing |
| Socket.IO | Real-time |
| Helmet + CORS | Security |
| express-rate-limit | Rate limiting |
| Zod | Validation |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm / yarn / pnpm

### 1. Clone the repository
```bash
git clone https://github.com/your-org/TaskManager.git
cd TaskManager
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm run seed   # Optional: seed demo data
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your values
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Setup

```bash
# From root directory
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
docker-compose up --build
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 📁 Folder Structure

```
TaskManager/
├── backend/
│   ├── src/
│   │   ├── config/         # DB, env config
│   │   ├── controllers/    # Route handlers
│   │   ├── middlewares/    # Auth, RBAC, error
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routers
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helpers, JWT, etc.
│   │   ├── validators/     # Zod schemas
│   │   └── app.ts          # Express app
│   ├── scripts/
│   │   └── seed.ts         # Demo data seeder
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/
│   │   │   ├── ui/         # ShadCN + custom atoms
│   │   │   ├── forms/      # Form components
│   │   │   ├── layout/     # Sidebar, Navbar
│   │   │   ├── dashboard/  # Dashboard widgets
│   │   │   ├── projects/   # Project components
│   │   │   └── tasks/      # Task components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Axios instance, utils
│   │   ├── services/       # API service functions
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # TypeScript types
│   │   └── styles/         # Global CSS
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🔗 API Documentation

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/me` | Current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (Admin) |
| GET | `/api/users/:id` | Get user |
| PUT | `/api/users/profile` | Update profile |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/dashboard/activity` | Activity feed |

---

## 👤 Demo Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@taskmanager.dev | Admin@123 |
| Member | alice@taskmanager.dev | Member@123 |
| Member | bob@taskmanager.dev | Member@123 |

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
# Set env vars in Vercel dashboard
```

### Backend → Render / Railway
1. Create a new Web Service
2. Connect your GitHub repo
3. Set root directory to `backend`
4. Build command: `npm run build`
5. Start command: `npm start`
6. Add environment variables

### Database → MongoDB Atlas
1. Create free cluster at mongodb.com/atlas
2. Whitelist IPs (0.0.0.0/0 for production)
3. Get connection string
4. Set `MONGODB_URI` in backend env

---

## 🧪 Running Tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

---
