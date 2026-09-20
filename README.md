# Impact Water OS

A Phase 1 internal operating system for Impact Water's e-commerce & growth work.

## Phase 1 included
- Supabase email/password authentication
- Dashboard with due today, overdue, waiting, open task and active project counts
- Projects and automatic task-based progress
- Tasks with status, priority, due date, project, description and CRUD
- Notes with search/pin/delete
- Search and status filtering on tasks
- Task activity history in the database
- Responsive desktop/tablet/mobile layout

Phase 2–5 modules from the product brief are intentionally not represented as fake integrations or placeholder functionality.

## Stack
Next.js + TypeScript + Tailwind CSS + Supabase + PostgreSQL.

## Local setup
1. Create a Supabase project.
2. Open Supabase SQL Editor and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local`.
4. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Run `npm install` then `npm run dev`.
6. Open the local URL printed by Next.js.

## Deployment
Recommended: Vercel for the Next.js app and Supabase for database/auth. Configure the same two public environment variables in Vercel. Do not add service-role keys to the browser app.

## Security note
The current V1 policy intentionally treats this as a single authenticated workspace. Before adding multiple employees with different access levels, replace the broad authenticated policies with workspace/role-based RLS policies.
