# TaskFlow Pro — Premium Task Manager

A modular, real-time task management application built with HTML, Vanilla CSS, JavaScript (ES6+), and Firebase.

## 🚀 Features
- **Dashboard**: Real-time stats, project distribution donut charts, and task status pie charts.
- **Activity Tracking**: Log tasks with multiple time entries. Supports manual entry and a live stopwatch helper.
- **Admin Analytics**: Leaderboard, Podium, Scoreboard, and activity frequency trend analysis.
- **Multi-user Support**: Role-based access (Admin/User).
- **Export**: Download filtered task history as PDF or Excel.
- **Themes**: Premium glassmorphism UI with Dark and Light mode support.

## 🛠️ Tech Stack
- **Frontend**: Vite, Bootstrap 5.3, Chart.js, Quill (Rich Text), Tom Select.
- **Backend**: Firebase Firestore & Firebase Auth.
- **Animations**: GSAP, Animate.css.

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v16+)
- A Firebase Project

### 2. Installation
```bash
npm install
```

### 3. Firebase Configuration
Create a `.env` file in the root directory based on `.env.example`:
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Running Locally
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

## 📂 Data Schema
- **Users**: `{ email, display_name, is_admin, created_at }`
- **Projects**: `{ name, userId, createdBy, createdAt }`
- **Tasks**: `{ taskName, project, remark, remarkText, timeEntries, totalDuration, status, userId, createdBy, createdAt }`

## 🛡️ Security Note
Ensure your Firestore Security Rules are configured to restrict access. Example:
```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /Tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
```
