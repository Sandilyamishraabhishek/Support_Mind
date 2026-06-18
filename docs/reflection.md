# Project Reflection

This document contains post-project reflections on the architecture, technical decisions, and AI-assisted workflow.

## 1. Architectural Decisions
- **Why Next.js Server Actions over API Routes?**
  Server Actions were chosen to colocate data mutations with components, reducing boilerplate fetch code and leveraging React 19's `useActionState` for seamless loading and error states.
- **Why Prisma?**
  Prisma provides unbeatable type safety from the database to the frontend, which is critical when dealing with complex AI-generated JSON payloads.

## 2. AI Workflow Efficacy
The Vibe Coding Assessment emphasizes the use of AI to accelerate development.
- **Strengths**: Writing tedious UI boilerplate (Tailwind), generating complex Zod validation schemas, and creating initial seed data.
- **Weaknesses**: Ensuring the AI model output from the Gemini API strictly adhered to the TypeScript interfaces occasionally required careful prompt tuning and regex sanitization.

## 3. Future Improvements
If given more time, the following features would be added:
- **Websockets / SSE**: For real-time updates on the Admin Dashboard when new feedback arrives.
- **Customer Notifications**: Emailing customers (via Resend) when their feedback status changes to "Resolved".
- **Advanced AI**: Using embeddings to detect duplicate feedback and group them automatically.
