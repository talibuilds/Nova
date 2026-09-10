<div align="center">
  <img src="./client/public/logo.png" alt="Nova Logo" width="120" />
  <h1>NOVA — Team Productivity Platform</h1>
  <p><strong>Plan. Collaborate. Deliver.</strong></p>
  <p>NOVA is a premium, full-stack project management application featuring real-time task tracking, interactive Kanban boards, and comprehensive team analytics.</p>

  <div>
    <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  </div>
</div>

<br />

> **Live Demo:** [https://nova-backend-evhs.onrender.com](https://nova-backend-evhs.onrender.com) (Backend API)  
> *Note: Frontend deployment URL goes here*

---

## 🏗️ System Architecture

NOVA follows a modern **Client-Server architecture** with a decoupled frontend and backend, communicating securely via RESTful APIs and JSON Web Tokens.

```mermaid
graph TD
    Client[Client Browser]
    
    subgraph Frontend [React + Vite Application]
        UI[React Components]
        State[React Context API]
        Router[React Router]
        Axios[Axios HTTP Client]
    end
    
    subgraph Backend [Node.js + Express API]
        API[Express Router]
        Auth[JWT Authentication]
        Controllers[Business Logic]
        Models[Mongoose ODM]
    end
    
    Database[(MongoDB Atlas)]
    
    Client <--> |HTTPS| Frontend
    UI <--> State
    UI <--> Router
    UI <--> Axios
    Axios <--> |REST API / JSON| API
    API <--> Auth
    API <--> Controllers
    Controllers <--> Models
    Models <--> |Mongoose / TCP| Database
```

---

## 🗄️ Entity Relationship Diagram

The database is built on MongoDB using Mongoose schemas. Below is the relational structure of the documents:

```mermaid
erDiagram
    USER ||--o{ PROJECT : "owns/manages"
    USER ||--o{ TASK : "assigned to"
    USER ||--o{ ACTIVITY : "performs"
    
    PROJECT ||--o{ TASK : "contains"
    PROJECT ||--o{ ACTIVITY : "logs"
    PROJECT ||--o{ PROJECT_MEMBER : "has"
    
    USER ||--o{ PROJECT_MEMBER : "is a"

    USER {
        ObjectId _id
        String name
        String email
        String password
        String role
        String department
        Date lastLogin
    }
    
    PROJECT {
        ObjectId _id
        String name
        String description
        String status
        String priority
        Date startDate
        Date endDate
        ObjectId owner
    }
    
    PROJECT_MEMBER {
        ObjectId user
        String role
    }
    
    TASK {
        ObjectId _id
        String title
        String description
        String status
        String priority
        Date dueDate
        Number order
        ObjectId project
        ObjectId assignee
        ObjectId reporter
    }
    
    ACTIVITY {
        ObjectId _id
        String action
        String details
        ObjectId project
        ObjectId task
        ObjectId user
        Date createdAt
    }
```

---

## ✨ Key Features

### 🔐 Security & Authentication
- **JWT-based authentication** (Login/Register)
- **Protected routes** with automatic token validation
- **Password encryption** using bcrypt

### 📊 Interactive Dashboard
- **Real-time stats** (active projects, tasks, completion rates, overdue tasks)
- **Dynamic charts** via Chart.js (weekly progress, status distribution)
- **Live activity feed** tracking team actions (task moves, comments, creations)

### 📋 Kanban Board & Tasks
- **Smooth Drag-and-Drop** task cards between columns
- **Visual status tracking** (To Do → In Progress → In Review → Done)
- **Priority levels** (Low, Medium, High, Urgent)
- **Inline task creation** and detailed modals
- **Team assignment** and commenting

### 🎨 Modern UI/UX
- **Glassmorphism elements** and sleek card designs
- **Dark/Light theme toggle** with custom CSS variables
- **Fully responsive** layout for mobile and desktop
- **Toast notifications** for user feedback

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router v6** for client-side routing
- **Chart.js** with `react-chartjs-2` for analytics
- **@hello-pangea/dnd** for Kanban drag-and-drop
- **Axios** for API requests
- **react-hot-toast** & **react-icons**

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JSON Web Tokens (JWT)** & **bcryptjs**
- **Express Validator** for secure input validation
- **Morgan** for HTTP logging

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/talibuilds/Nova.git
   cd Nova
   ```

2. **Install all dependencies**
   ```bash
   npm install
   npm run install-all
   ```

3. **Configure environment variables**
   Create `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/nova
   JWT_SECRET=your_super_secret_key_here
   ```
   Create `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```
   - Backend runs on `http://localhost:5000`
   - Frontend runs on `http://localhost:5173`

---

## 🔗 API Endpoints

| Resource | Endpoints |
|----------|-----------|
| **Auth** | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| **Projects** | `GET /api/projects`, `POST /api/projects`, `GET /api/projects/:id`, `PUT /api/projects/:id` |
| **Tasks** | `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `PUT /api/tasks/:id/order` |
| **Dashboard**| `GET /api/dashboard/stats`, `GET /api/dashboard/charts` |
| **Activity** | `GET /api/activities` |

---

## 👨‍💻 Author
Built by **Talib Khan**

## 📄 License
This project is for educational purposes.
