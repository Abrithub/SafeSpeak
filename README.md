# SafeSpeak — Abuse Reporting Platform

A full-stack platform for safely and anonymously reporting abuse incidents.
Includes a web frontend, mobile app, Node.js backend, and AI classification service.

---

## Project Structure

```
SafeSpeak/
├── client/frontend/     # React + Vite web app
├── server/              # Node.js + Express + MongoDB backend
├── safespeak-app/       # React Native (Expo) mobile app
└── ai-service/          # Node.js AI classification service
```

---

## Prerequisites

- Node.js v18+
- npm
- MongoDB Atlas account (free tier)
- Expo Go app on your phone (for mobile)

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/Abrithub/SafeSpeak.git
cd SafeSpeak
```

### 2. Backend server

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
ADMIN_REGISTER_KEY=your_admin_key
AI_SERVICE_URL=http://localhost:5001
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

Start the server:
```bash
npm run dev
```

### 3. AI Service

```bash
cd ai-service
npm install
```

Create a `.env` file in `ai-service/`:
```
AI_PORT=5001
GEMINI_API_KEY=your_gemini_api_key
```

Start:
```bash
npm start
```

### 4. Web Frontend

```bash
cd client/frontend
npm install
npm run dev
```

Open `http://localhost:5173`

### 5. Mobile App

```bash
cd safespeak-app
npm install
```

Update the API base URL in `src/services/api.js`:
```js
const BASE = 'http://YOUR_PC_IP:5000/api';
```

Find your PC IP by running `ipconfig` (Windows) or `ifconfig` (Mac/Linux).

Start:
```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

---

## Creating an Admin Account

Visit:
```
http://localhost:5173/admin/register
```

Use the `ADMIN_REGISTER_KEY` from your `.env` to register.

---

## Features

- Anonymous abuse reporting with AI urgency classification
- Admin dashboard with case management, assignment, messaging
- Reporter portal — track cases, view appointments, reply to messages
- AI chatbot support (Gemini-powered)
- Email notifications for status updates and appointments
- Multilingual support (English, Amharic, Afaan Oromoo)
- Mobile app with full feature parity

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Mobile | React Native, Expo |
| Backend | Node.js, Express, MongoDB, Mongoose |
| AI | Google Gemini API + dataset engine |
| Auth | JWT |
| Email | Nodemailer (Gmail / Ethereal) |
| Storage | Cloudinary |
