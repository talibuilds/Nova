# NOVA — Team Productivity Platform

> **Plan. Collaborate. Deliver.**

NOVA is a full-stack project management application that allows teams to create projects, manage tasks, collaborate with team members, and track project progress.

![Stack](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Stack](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Stack](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Stack](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

---

## ✨ Features

### 🔐 Authentication
- JWT-based authentication (Login/Register)
- Protected routes with automatic redirect
- Profile management with password change

### 📊 Dashboard
- Real-time stats (projects, tasks, completion rate, overdue)
- Interactive charts (weekly progress, task distribution, priority breakdown)
- Activity feed showing recent team actions

### 📁 Projects
- Full CRUD operations
- Color-coded project cards with progress tracking
- Search and filter by status
- Team member management (add/remove)
- Project-level activity log

### ✅ Task Management
- Create, edit, delete tasks with full details
- Priority levels (Low, Medium, High, Urgent)
- Status tracking (To Do → In Progress → In Review → Done)
- Due dates with overdue indicators
- Labels and comments
- Assignee management

### 📋 Kanban Board
- Drag-and-drop task cards between columns
- Visual status columns with task counts
- Inline task creation per column
- Project switcher

### 👤 My Tasks
- Personal task view with filters
- Tasks grouped by project
- Status stats overview
- Quick status toggle

### ⚙️ Settings
- Profile editing (name, email, bio, department)
- Password change
- Dark/Light theme toggle
- Responsive design

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **React Router v6** for client-side routing
- **Chart.js** with react-chartjs-2 for analytics
- **@hello-pangea/dnd** for drag-and-drop
- **Axios** for API communication
- **react-hot-toast** for notifications
- **react-icons** for icon library
- **date-fns** for date formatting
- **Vanilla CSS** with comprehensive design system

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication with bcrypt
- **Express Validator** for request validation
- **Morgan** for HTTP logging

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Nova
   ```

2. **Install all dependencies**
   ```bash
   npm install
   npm run install-all
   ```

3. **Configure environment variables**
   Edit `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/nova
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This starts both:
   - Backend API at `http://localhost:5000`
   - Frontend at `http://localhost:5173`

---

## 📁 Project Structure

```
Nova/
├── server/                     # Backend API
│   ├── config/db.js           # MongoDB connection
│   ├── controllers/           # Route handlers
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── activityController.js
│   │   └── dashboardController.js
│   ├── middleware/            # Express middleware
│   │   ├── auth.js           # JWT verification
│   │   └── validate.js       # Request validation
│   ├── models/               # Mongoose schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   └── Activity.js
│   ├── routes/               # API routes
│   ├── server.js             # Entry point
│   └── .env                  # Environment config
├── client/                    # Frontend React app
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React contexts
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── App.jsx           # Main app with routing
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Design system
│   ├── index.html
│   └── vite.config.js
└── package.json               # Root with concurrent scripts
```

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |
| GET | `/api/auth/users` | List all users |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks (filterable) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task details |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| POST | `/api/tasks/:id/comments` | Add comment |
| PUT | `/api/tasks/:id/order` | Update task order |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Get statistics |
| GET | `/api/dashboard/charts` | Get chart data |

### Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activities` | Get activity feed |
| GET | `/api/activities/project/:id` | Project activities |

---

## 👨‍💻 Author

Built by **Talib Khan**

---

## 📄 License

This project is for educational purposes.
