# TPHappenings - Event Management Platform

## Overview

TPHappenings is a full-stack web application designed to help students at Temasek Polytechnic discover, register, and attend events happening around campus. Organizers can create and manage events with attendance tracking.

**Live Demo**: https://tphappenings-frontend.onrender.com

---

## Problem Statement

Students often miss out on valuable workshops, seminars, and networking events because:
- Information is scattered across different platforms
- No centralized event discovery system
- Manual attendance tracking is inefficient
- No easy way to manage registrations

TPHappenings solves this by providing a unified platform for event discovery and management.

---

## Features

### For Students
- Browse and search events by category
- Register/unregister from events
- View event details (date, time, location, organizer)
- Dashboard showing registered and attended events
- Attendance verification via attendance key

### For Organizers
- Create and edit events
- View registration list
- Generate attendance keys
- Track attendance and statistics
- Manage event capacity

### Additional Feature: Deployment & GitOps
- Automated CI/CD pipeline via GitHub Actions
- Auto-deploy on push to main branch
- Zero-downtime deployments
- Rollback capability

---

## Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Bootstrap 5, Custom CSS
- **State Management**: Context API
- **Routing**: React Router v6
- **HTTP Client**: Fetch API

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ORM**: Mongoose
- **Validation**: Mongoose Schema Validation

### DevOps
- **Hosting**: Render (Frontend + Backend)
- **Database**: MongoDB Atlas (Cloud)
- **CI/CD**: GitHub Actions
- **Version Control**: Git/GitHub

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client Browser                        │
│        (React SPA running on Render Static Site)        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────────┐   ┌────────▼──────────┐
│ Frontend (Render)  │   │ Backend (Render)  │
│ - React Build      │   │ - Express Server  │
│ - Static Files     │   │ - REST APIs       │
│ - Client Routes    │   │ - Business Logic  │
└────────────────────┘   └────────┬──────────┘
                                  │ HTTPS
                                  │
                        ┌─────────▼──────────┐
                        │ MongoDB Atlas      │
                        │ - Collections      │
                        │ - Validations      │
                        │ - Indexing         │
                        └────────────────────┘
```

---

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  adminNo: String,
  course: String,
  yearOfStudy: Number,
  role: "student" | "organiser",
  createdAt: Date,
  updatedAt: Date
}
```

### Events Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  date: String (format: "28 Feb 2026"),
  time: String (format: "2:59 AM - 4:50 AM"),
  location: String,
  category: String (enum),
  maxParticipants: Number,
  spotsRemaining: Number,
  organizer: String,
  organizerId: String,
  image: String (base64),
  attendanceKey: String,
  stats: {
    registered: Number,
    attended: Number,
    attendanceRate: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Registrations Collection
```javascript
{
  _id: ObjectId,
  eventId: String,
  userId: String,
  fullName: String,
  email: String,
  adminNo: String,
  course: String,
  yearOfStudy: String,
  reasons: String,
  registrationDate: String,
  status: "registered",
  receiveUpdates: Boolean,
  consentPhoto: Boolean,
  attended: Boolean,
  attendanceTime: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Users
- `POST /users/register` - Register new user
- `POST /users/login` - User login
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user profile

### Events
- `GET /events` - Get all events
- `GET /events/:id` - Get event details
- `POST /events` - Create event (organizer only)
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `POST /events/:id/attendance-key` - Generate attendance key

### Registrations
- `GET /registrations` - Get all registrations (query by eventId/userId)
- `GET /registrations/:id` - Get single registration
- `POST /registrations` - Register for event
- `PUT /registrations/:id` - Update registration (mark attended)
- `DELETE /registrations/:id` - Cancel registration

---

### My Implementation

**Architecture**:
```
Git Push → GitHub Actions → Build & Test → Deploy to Render
```

**Workflow**:
1. Developer pushes to `main` branch
2. GitHub Actions automatically triggers
3. Frontend builds (`npm run build`)
4. Backend syntax check runs
5. Both services auto-deploy on Render
6. Live within 2-3 minutes

### Benefits

- **Automation**: No manual deployments
- **Reliability**: Consistent build process
- **Auditability**: Full git history of what was deployed
- **Speed**: Minutes from push to production
- **Safety**: Previous version stays live if new one fails
- **Rollback**: One git revert command to rollback

### Deployment Process

**Frontend** (Static Site on Render):
- Build command: `npm install && npm run build`
- Publish directory: `dist/`
- Environment: `VITE_API_URL=https://tphappenings.onrender.com`

**Backend** (Web Service on Render):
- Build command: `npm install`
- Start command: `node server.js`
- Environment: `MONGODB_URI`, `NODE_ENV=production`

### Monitoring

**Check deployment status**:
1. GitHub Actions tab → see workflow status
2. Render Dashboard → see live logs
3. Email notifications on failures

**If deployment fails**:
- Previous version stays active (zero downtime)
- Check build logs in Render/GitHub
- Fix code locally, push to main
- System automatically redeploys

### Rollback

```
# Revert to previous commit
git revert HEAD
git push origin main

# Render automatically redeploys with old code
```

---

## Backend Validation Rules

### Events
- Event date must be today or in the future
- End time must be after start time
- Max participants must be at least 1
- Title, description, location are required

### Registrations
- User can't register twice for same event
- All required fields must be provided
- Email and adminNo must be valid

---

## Installation & Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Git

### Setup

```
# Clone repository
git clone https://github.com/oscarczy/tphappenings.git
cd tphappenings

# Install dependencies
npm install

# Create .env file

MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5050
NODE_ENV=development
VITE_API_URL=http://localhost:5050

# Start backend
node server.js

# In another terminal, start frontend
npm run dev
```

### Access
- Frontend: http://localhost:5173
- Backend: http://localhost:5050
- MongoDB: Via Atlas dashboard

---

## Testing

### Manual Testing Checklist
- [ ] Register new account
- [ ] Login successfully
- [ ] Browse events
- [ ] Filter by category
- [ ] Register for event
- [ ] Unregister from event
- [ ] View dashboard
- [ ] Create event (as organizer)
- [ ] Edit event capacity
- [ ] Record attendance
- [ ] Delete event

### Production URLs
- Frontend: https://tphappenings-frontend.onrender.com
- Backend: https://tphappenings.onrender.com
- Health check: https://tphappenings.onrender.com/health

---

## Future Enhancements

- Email notifications for registrations
- QR code attendance scanning
- Event recommendations based on history
- Export attendance as PDF
- Real-time notifications via WebSocket
- Mobile app (React Native)
- Advanced analytics dashboard

---

## Project Structure

```
tphappenings/
├── models/                 # Mongoose schemas
│   ├── User.js
│   ├── Event.js
│   └── Registration.js
├── routes/                 # Express routes
│   ├── users.js
│   ├── events.js
│   └── registrations.js
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── context/            # Context providers
│   ├── styles/             # CSS files
│   ├── App.jsx
│   └── main.jsx
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions CI/CD
├── server.js               # Express entry point
├── package.json
├── DEPLOYMENT.md           # Deployment guide
└── README.md               # This file
```
Test deployment
---


