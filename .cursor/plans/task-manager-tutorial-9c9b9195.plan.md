<!-- 9c9b9195-56e0-4026-a6cc-47523c0858a8 4482cb5d-3556-4774-839e-c1f63cea6cae -->
# Full-Stack Task Manager Learning Project

## Phase 1: Foundation & Setup

**What you'll learn:** Project structure, environment variables, Supabase setup, TypeScript types

1. **Install dependencies** - Add Supabase client library and other necessary packages

- `@supabase/supabase-js` for database and auth
- `@supabase/ssr` for Next.js server-side integration
- Additional UI libraries for better user experience

2. **Create Supabase project** - Set up your database in the cloud

- Guide you to create a free Supabase account
- Configure environment variables (`.env.local`)
- Explain what environment variables are and why they're important

3. **Database schema design** - Learn database relationships and structure

- Create `profiles` table (user information)
- Create `tasks` table (main task data)
- Create `task_shares` table (for sharing tasks between users)
- Create `comments` table (task comments) 
- Create `attachments` table (file uploads)
- Explain foreign keys, relationships, and database normalization

4. **Supabase utilities setup** - Learn server/client separation in Next.js

- Create `lib/supabase/client.ts` (for client-side operations)
- Create `lib/supabase/server.ts` (for server-side operations)
- Explain the difference and when to use each

## Phase 2: Authentication System

**What you'll learn:** User authentication, protected routes, session management

5. **Auth UI components** - Build login and signup forms

- Create `components/auth/LoginForm.tsx`
- Create `components/auth/SignupForm.tsx`
- Explain React component structure, props, and state
- Learn form handling and validation

6. **Auth pages** - Create authentication routes

- Create `app/login/page.tsx`
- Create `app/signup/page.tsx`
- Explain Next.js App Router and file-based routing

7. **Auth middleware** - Protect routes that require authentication

- Create `middleware.ts` to check authentication status
- Explain middleware concept and how it protects pages
- Redirect unauthenticated users to login

8. **User profile creation** - Automatically create profile on signup

- Set up Supabase database trigger
- Explain database triggers and automation

## Phase 3: Core Task Management (CRUD)

**What you'll learn:** CRUD operations, API routes, data fetching, React hooks

9. **TypeScript types** - Define data structures

- Create `types/database.ts` with all type definitions
- Explain TypeScript benefits and type safety

10. **API routes for tasks** - Build backend endpoints

- Create `app/api/tasks/route.ts` (GET all, POST new)
- Create `app/api/tasks/[id]/route.ts` (GET one, PATCH update, DELETE)
- Explain REST API principles and HTTP methods
- Learn about Next.js API routes and server actions

11. **Task list component** - Display all tasks

- Create `components/tasks/TaskList.tsx`
- Learn data fetching with `useEffect` and `useState`
- Explain React hooks in detail

12. **Task item component** - Individual task display

- Create `components/tasks/TaskItem.tsx`
- Learn component composition and props passing
- Implement task status toggle, edit, and delete actions

13. **Task form component** - Create and edit tasks

- Create `components/tasks/TaskForm.tsx`
- Learn controlled components and form state management
- Implement validation and error handling

14. **Main dashboard page** - Bring it all together

- Update `app/page.tsx` to show task dashboard
- Implement authentication check
- Learn about layout and component organization

## Phase 4: Advanced Features - Categories & Priorities

**What you'll learn:** Enums, filtering, sorting, advanced UI patterns

15. **Categories and priorities** - Add task organization

- Update database schema with categories and priority fields
- Create filter and sort UI components
- Explain enum types and dropdown selections

16. **Due dates and status** - Add time management

- Implement date picker component
- Add status workflow (todo → in progress → completed)
- Learn date handling in JavaScript/TypeScript

## Phase 5: Task Sharing

**What you'll learn:** Many-to-many relationships, permissions, collaborative features

17. **Sharing API routes** - Backend for sharing

- Create `app/api/tasks/[id]/share/route.ts`
- Implement permission checks (only owner can share)
- Explain authorization vs authentication

18. **Share modal component** - UI for sharing tasks

- Create `components/tasks/ShareModal.tsx`
- Search for users by email
- Display list of people task is shared with
- Learn modal patterns and user search

19. **Shared tasks view** - Show tasks shared with you

- Update task list to include shared tasks
- Add visual indicators for shared vs owned tasks
- Implement permission-based actions (can't delete shared tasks)

## Phase 6: Comments System

**What you'll learn:** Real-time updates, nested data, optimistic UI

20. **Comments API routes** - Backend for comments

- Create `app/api/tasks/[id]/comments/route.ts`
- Implement GET (fetch) and POST (create) endpoints
- Learn about nested resources in REST APIs

21. **Comments component** - Display and add comments

- Create `components/tasks/Comments.tsx`
- Show comment list with author and timestamp
- Add comment form
- Learn about optimistic UI updates

22. **Real-time comments** - Live updates with Supabase

- Implement Supabase real-time subscriptions
- Update UI when new comments arrive
- Explain WebSockets and real-time communication

## Phase 7: File Attachments

**What you'll learn:** File uploads, cloud storage, binary data handling

23. **Supabase Storage setup** - Configure file storage

- Create storage bucket in Supabase
- Set up storage policies for security
- Explain cloud storage concepts

24. **File upload API** - Handle file uploads

- Create `app/api/tasks/[id]/attachments/route.ts`
- Implement file upload to Supabase Storage
- Store attachment metadata in database
- Learn about multipart form data and file handling

25. **Attachment component** - UI for file management

- Create `components/tasks/Attachments.tsx`
- Display list of attachments with download links
- Add file upload button with drag-and-drop
- Show upload progress
- Learn about File API and drag-and-drop

## Phase 8: Notifications System

**What you'll learn:** Background jobs, email notifications, in-app notifications

26. **Notifications table** - Store notifications

- Add `notifications` table to database
- Create API routes for fetching and marking as read
- Explain notification patterns

27. **Notification triggers** - Auto-create notifications

- When task is shared with you
- When someone comments on your task
- When task due date is approaching
- Use Supabase database functions

28. **Notification UI** - Display notifications

- Create `components/notifications/NotificationBell.tsx`
- Show unread count badge
- Display notification dropdown
- Mark as read functionality
- Learn about notification UX patterns

29. **Email notifications (optional)** - Send emails

- Set up Supabase email templates
- Configure email notifications for important events
- Explain transactional emails

## Phase 9: Polish & User Experience

**What you'll learn:** Loading states, error handling, responsive design, accessibility

30. **Loading states** - Better user feedback

- Add skeleton loaders for data fetching
- Implement loading spinners for actions
- Learn about perceived performance

31. **Error handling** - Graceful failure

- Add error boundaries
- Display user-friendly error messages
- Implement retry mechanisms
- Learn error handling best practices

32. **Responsive design** - Mobile-friendly UI

- Ensure all components work on mobile
- Add mobile navigation
- Test on different screen sizes
- Learn responsive design principles

33. **Accessibility** - Make it usable for everyone

- Add proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Learn WCAG guidelines basics

## Phase 10: Deployment & Best Practices

**What you'll learn:** Production deployment, environment management, security

34. **Environment configuration** - Prepare for production

- Set up production environment variables
- Configure Supabase production settings
- Learn about development vs production

35. **Deploy to Vercel** - Make it live

- Connect GitHub repository
- Configure Vercel project
- Set environment variables in Vercel
- Deploy and test production site

36. **Security review** - Ensure app is secure

- Review Row Level Security (RLS) policies in Supabase
- Check authentication flows
- Validate input sanitization
- Learn security best practices

## Key Files We'll Create

- `lib/supabase/client.ts` - Client-side Supabase utilities
- `lib/supabase/server.ts` - Server-side Supabase utilities
- `types/database.ts` - TypeScript type definitions
- `middleware.ts` - Authentication middleware
- `components/auth/*` - Authentication components
- `components/tasks/*` - Task management components
- `components/notifications/*` - Notification components
- `app/api/tasks/**/*` - Task API routes
- `app/api/notifications/*` - Notification API routes
- `app/(auth)/*` - Authentication pages
- `app/(dashboard)/*` - Main application pages

## Learning Approach

This is designed for someone with basic React knowledge who wants to learn professional full-stack development. At each step, I will:

1. **Explain the WHY** - Why does this concept exist? What problem does it solve?
2. **Explain the HOW** - How does it work under the hood?
3. **Show the code** - Detailed comments explaining each line
4. **Provide research topics** - Key terms and concepts for you to look up and deepen your understanding
5. **Point out best practices** - Industry standards and common pitfalls to avoid
6. **Wait for your confirmation** - You can ask questions, research the topics, and tell me when you're ready to continue

### Example Learning Flow:

**Step: Install Supabase**

- WHY: We need a backend database and authentication system. Supabase provides both without building a custom server
- HOW: Supabase is a "Backend as a Service" (BaaS) that gives you a PostgreSQL database, authentication, storage, and real-time subscriptions through a simple JavaScript client
- RESEARCH TOPICS: "What is PostgreSQL?", "What is Backend as a Service?", "Client-server architecture"
- CODE: Install commands with explanation of each package
- YOUR TURN: Research the topics, try the installation, ask questions

This way, you're not just copying code - you're understanding the fundamentals that will make you a strong developer. Take your time at each step to research and experiment!

This is a professional-level application that will teach you real-world development practices used in production applications.

### To-dos

- [ ] Install Supabase and required dependencies
- [ ] Create Supabase project and configure environment variables
- [ ] Design and create database tables with relationships
- [ ] Set up Supabase client and server utilities
- [ ] Build login and signup form components
- [ ] Create authentication pages and routes
- [ ] Implement middleware for route protection
- [ ] Set up database trigger for automatic profile creation
- [ ] Define TypeScript types for all database tables
- [ ] Create API routes for CRUD operations on tasks
- [ ] Build TaskList, TaskItem, and TaskForm components
- [ ] Create main dashboard page with task management
- [ ] Add categories, priorities, due dates, and status
- [ ] Implement task sharing API with permissions
- [ ] Build share modal and shared tasks view
- [ ] Create comments API routes
- [ ] Build comments component with real-time updates
- [ ] Configure Supabase Storage for file uploads
- [ ] Implement file upload API and attachment management
- [ ] Build attachment component with drag-and-drop upload
- [ ] Create notifications table and API routes
- [ ] Set up automatic notification creation for events
- [ ] Build notification bell and dropdown component
- [ ] Add loading skeletons and spinners throughout app
- [ ] Implement error boundaries and user-friendly error messages
- [ ] Ensure mobile responsiveness across all components
- [ ] Add ARIA labels and keyboard navigation support
- [ ] Deploy application to Vercel with production config
- [ ] Review and implement RLS policies and security measures