# 🎯 AI-Driven Interview Platform

An end-to-end remote hiring platform that combines **AI-generated interview questions**, **real-time behavioural signal capture** (facial emotion, live transcript, voice tone), and **automated candidate scoring** — built entirely on free, open-source infrastructure.

🔗 **Live App:** [ai-interview-platform-puce.vercel.app](https://ai-interview-platform-puce.vercel.app) &nbsp;|&nbsp; ⚙️ **API:** [Render](https://ai-interview-platform-27t3.onrender.com)

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=googlegemini&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-38BDF8?logo=tailwindcss&logoColor=white)

---

## 💡 Why this project

Most take-home "job board" clones stop at CRUD. This one goes further — it automates the parts of remote hiring that actually take a recruiter's time: writing interview questions, watching for engagement, and scoring answers consistently. It's built to demonstrate **full-stack engineering + applied AI integration + thoughtful UX**, not just API wiring.

---

## ✨ Key Features

- 🤖 **AI-generated interview questions** — tailored per job (title, description, required skills) via the Google Gemini API
- 🎙️ **Live transcript capture** — fully client-side via the Web Speech API, no external service, no audio ever leaves the browser
- 😊 **Facial emotion detection** — on-device face analysis during the interview, with per-question emotion trends
- 🎚️ **Voice pitch & pace analysis** — desktop, measuring speaking ratio and pitch variation as engagement signals
- 📊 **Automated composite scoring** — blends content relevance (AI-graded), emotional tone, and vocal delivery into a single weighted score per answer, with **null-safe reweighting** when a signal (e.g. voice, on mobile) is unavailable
- 📈 **Recruiter analytics dashboard** — radar-chart score breakdown + per-question AI feedback for every completed interview
- 🧭 **End-to-end recruiter workflow** — post a job → review applications → shortlist → schedule interview → auto-generate questions → review AI-scored results
- 🔐 **Role-based auth** — JWT + Google Sign-In, candidate/recruiter roles
- 📧 **Email notifications** — interview scheduled (candidate) & results ready (recruiter), via Nodemailer
- 🌗 **Light/Dark mode** — system-aware, full app coverage
- ♿ **Accessibility-first** — keyboard focus states, ARIA labels, screen-reader-friendly error announcements
- 📱 **Fully responsive** — dedicated mobile layouts, not just squeezed desktop tables

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), Tailwind CSS v4, Zustand, React Router v7 |
| **Backend** | Node.js, Express.js, JWT Authentication |
| **Database** | MongoDB Atlas (Mongoose ODM), indexed for scale |
| **AI / NLP** | Google Gemini API — question generation & answer scoring |
| **In-browser AI** | `@vladmandic/face-api` (emotion), Web Speech API (transcript), Web Audio API (voice metrics) |
| **Email** | Nodemailer (Gmail SMTP) |
| **Deployment** | Vercel (frontend) · Render (backend) |

---

## 🧠 How the scoring pipeline works

1. Candidate answers each question — transcript, facial emotion trend, and voice metrics are captured live (client-side, throttled writes)
2. On interview completion, the backend **batch-scores** every answer:
   - **Content (60%)** — Gemini grades relevance, clarity, completeness (0–10) with written feedback
   - **Emotion (25%)** — frequency-weighted appropriateness of the emotion trend
   - **Voice (15%)** — *ideal-range* scoring (not linear) for speaking ratio & pitch variation — too little **or** too much both cost points
3. Missing signals (e.g. no voice data on mobile) are **excluded and the remaining weights renormalized** — never faked as zero
4. Result: a 0–100 composite score + a radar-chart breakdown, visible to the recruiter

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/rushikeshharad21/Ai-interview-platform.git

# Install dependencies
cd Ai-interview-platform/client && npm install
cd ../server && npm install

# Set up environment variables (see .env.example in each folder)
# MONGO_URI, JWT_SECRET, GEMINI_API_KEY, GOOGLE_CLIENT_ID,
# EMAIL_USER, EMAIL_APP_PASSWORD, CLIENT_URL

# Run locally
cd server && npm run dev
cd ../client && npm run dev
```

---

## 📁 Project Structure

ai-interview-platform/
├── client/ → React app (Vite, Tailwind, Zustand)
└── server/ → Express API (MongoDB, Gemini, Nodemailer)

---

## 🗺️ Roadmap

- [x] AI question generation & candidate scoring
- [x] Recruiter analytics dashboard
- [x] Dark mode, accessibility, email notifications
- [ ] Recruiter-side interview recording playback (metrics-only by design today)
- [ ] Mobile app (React Native) — see architecture notes for what would need to change

---

## 👤 Author

**Rushikesh Harad**
Built as a portfolio project to demonstrate full-stack + applied AI engineering.

📧 [rushikeshharad21@gmail.com](mailto:rushikeshharad21@gmail.com) &nbsp;|&nbsp; 💼 [LinkedIn](#) — open to opportunities.

---

⭐ If this project interests you, feel free to star the repo or reach out — happy to walk through the architecture and design decisions.
