# **Intent Chat** – Full Stack Real-Time Messaging Platform

A fully functional real-time chat application built with **React**, **Node.js**, **Express**, **MongoDB**, and **Socket.IO**. It provides secure communication, intelligent invite-based contact linking, image sharing, real-time presence, message limits, and customizable themes — all wrapped in a scalable architecture.

---

## ✨ **Key Features**

### 🔐 Authentication & Security

* Email/password-based signup and login
* JWT-based session handling
* Invite-only onboarding (secure email links)
* Auth persistence across app reloads
* Protected routes (frontend + backend)

### 👥 Smart Contact System

* Add/remove contacts via email
* Mutual-confirmation required for messaging
* Real-time online presence tracking
* Auto-friendship upon mutual message reply
* 5-message limit enforcement before confirmation

### 💬 Real-Time Chat

* Instant messaging with Socket.IO
* Supports text and image messages (via Cloudinary)
* Live delivery feedback and message history retrieval
* Efficient server-side filtering to reduce frontend load

### 🎨 UI & Experience

* Clean, modern UI with theme switcher (light/dark)
* Theme preference saved via localStorage
* Zustand for global state management
* Toast notifications via `react-hot-toast`
* Responsive layout with protected navigation

---

## 🧱 **Tech Stack**

| Category    | Tech Used                                            |
| ----------- | ---------------------------------------------------- |
| Frontend    | React (Vite), Zustand, React Router v7, Tailwind CSS |
| Backend     | Node.js, Express, MongoDB (Mongoose), Socket.IO      |
| Auth & Mail | JWT, Nodemailer                                      |
| Media       | Cloudinary (Image upload & CDN)                      |
| Dev Tools   | dotenv, nodemon, concurrently                        |

---

## 📁 **Project Structure**

```
Intent-Chat/
├── frontend/     # Vite + React + Zustand + Tailwind
└── backend/      # Express + MongoDB + Socket.IO
```

---

## ⚙️ **How to Run Locally**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Bharath-S-J/Intent-Chat.git
cd Intent-Chat
```

### 2️⃣ Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 3️⃣ Configure Environment Variables

Inside `backend/.env`:

```env
MONGODB_URI=your_mongo_connection_string
PORT=5010
JWT_SECRET=your_jwt_secret
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password

CLIENT_URL=http://localhost:5173
```

> 🔒 *Note: No `.env` file is needed for the frontend.*

---

### 4️⃣ Start the Application

#### ✅ Backend

```bash
cd backend
npm start
```

#### ✅ Frontend

```bash
cd frontend
npm run dev
```

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:5010](http://localhost:5010)

---

## 📌 **Special Highlights**

* **Email Invites**: Only invited users can sign up; links establish automatic contact.
* **Smart Messaging Limits**: Enforces a message cap unless both users are confirmed.
* **Socket Lifecycle**: Connects only when authenticated, gracefully disconnects on logout.
* **Cloudinary Integration**: Seamless image uploads with CDN-backed URLs.
* **Minimal Data Transfer**: Backend handles most filtering and logic for performance.

---

## 📷 **Preview**

| Page                                                                                                         | Description          |
| ------------------------------------------------------------------------------------------------------------ | -------------------- |
| ![Sign Up](https://cdn.jsdelivr.net/gh/Bharath-S-J/CDNImages@main/IntentChatImages/Create_Account.png)       | Account Creation     |
| ![Sign In](https://cdn.jsdelivr.net/gh/Bharath-S-J/CDNImages@main/IntentChatImages/SigIn.png)                | Login Interface      |
| ![Chat](https://cdn.jsdelivr.net/gh/Bharath-S-J/CDNImages@main/IntentChatImages/Chating_DashBoard.png)       | Real-Time Chat       |
| ![Contacts](https://cdn.jsdelivr.net/gh/Bharath-S-J/CDNImages@main/IntentChatImages/Contacts_Management.png) | Contact Management   |
| ![Profile](https://cdn.jsdelivr.net/gh/Bharath-S-J/CDNImages@main/IntentChatImages/Profile.png)              | Profile Settings     |
| ![Theme](https://cdn.jsdelivr.net/gh/Bharath-S-J/CDNImages@main/IntentChatImages/Settings.png)               | Theme & App Settings |

---

## 🔗 **GitHub Repository**

👉 [https://github.com/Bharath-S-J/Intent-Chat](https://github.com/Bharath-S-J/Intent-Chat)

---

Let me know if you'd like a **PDF export**, a **Markdown version**, or if you're adding this to a portfolio site — I can adjust for SEO/preview meta too.
