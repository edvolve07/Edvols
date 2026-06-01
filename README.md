<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router"/>
  <img src="https://img.shields.io/badge/Recharts-FF6B6B?style=for-the-badge&logo=recharts&logoColor=white" alt="Recharts"/>
  <img src="https://img.shields.io/badge/Lucide_Icons-F56565?style=for-the-badge&logo=lucide&logoColor=white" alt="Lucide"/>
</p>

<h1 align="center">🎯 PrepUp Frontend</h1>
<p align="center">
  <strong>React + Vite frontend for the PrepUp AI-driven placement readiness platform</strong>
  <br/>
  Mock interviews · Aptitude tests · Dashboards · Analytics · Reports
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Routes & Pages](#-routes--pages)
  - [Authentication](#-authentication-routes)
  - [Student](#-student-routes)
  - [Admin](#-admin-routes)
  - [Master Admin](#-master-admin-routes)
- [Feature Walkthrough](#-feature-walkthrough)
  - [Mock AI Interview](#-mock-ai-interview)
  - [Aptitude Assessments](#-aptitude-assessments)
  - [Admin Assessment Management](#%EF%B8%8F-admin-assessment-management)
  - [Reports & Analytics](#-reports--analytics)
  - [User Management](#-user-management)
  - [AI Usage Dashboard](#-ai-usage-dashboard)
- [Components](#-components)
- [API Integration](#-api-integration)
- [Project Structure](#-project-structure)
- [Scripts](#-scripts)

---

## 🌟 Overview

PrepUp is a comprehensive **placement readiness platform** that helps students prepare for job interviews and aptitude tests using AI-powered tools. The platform features:

- 🎤 **AI Mock Interviews** — Voice/video-based interviews with real-time AI evaluation, transcription, and feedback
- 📝 **Aptitude Assessments** — Timed MCQ tests with AI-generated questions across 20 concepts
- 📊 **Detailed Reports** — Radar charts, bar charts, ATS analysis, and downloadable PDFs
- 👥 **Multi-role System** — Student, Admin, and Master Admin with distinct dashboards
- 🤖 **AI Question Generation** — Automatic MCQ generation from predefined templates or AI providers

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | React 18 |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 |
| **Routing** | React Router 7 |
| **Charts** | Recharts 2 |
| **Icons** | Lucide React |
| **State Management** | React Context (Auth + Toast) |
| **HTTP Client** | Native `fetch` (wrapped) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **Backend server** running (see [Backend README](../backend/README.md))

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your backend URL

# 4. Start development server
npm run dev
```

The app starts at **http://localhost:5173** by default.

### Production Build

```bash
npm run build     # Outputs to dist/
npm run preview   # Preview the production build locally
```

---

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | ✅ | `http://localhost:8000` | Backend API base URL |
| `VITE_API_KEY` | ❌ | — | Optional API secret key |

> The Vite dev server proxies `/api` requests to the configured `VITE_API_URL`, avoiding CORS issues during development.

---

## 🗺️ Routes & Pages

### 🔑 Authentication Routes

| Route | Component | Description |
|---|---|---|
| `/` | Landing | Redirects to role-based dashboard or login |
| `/login` | `Login` | Email + password authentication |
| `/signup` | `Signup` | New user registration with auto role assignment |
| `/forgot-password` | `ForgotPassword` | Request password reset email (5-min TTL) |
| `/reset-password` | `ResetPassword` | Reset password using token from email |

### 👨‍🎓 Student Routes

| Route | Component | Description |
|---|---|---|
| `/dashboard` | `DashboardPage` | Overview: interview stats, topic performance, recent submissions |
| `/student/dashboard` | `StudentDashboard` | Portal-styled student stats |
| `/interview` | `InterviewPage` | Full AI mock interview: domain/role selection → resume upload → 10 Q&A → report |
| `/aptitude` | `AptitudePage` | Available aptitude assessments list |
| `/aptitude/:id/start` | `StartAssessment` | Take an aptitude test (timer + MCQ) |
| `/aptitude/results` | `StudentResults` | View aptitude results |
| `/aptitude/results/:id` | `ResultDetails` | Detailed result per question |
| `/student/assessments` | `StudentAssessments` | Portal-styled assessment list |
| `/student/assessments/:id/start` | `StartAssessment` | Portal-styled test-taking interface |
| `/student/results` | `StudentResults` | Portal-styled results list |
| `/student/results/:attemptId` | `ResultDetails` | Portal-styled result detail |
| `/report` | `ReportPage` | Interview report viewer with charts |
| `/reports` | `ReportsResultsPage` | Combined reports + results overview |
| `/reports/results/:attemptId` | `ResultDetails` | Result detail from combined view |

### 👨‍💼 Admin Routes

| Route | Component | Description |
|---|---|---|
| `/admin-dashboard` | `PrepupAdminDashboard` | Admin overview: stats, quick actions |
| `/admin/assessments` | `AdminAssessments` | List, publish/unpublish, delete, extend duration |
| `/admin/assessments/create` | `CreateAssessment` | AI-powered question generation form |
| `/admin/assessments/:id/questions` | `QuestionReview` | Review/edit generated questions before publishing |
| `/admin/assessments/:id/results` | `AssessmentResults` | Per-student attempt monitoring + time extension |
| `/admin/analytics/aptitude` | `AdminAptitudeAnalytics` | Per-student aptitude analytics |
| `/admin/analytics/interviews` | `AdminInterviewAnalytics` | Interview analytics with reports viewer |
| `/admin/assessments` | `AdminAssessments` | Admin assessment management (portal) |

### 👑 Master Admin Routes

| Route | Component | Description |
|---|---|---|
| `/master-admin-dashboard` | `MasterAdminDashboard` | User counts, AI usage overview |
| `/master-admin/users` | `UserManagement` | Create, bulk import, change roles |
| `/master-admin/ai-usage` | `AiUsagePage` | AI usage stats + API key management |

---

## 🎯 Feature Walkthrough

### 🎤 Mock AI Interview

```
Dashboard → Go to Interview → Select Domain & Role → Upload Resume (PDF)
    → Question 1 appears → Record Answer (Mic + Camera) → Review → Submit
    → AI evaluates (Confidence, Body Language, Knowledge, Fluency, Skill Relevance)
    → Next Question (10 total) → End Interview → View Full Report
```

**Key features:**
- 🎙️ **Voice/Video Recording** — Uses `MediaRecorder` API with live waveform visualization (Web Audio API `AnalyserNode`)
- 🤖 **AI Question Generation** — First question based on resume + domain; follow-ups adapt to conversation history
- 📋 **ATS Analysis** — Resume scored on ATS criteria; skills found displayed live during interview
- 📊 **Per-Answer Metrics** — 5-dimension radar + score with AI-generated feedback and transcript
- 📄 **PDF Reports** — Download full performance report or ATS-specific summary

**Technical flow:**
```
Frontend                           Backend
   │                                  │
   ├─ POST /api/start (resume PDF) ──►│─ Analyze resume (Groq)
   │◄── ATS score + Q1 ──────────────┤
   │                                  │
   ├─ POST /api/answer_video ────────►│─ Transcribe (Whisper) + Evaluate (Groq)
   │◄── Evaluation + Q2 ─────────────┤
   │        ... (repeat for 10)       │
   │                                  │
   ├─ POST /api/end ─────────────────►│─ Generate report
   │◄── Full report ─────────────────┤
   │                                  │
   ├─ GET /api/report/:id/pdf ───────►│─ Generate PDF
   │◄── PDF download ────────────────┤
```

### 📝 Aptitude Assessments

#### For Students

```
Dashboard → Student Assessments → Browse → Start Assessment
    → Answer MCQs (Timer running) → Navigate questions → Submit
    → View Results (Score, Percentage, Pass/Fail)
```

**Key features:**
- ⏱️ **Live Timer** — Countdown synced with server every 3 seconds; supports admin time extensions
- 🔄 **Question Navigator** — Jump between questions; see answered vs unanswered at a glance
- 🚫 **Tab-Switch Detection** — `visibilitychange` event tracks focus loss; 3 strikes → auto-submit
- 💾 **Answer Persistence** — Answers saved immediately to backend via PUT endpoint
- 📖 **Result Details** — Per-question: correct/incorrect, explanation, shortcuts, topic-wise accuracy bars

#### For Admins

```
Admin Dashboard → Create Assessment → Configure (Title, Concept, Difficulty, Count, Marks)
    → Choose Generation Mode (Fast / AI Enhanced) → Upload Source File (optional)
    → Review & Edit Questions → Publish
```

**Generation modes:**
- ⚡ **Fast mode:** Algorithmic template-based generation — instant, no API cost, 20 concept templates
- 🤖 **AI Enhanced:** Uses configured AI provider (NVIDIA/OpenAI) — more sophisticated questions, supports file context

**Supported concepts:** Percentages, Profit & Loss, Simple Interest, Compound Interest, Time & Work, Time Speed Distance, Averages, Ratio & Proportion, Number System, Probability, Permutation & Combination, Algebra, Geometry, Trigonometry, Mensuration, Data Interpretation, Data Sufficiency, Blood Relations, Direction Sense, Coding Decoding

### 📋 Admin Assessment Management

- **CRUD operations** — Create, list, edit, soft-delete assessments
- **Publishing workflow** — Draft → Edit → Publish (students see only published)
- **Duration extension** — Extend time globally (assessment-level) or per-student (attempt-level)
- **Results monitoring** — Per-assessment results table with student scores, time taken, pass/fail status

### 📊 Reports & Analytics

#### Interview Reports
- 📈 **Radar chart** — 5 performance metrics visualized
- 📊 **Bar chart** — Per-question scores
- 🏆 **Overall grade** — A+, A, B+, B, C+, C, D, F with descriptive labels
- 📋 **ATS analysis** — Score, skills found, improvement areas
- 💪 **Strengths & Weaknesses** — AI-generated lists
- 💡 **Interview Tips** — Personalized advice
- 📄 **PDF download** — Full report + ATS summary

#### Aptitude Analytics (Admin)
- Per-student latest attempt summary
- Expandable to see all attempts with scores, time taken, pass/fail
- Top-level aggregate stats (total students, assessments, pass percentage, average score)

#### Interview Analytics (Admin)
- All interview reports in a sortable table
- Student name, interview role, domain, score, grade, ATS score
- Full report viewer in modal

### 👥 User Management (Master Admin)

- **Individual creation** — Name, email, password, role selector
- **Bulk import** — CSV/Excel upload with column mapping (name, email)
- **Role assignment** — Inline dropdown in user table; supports student/admin/master_admin
- **Role hierarchy:** `master_admin` (top) → `admin` (middle) → `student` (bottom)

### 🤖 AI Usage Dashboard (Master Admin)

- **30-day totals** — Total requests, successful calls, failed calls, tracked tokens
- **By-feature breakdown** — Interviews, transcription, question generation
- **API key management** — View masked keys, update provider keys (Groq, NVIDIA, OpenAI, Gemini, Generic)
- **Hot-reload** — API key updates take effect immediately (backend re-creates clients at runtime)

---

## 🧩 Components

### Shared Components (`components/`)

| Component | Description |
|---|---|
| `Sidebar` | Navigation sidebar (role-filtered) |
| `VoiceRecorder` | Full voice/video recording hook (`useRecorder`) with waveform visualization |

### Portal Components (`src/portal/components/`)

| Component | Description |
|---|---|
| `Sidebar` | Portal navigation sidebar (student/admin) |
| `RoleGuard` | Role-based route guard |
| `LoadingSkeleton` | Animated loading placeholder |
| `StatCard` | Statistics card with color-coded tones |
| `AssessmentCard` | Assessment display card with metadata |
| `Timer` | Countdown timer with expiry callback |
| `ManualGenerationForm` | Admin form for AI assessment generation |
| `QuestionList` | Editable question list |
| `QuestionEditorCard` | Individual question editor |
| `ResultSummary` | Score/percentage/pass summary |

---

## 🔌 API Integration

All API calls are centralized in **`lib/api.js`** with automatic:
- `Authorization: Bearer <token>` header injection
- `X-API-Key` header (if `VITE_API_KEY` is set)
- 401 → auto-logout (clears tokens)
- Error extraction from multiple response formats

### Key API Functions

```js
// Authentication
login(email, password)
signup(name, email, password)

// Interviews
startInterview(domain, role, resumeFile)
submitTextAnswer(sessionId, answer)
submitAnswer(sessionId, audioBlob, videoBlob)
endInterview(sessionId)
getReport(sessionId)
getInterviewReports()
downloadReportPdf(sessionId)
downloadReportAtsPdf(sessionId)

// Student Assessments
getStudentAssessments()
startStudentAssessment(assessmentId)
saveStudentAnswer(attemptId, questionId, selectedOption)
submitStudentAttempt(attemptId)
getStudentResults()
getStudentResult(attemptId)

// Admin
getAdminAssessments()
generateAssessment(data)
updateAssessment(id, data)
deleteAssessment(id)
publishAssessment(id)
extendAssessmentDuration(id, minutes)
getAssessmentResults(id)
extendAttemptTime(attemptId, minutes)

// Master Admin
getUsers()
createUser(data)
importUsers(file)
updateUserRole(id, role)
getApiKeys()
updateApiKey(providerId, key)
```

---

## 📁 Project Structure

```
frontend/
├── index.html                     # HTML shell
├── vite.config.js                 # Vite config + API proxy
├── tailwind.config.js             # Custom Tailwind theme
├── postcss.config.cjs             # PostCSS config
├── .env.local.example             # Environment template
├── package.json
│
├── components/                    # Shared components
│   ├── Sidebar.jsx                # AppShell navigation
│   └── VoiceRecorder.jsx          # Mic/video recording with waveform
│
├── lib/
│   └── api.js                     # Centralized API client
│
└── src/
    ├── main.jsx                   # Entry: BrowserRouter → Toast → Auth → App
    ├── App.jsx                    # Full route tree with guards
    ├── constants.js               # NAV_ITEMS, labels, domains, colors
    ├── globals.css                # Custom animations + component classes
    ├── navigation.jsx             # Router adapter (Link, usePathname)
    │
    ├── portal/                    # Assessment portal (merged from old client)
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Auth state (user, login, logout)
    │   │   └── ToastContext.jsx   # Success/error notifications
    │   ├── utils/
    │   │   └── api.js             # Portal API wrapper
    │   ├── components/
    │   │   ├── Sidebar.jsx        # Portal sidebar
    │   │   ├── RoleGuard.jsx      # Route guard
    │   │   ├── Timer.jsx          # Countdown timer
    │   │   ├── AssessmentCard.jsx # Assessment display
    │   │   ├── StatCard.jsx       # Statistics card
    │   │   ├── QuestionList.jsx   # Editable questions
    │   │   ├── QuestionEditorCard.jsx # Question editor
    │   │   ├── ManualGenerationForm.jsx # AI generation form
    │   │   ├── ResultSummary.jsx  # Score summary
    │   │   └── LoadingSkeleton.jsx # Loading placeholder
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Signup.jsx
    │       ├── ForgotPassword.jsx
    │       ├── ResetPassword.jsx
    │       ├── student/
    │       │   ├── StudentDashboard.jsx
    │       │   ├── StudentAssessments.jsx
    │       │   ├── StartAssessment.jsx
    │       │   ├── StudentResults.jsx
    │       │   └── ResultDetails.jsx
    │       └── admin/
    │           ├── AdminDashboard.jsx
    │           ├── AdminAssessments.jsx
    │           ├── CreateAssessment.jsx
    │           ├── QuestionReview.jsx
    │           └── AssessmentResults.jsx
    │
    └── pages/                     # Legacy + unified pages
        ├── DashboardPage.jsx      # Student dashboard
        ├── InterviewPage.jsx      # Voice interview flow
        ├── AptitudePage.jsx       # Aptitude router page
        ├── ReportPage.jsx         # Interview report viewer
        ├── ReportsResultsPage.jsx # Combined reports/results
        ├── aptitude/              # Legacy aptitude components
        │   ├── StudentAssessments.jsx
        │   ├── StartAssessment.jsx
        │   ├── StudentResults.jsx
        │   ├── ResultDetails.jsx
        │   ├── Timer.jsx
        │   ├── ResultSummary.jsx
        │   └── LoadingSkeleton.jsx
        └── admin/                 # Admin + master admin pages
            ├── PrepupAdminDashboard.jsx
            ├── AdminAptitudeAnalytics.jsx
            ├── AdminInterviewAnalytics.jsx
            ├── AiUsagePage.jsx
            ├── MasterAdminDashboard.jsx
            ├── UserManagement.jsx
            ├── MasterAiUsagePage.jsx
            └── MasterUsersPage.jsx
```

---

## 📜 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server (hot-reload) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |

---

## 🎨 Features at a Glance

| Feature | Student | Admin | Master Admin |
|---|---|---|---|
| **Mock Interviews** | ✅ Take, review, download PDFs | ✅ View analytics | — |
| **Aptitude Tests** | ✅ Take, view results | ✅ Create, manage, view analytics | — |
| **Assessment CRUD** | — | ✅ Create, edit, publish, delete | — |
| **User Management** | — | — | ✅ Create, import, role assignment |
| **AI Usage & API Keys** | — | — | ✅ Monitor, update keys |
| **Role Assignment** | Automatic (by email) | Automatic (by email) | Manual override |
| **Reports & Analytics** | ✅ Personal | ✅ All students | — |
| **PDF Downloads** | ✅ Full + ATS | — | — |
| **Tab-Switch Protection** | ✅ 3 strikes → auto-submit | — | — |
| **Timer Extensions** | — | ✅ Per-assessment & per-student | — |
| **Bulk User Import** | — | — | ✅ CSV/Excel |
| **Question Review/Edit** | — | ✅ Before publishing | — |

---

## 📄 License

This project is licensed under the MIT License.
