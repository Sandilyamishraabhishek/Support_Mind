# AI Journal

This document tracks the usage of AI-assisted development tools (like Gemini/Copilot), prompts used, code generated, limitations encountered, and lessons learned during the Vibe Coding Assessment.

## Entry 1: Database Schema Generation
**Date**: 2023-10-24
- **Prompt Used**: "Generate a Prisma schema for an AI Customer Feedback Portal. I need a User model with role-based access and a Feedback model that includes fields for title, description, category, AI priority, AI sentiment, AI summary, and status. Use Enums where appropriate."
- **AI Generated Code**: Provided a complete schema with correct relations.
- **Manual Fixes**: Adjusted the `id` generation to use `@default(cuid())` instead of `uuid()` for better URL-friendly IDs.
- **Lessons Learned**: Specifying exact Enum values in the prompt yields a production-ready schema faster.

## Entry 2: Gemini API Integration
**Date**: 2023-10-25
- **Prompt Used**: "Write a Next.js Server Action that takes a feedback string and calls the Gemini API to analyze it. It must return a strict JSON object with category, priority, sentiment, and summary."
- **AI Generated Code**: Generated a functional fetch call to the Google Generative AI SDK, including the system prompt to enforce JSON structure.
- **AI Limitations**: The AI occasionally included markdown formatting (e.g., ````json`) in the response string.
- **Manual Fixes**: Added a regex cleaning step (`.replace(/```json/g, '')`) before calling `JSON.parse()` to prevent parsing errors.
- **Lessons Learned**: When relying on LLMs for structured data, always enforce strict parsing and have fallback error handling for malformed JSON.

## Entry 3: Admin Dashboard UI Layout
**Date**: 2023-10-26
- **Prompt Used**: "Create a responsive sidebar navigation layout for an admin dashboard using Tailwind CSS and Shadcn UI components. It should look like the Vercel dashboard."
- **AI Generated Code**: Provided a clean flexbox layout with a collapsible sidebar and a main content area.
- **Manual Fixes**: Adjusted padding and border colors to match the exact Zinc-900 hex codes for the desired "Linear" aesthetic.
- **Lessons Learned**: AI is excellent at scaffolding complex CSS Grid/Flexbox layouts, saving hours of boilerplate setup.
