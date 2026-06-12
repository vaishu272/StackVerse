# StackVerse 🚀

A modern multi-user engineering blogging platform built with Next.js, Express.js, Prisma, PostgreSQL, and Cloudinary.

👉 **[Live App Link](https://stack-verse-silk.vercel.app)**

## Features

### Authentication

- JWT Authentication
- Refresh Token Rotation
- Role-Based Access Control (Visitor / Creator)
- Google OAuth Login
- GitHub OAuth Login
- Email Verification
- Forgot Password & Reset Password
- Protected Routes

### Blogging Platform

- Rich Text Editor (TipTap)
- Draft & Publish Workflow
- Article Categories
- SEO Keywords
- Cover Image Upload (Cloudinary)
- Infinite Scroll
- Pagination
- Article Bookmarks
- PDF Export
- Responsive Blog Feed

### User Profiles

- Profile Management
- Avatar Upload
- Creator Dashboard
- Visitor Dashboard
- Author Statistics

### Performance Optimizations

- Dynamic Imports
- Lazy Loading
- Zustand Store Optimization
- Cloudinary Image Optimization
- React Query Caching
- Next.js App Router
- Route Protection using Proxy

---

# Tech Stack

## Frontend

- Next.js 16
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- TanStack Query
- Axios
- React Hook Form
- Zod
- Framer Motion

## Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL (Neon)
- JWT
- Passport.js
- Cloudinary
- Nodemailer

---

# Project Structure

```txt
StackVerse/
│
├── client/
│   ├── app/
│   ├── features/
│   ├── shared/
│   ├── services/
│   └── store/
│
├── server/
│   ├── prisma/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── validations/
│   │   └── utils/
│   └── package.json
│
└── README.md
```

---

# Environment Variables

## Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Backend (.env)

```env
PORT=5000

DATABASE_URL=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

CLIENT_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

EMAIL_USER=
EMAIL_PASS=
```

---

# Installation

## Clone Repository

```bash
git clone <repository-url>
cd StackVerse
```

---

## Backend Setup

```bash
cd server

npm install

npx prisma generate

npx prisma migrate dev

npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

---

## Frontend Setup

```bash
cd client

npm install

npm run dev
```

Frontend runs on:

```txt
http://localhost:3000
```

---

# Deployment

## Frontend

- Vercel

## Backend

- Render

## Database

- Neon PostgreSQL

## Image Storage

- Cloudinary

---

# Roles

## Visitor

- Browse blogs
- Bookmark articles
- View profiles
- Download articles as PDF

## Creator

- Create articles
- Edit articles
- Publish drafts
- Manage profile
- Access creator dashboard

---

# Future Enhancements

- AI Writing Assistant
- Article Analytics
- Followers & Following
- Comments System
- Notifications
- Collaborative Editing
- Reading History
- Trending Articles
- Admin Dashboard

---

# Author

**Vaishnavi Mali**

Built with ❤️ using Next.js, Express.js, Prisma, and PostgreSQL.
