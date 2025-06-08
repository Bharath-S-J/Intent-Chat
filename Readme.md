# Intent Chat Chat Application – Full Stack (Frontend + Backend)

A full-featured real-time chat application with:

- Email/password authentication  
- Contact invitation system  
- Real-time messaging (text + image)  
- Online user tracking  
- Profile management  
- Theme customization

---

## 📁 Project Structure

- `frontend/` – React application (Vite, Zustand, Socket.IO)
- `backend/` – Node.js API server (Express, MongoDB, Cloudinary, Socket.IO)

---

## ⚙️ How to Run the Project Locally

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd <project-folder>
```

### 2. Install Dependencies

```bash
cd frontend
npm install

cd ../backend
npm install
```

### 3. Configure Environment Variables (Backend Only)

Create a `.env` file inside the `backend/` directory with the following content:

```env
MONGODB_URI=mongodb+srv://mongo
PORT=5010
JWT_SECRET=myse
NODE_ENV=development

CLOUDINARY_CLOUD_NAME=dba
CLOUDINARY_API_KEY=992952
CLOUDINARY_API_SECRET=d5rIvoRCb9K

EMAIL_USER=buildwithbh
EMAIL_PASS=jyssyscmr

CLIENT_URL=http://localhost:5173
```

> No `.env` setup is required for the frontend.

### 4. Start the Application

**Start Backend:**

```bash
cd backend
npm start
```

**Start Frontend:**

```bash
cd frontend
npm run dev
```

* Frontend: `http://localhost:5173`
* Backend: `http://localhost:5010`

---

## 🚀 Features

### 🔐 Authentication

* User signup (name, email, password)
* User login & logout
* JWT-based session management
* Auth check on app refresh
* Invite-by-email during signup (`inviteFrom`)

### 👥 Contacts

* Add contact by email
* Remove contact by user ID
* Only mutual contacts can message each other
* Fetch full contact list via `/user/contacts`
* Real-time contact presence status

### 💬 Messaging

* Real-time messaging with Socket.IO
* Text and image message support (uploads via Cloudinary)
* Fetch message history with selected user
* Send messages only to confirmed contacts

### 🌐 Socket.IO Integration

* Real-time message delivery
* Online contacts tracking
* Connects socket only on login/signup
* Clean disconnection on logout

### 🧠 State & UI

* Zustand for state management
* React Router v7 for routing
* Toast notifications via `react-hot-toast`
* Global loading indicators
* Theme switcher saved in `localStorage` (`chat-theme`)
* Protected routes for logged-in users only

---

## 📌 Notes

* Ensure your MongoDB URI and Cloudinary/Email credentials are valid
* The backend must be started before the frontend
* You can update the `CLIENT_URL` in `.env` if deploying the frontend separately