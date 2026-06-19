# 🧠 SupportMind — AI-Powered Customer Feedback Portal

SupportMind is a full-stack, enterprise-grade feedback management system. It enables customers to submit bugs, feature requests, and complaints, while automatically triaging those requests using **Google Gemini AI** to detect sentiment, categorize topics, prioritize issues, and write concise summaries for administrators.

---

## 🛠️ Technology Stack

![Next.js 16](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=nextdotjs)
![React 19](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)
![SQLite](https://img.shields.io/badge/SQLite-Database-blueviolet?style=for-the-badge&logo=sqlite)
![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=for-the-badge&logo=prisma)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-API-4285F4?style=for-the-badge&logo=googlegemini)
![NextAuth](https://img.shields.io/badge/NextAuth.js-v5-green?style=for-the-badge)

*   **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Shadcn UI base tokens.
*   **Backend**: Next.js 16 Server Actions (secure database operations and API communication).
*   **Database**: SQLite via Prisma ORM (serverless, zero local service configuration required).
*   **AI Engine**: Google Gemini API and Claude Opus 4.6(`gemini-1.5-flash` model for structured JSON categorization, sentiment, and summary, with local rule-based fallback).
*   **Authentication & Guarding**: NextAuth.js (v5 Beta) session propagation with Next.js 16 Proxy named exports routing protection.

---

## 🚀 Key Features

### 👤 Customer Experience
*   **Minimalist Feedback Form**: Submits feedback with automatic loading transitions.
*   **Submission History Feed**: Shows previous submissions, sentiment emojis, category badges, AI-generated summaries, and ticket resolution statuses.

### 🔑 Administrator Experience
*   **Control Room Dashboard**: Key indicators mapping total count, active bugs, high priority tickets, and negative sentiment files.
*   **Premium Custom Charts**: Clean animated category bar meters and stacked sentiment distribution gauges.
*   **Interactive Database Table**: Provides real-time sorting (by date and priority weight), multi-select filters, and search query execution.
*   **Status Drawer**: Dialog modal to read full text, view AI summary, and transition ticket status with server-side paths revalidation.

### 🤖 Gemini AI Triaging & Fallback
*   **Online Triage**: Instructs Gemini to return a clean, schema-valid JSON containing category, priority, sentiment, and a concise 12-word summary.
*   **Local Rule-based Fallback**: If no `GEMINI_API_KEY` is present, a smart keyword-based analysis engine runs automatically to tag priority, sentiment, and categories locally.

---

## 📁 Folder Structure

```text
support_Mind/
├── docs/                   # Planning, roadmap, progress, and engineering docs
├── prisma/
│   ├── schema.prisma       # SQLite data modeling (User, Session, Account, Feedback)
│   └── dev.db              # Local SQLite file database (ignored by git)
├── public/                 # Static vector assets and icons
├── src/
│   ├── actions/
│   │   ├── auth.ts         # User login, registration, and logout server actions
│   │   └── feedback.ts     # Feedback submission and status update server actions
│   ├── app/
│   │   ├── (auth)/         # Next.js route group for authentication pages
│   │   │   ├── login/      # Sign-in page (with home redirect links)
│   │   │   └── register/   # Signup page (with administrator toggle checkbox)
│   │   ├── admin/          # Admin Dashboard layout, stats, and charts
│   │   ├── api/auth/       # NextAuth API catch-all route handler
│   │   ├── dashboard/      # Customer portal layout and list feed
│   │   ├── globals.css     # Tailwind imports, theme declarations, and fonts
│   │   ├── layout.tsx      # Root html layout and structure
│   │   └── page.tsx        # Home/marketing landing page with server-side redirects
│   ├── components/
│   │   ├── ui/             # Shadcn base UI components (Button, Input, Card, Label)
│   │   ├── FeedbackForm.tsx # Client component for customer submission
│   │   ├── LogoutButton.tsx # Client component for NextAuth logout redirects
│   │   └── AdminFeedbackTable.tsx # Search, sort, filters, and detail drawer
│   ├── lib/
│   │   ├── prisma.ts       # Singleton database client instance
│   │   └── utils.ts        # Helper scripts
│   ├── services/
│   │   └── gemini.ts       # Gemini API client wrapper and keyword fallback analyzer
│   ├── types/
│   │   ├── feedback.ts     # Zod validation schemas
│   │   └── next-auth.d.ts  # Typescript definition extensions for user roles
│   ├── auth.config.ts      # NextAuth options callbacks and route guard options
│   ├── auth.ts             # NextAuth core providers config (Credentials authorize)
│   ├── proxy.ts            # Next.js 16 Proxy named export interceptor
│   └── tsconfig.json       # Compiler configurations
├── .env                    # Environment variables (Database URL, keys)
├── package.json            # Scripts and package dependency tracking
└── README.md               # Project documentation and guide
```

---

## 🏁 Local Setup Instructions

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Sandilyamishraabhishek/Support_Mind.git
    cd Support_Mind
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Create a `.env` file in the root folder with the following contents:
    ```env
    DATABASE_URL="file:./dev.db"
    NEXTAUTH_SECRET="my-super-secret-nextauth-key-change-me"
    NEXTAUTH_URL="http://localhost:3000"
    GEMINI_API_KEY="" # Add your Google Gemini API key (optional; defaults to local fallback if empty)
    ```

4.  **Synchronize local Database**:
    Initialize tables and create the SQLite database file:
    ```bash
    npx prisma db push
    ```

5.  **Run Development Server**:
    Start the local server:
    ```bash
    npm run dev
    ```
    Access the application in your browser at: **[http://localhost:3000](http://localhost:3000)**
