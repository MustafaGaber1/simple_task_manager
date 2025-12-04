-- ============================================
-- TASK MANAGER DATABASE SCHEMA
-- ============================================
-- This file contains all the SQL code to create our database tables
-- You'll run this in the Supabase SQL Editor

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Stores additional user information beyond what Supabase Auth provides
-- Why separate from auth.users? Because auth.users is managed by Supabase
-- and we want our own customizable user data

CREATE TABLE profiles (
  -- Primary key: unique identifier for each profile
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- References auth.users(id) means this links to Supabase's built-in user table
  -- ON DELETE CASCADE means if a user is deleted, their profile is too
  
  -- User's display name
  full_name TEXT,
  
  -- User's email (copied from auth for easy access)
  email TEXT UNIQUE NOT NULL,
  
  -- URL to user's avatar image (stored in Supabase Storage later)
  avatar_url TEXT,
  
  -- Timestamps: when was this profile created and last updated?
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. TASKS TABLE
-- ============================================
-- The main table storing all task information

CREATE TABLE tasks (
  -- Primary key: unique ID for each task (auto-generated UUID)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key: who owns this task?
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  -- ON DELETE CASCADE: if user is deleted, their tasks are deleted too
  
  -- Task details
  title TEXT NOT NULL, -- Task title (required)
  description TEXT, -- Longer description (optional)
  
  -- Task organization
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
  -- CHECK constraint: status can ONLY be one of these three values
  
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  -- Priority levels for task importance
  
  category TEXT, -- Custom category (e.g., "Work", "Personal", "Shopping")
  
  -- Time management
  due_date TIMESTAMPTZ, -- When is this task due? (optional)
  completed_at TIMESTAMPTZ, -- When was it completed? (null if not completed)
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an index on user_id for faster queries
-- Why? We'll frequently query "get all tasks for user X"
CREATE INDEX tasks_user_id_idx ON tasks(user_id);

-- Create an index on status for filtering
CREATE INDEX tasks_status_idx ON tasks(status);

-- ============================================
-- 3. TASK_SHARES TABLE (Many-to-Many Junction)
-- ============================================
-- Allows multiple users to access the same task
-- This is a "junction table" that connects tasks and users

CREATE TABLE task_shares (
  -- Composite primary key: combination of task_id and shared_with_user_id must be unique
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Which task is being shared?
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  
  -- Who is it shared with?
  shared_with_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Who shared it? (the task owner)
  shared_by_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- What permission level? (for future: 'view', 'edit', 'admin')
  permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
  
  -- When was it shared?
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure a task can't be shared with the same user twice
  UNIQUE(task_id, shared_with_user_id)
);

-- Indexes for faster lookups
CREATE INDEX task_shares_task_id_idx ON task_shares(task_id);
CREATE INDEX task_shares_shared_with_user_id_idx ON task_shares(shared_with_user_id);

-- ============================================
-- 4. COMMENTS TABLE
-- ============================================
-- Users can comment on tasks (their own or shared tasks)

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Which task is this comment on?
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  
  -- Who wrote this comment?
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- The comment text
  content TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching all comments for a task
CREATE INDEX comments_task_id_idx ON comments(task_id);

-- ============================================
-- 5. ATTACHMENTS TABLE
-- ============================================
-- Files attached to tasks (stored in Supabase Storage)

CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Which task is this attached to?
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  
  -- Who uploaded it?
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- File information
  file_name TEXT NOT NULL, -- Original filename (e.g., "report.pdf")
  file_path TEXT NOT NULL, -- Path in Supabase Storage (e.g., "tasks/abc123/report.pdf")
  file_size INTEGER, -- Size in bytes
  file_type TEXT, -- MIME type (e.g., "application/pdf", "image/png")
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching all attachments for a task
CREATE INDEX attachments_task_id_idx ON attachments(task_id);

-- ============================================
-- 6. NOTIFICATIONS TABLE
-- ============================================
-- In-app notifications for users

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who receives this notification?
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Notification details
  type TEXT NOT NULL, -- e.g., 'task_shared', 'comment_added', 'task_due_soon'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Link to related resource (optional)
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  
  -- Has the user read this notification?
  read BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Indexes for efficient queries
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_read_idx ON notifications(read);

-- ============================================
-- 7. AUTOMATIC UPDATED_AT TRIGGER
-- ============================================
-- This function automatically updates the updated_at timestamp
-- whenever a row is modified

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply this trigger to tables with updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================
-- When a user signs up via Supabase Auth, automatically create their profile

CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: run this function when a new user is created in auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- RLS ensures users can only access their own data or data shared with them

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can view all profiles (for sharing features)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- TASKS POLICIES
-- Users can view their own tasks and tasks shared with them
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    id IN (
      SELECT task_id FROM task_shares 
      WHERE shared_with_user_id = auth.uid()
    )
  );

-- Users can create their own tasks
CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tasks
CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own tasks
CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);

-- TASK_SHARES POLICIES
-- Users can view shares for their tasks or tasks shared with them
CREATE POLICY "Users can view relevant task shares"
  ON task_shares FOR SELECT
  USING (
    shared_by_user_id = auth.uid() 
    OR 
    shared_with_user_id = auth.uid()
  );

-- Only task owners can create shares
CREATE POLICY "Task owners can share tasks"
  ON task_shares FOR INSERT
  WITH CHECK (
    shared_by_user_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = task_id 
      AND tasks.user_id = auth.uid()
    )
  );

-- Only task owners can delete shares
CREATE POLICY "Task owners can delete shares"
  ON task_shares FOR DELETE
  USING (
    shared_by_user_id = auth.uid()
  );

-- COMMENTS POLICIES
-- Users can view comments on tasks they have access to
CREATE POLICY "Users can view comments on accessible tasks"
  ON comments FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM tasks 
      WHERE user_id = auth.uid()
      OR id IN (
        SELECT task_id FROM task_shares 
        WHERE shared_with_user_id = auth.uid()
      )
    )
  );

-- Users can create comments on tasks they have access to
CREATE POLICY "Users can comment on accessible tasks"
  ON comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND
    task_id IN (
      SELECT id FROM tasks 
      WHERE user_id = auth.uid()
      OR id IN (
        SELECT task_id FROM task_shares 
        WHERE shared_with_user_id = auth.uid()
      )
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- ATTACHMENTS POLICIES
-- Users can view attachments on tasks they have access to
CREATE POLICY "Users can view attachments on accessible tasks"
  ON attachments FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM tasks 
      WHERE user_id = auth.uid()
      OR id IN (
        SELECT task_id FROM task_shares 
        WHERE shared_with_user_id = auth.uid()
      )
    )
  );

-- Users can upload attachments to tasks they have access to
CREATE POLICY "Users can upload attachments to accessible tasks"
  ON attachments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND
    task_id IN (
      SELECT id FROM tasks 
      WHERE user_id = auth.uid()
      OR id IN (
        SELECT task_id FROM task_shares 
        WHERE shared_with_user_id = auth.uid()
      )
    )
  );

-- Users can delete their own attachments
CREATE POLICY "Users can delete own attachments"
  ON attachments FOR DELETE
  USING (auth.uid() = user_id);

-- NOTIFICATIONS POLICIES
-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can create notifications (we'll handle this via service role key)
CREATE POLICY "Service can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- ============================================
-- SCHEMA CREATION COMPLETE!
-- ============================================
-- Next step: Copy this entire file and run it in Supabase SQL Editor









