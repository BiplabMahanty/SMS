# Student Management System

A production-ready Student Management System built with React Native (Expo) and Node.js.

## Project Structure

```
student-management-system/
├── mobile/       # React Native Expo app (TypeScript)
├── backend/      # Node.js + Express + MongoDB API (TypeScript)
└── README.md
```

## Tech Stack

**Mobile:** React Native, Expo, TypeScript, React Navigation, Redux Toolkit, Axios, React Hook Form, Zod

**Backend:** Node.js, Express, MongoDB, Mongoose, TypeScript, JWT (Phase 2)

---

## Getting Started

### Backend

```bash
cd backend
cp .env.example .env        # fill in your MongoDB URI
npm install
npm run dev
```

Server runs on `http://localhost:5000`

Health check: `GET http://localhost:5000/api/health`

### Mobile

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

---

## Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Done | Project foundation, design system, health API |
| 2 | Pending | Authentication (login, register, JWT, refresh tokens) |
| 3 | Pending | Admin dashboard + student management |
| 4 | Pending | Teacher module |
| 5 | Pending | Student module |
| 6 | Pending | Parent module |
| 7 | Pending | Notifications + real-time features |
