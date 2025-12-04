// ============================================
// DATABASE TYPE DEFINITIONS
// ============================================
// This file defines TypeScript types for our entire database schema
// It gives us autocomplete and type checking when working with Supabase

// ============================================
// WHY do we need TypeScript types?
// ============================================
// Without types:
//   const task = await supabase.from('tasks').select('*')
//   console.log(task.titel) // Typo! No error, but undefined at runtime
//
// With types:
//   const task = await supabase.from('tasks').select('*')
//   console.log(task.titel) // TypeScript error: Property 'titel' doesn't exist
//   console.log(task.title) // ✓ Autocomplete suggests 'title'

// ============================================
// MAIN DATABASE TYPE
// ============================================
// This matches the structure we created in Supabase
export type Database = {
  public: {
    Tables: {
      // Each table gets its own type definition
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      tasks: {
        Row: Task;
        Insert: TaskInsert;
        Update: TaskUpdate;
      };
      task_shares: {
        Row: TaskShare;
        Insert: TaskShareInsert;
        Update: TaskShareUpdate;
      };
      comments: {
        Row: Comment;
        Insert: CommentInsert;
        Update: CommentUpdate;
      };
      attachments: {
        Row: Attachment;
        Insert: AttachmentInsert;
        Update: AttachmentUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
    };
  };
};

// ============================================
// UNDERSTANDING THE THREE TYPES PER TABLE:
// ============================================
// 1. Row: What you GET from the database (all fields present)
// 2. Insert: What you SEND when creating (some fields optional/auto-generated)
// 3. Update: What you SEND when updating (all fields optional)

// ============================================
// PROFILE TYPES
// ============================================
export type Profile = {
  id: string; // UUID from auth.users
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string; // ISO timestamp
  updated_at: string;
};

export type ProfileInsert = {
  id: string; // Required: must match auth.users.id
  full_name?: string | null;
  email: string; // Required
  avatar_url?: string | null;
  created_at?: string; // Optional: defaults to NOW()
  updated_at?: string; // Optional: defaults to NOW()
};

export type ProfileUpdate = {
  full_name?: string | null;
  email?: string;
  avatar_url?: string | null;
  updated_at?: string; // Auto-updated by trigger
};

// ============================================
// TASK TYPES
// ============================================
// Enum types for status and priority
export type TaskStatus = "todo" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string; // UUID
  user_id: string; // Owner's UUID
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  category: string | null;
  due_date: string | null; // ISO timestamp
  completed_at: string | null; // ISO timestamp
  created_at: string;
  updated_at: string;
};

export type TaskInsert = {
  id?: string; // Optional: auto-generated if not provided
  user_id: string; // Required: who owns this task
  title: string; // Required
  description?: string | null;
  status?: TaskStatus; // Optional: defaults to 'todo'
  priority?: TaskPriority; // Optional: defaults to 'medium'
  category?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type TaskUpdate = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  updated_at?: string;
};

// ============================================
// TASK SHARE TYPES
// ============================================
export type TaskSharePermission = "view" | "edit";

export type TaskShare = {
  id: string;
  task_id: string;
  shared_with_user_id: string;
  shared_by_user_id: string;
  permission: TaskSharePermission;
  created_at: string;
};

export type TaskShareInsert = {
  id?: string;
  task_id: string; // Required
  shared_with_user_id: string; // Required
  shared_by_user_id: string; // Required
  permission?: TaskSharePermission; // Optional: defaults to 'view'
  created_at?: string;
};

export type TaskShareUpdate = {
  permission?: TaskSharePermission;
};

// ============================================
// COMMENT TYPES
// ============================================
export type Comment = {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type CommentInsert = {
  id?: string;
  task_id: string; // Required
  user_id: string; // Required
  content: string; // Required
  created_at?: string;
  updated_at?: string;
};

export type CommentUpdate = {
  content?: string;
  updated_at?: string;
};

// ============================================
// ATTACHMENT TYPES
// ============================================
export type Attachment = {
  id: string;
  task_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
};

export type AttachmentInsert = {
  id?: string;
  task_id: string; // Required
  user_id: string; // Required
  file_name: string; // Required
  file_path: string; // Required
  file_size?: number | null;
  file_type?: string | null;
  created_at?: string;
};

export type AttachmentUpdate = {
  file_name?: string;
};

// ============================================
// NOTIFICATION TYPES
// ============================================
export type NotificationType =
  | "task_shared"
  | "comment_added"
  | "task_due_soon"
  | "task_assigned";

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  task_id: string | null;
  read: boolean;
  created_at: string;
  read_at: string | null;
};

export type NotificationInsert = {
  id?: string;
  user_id: string; // Required
  type: NotificationType; // Required
  title: string; // Required
  message: string; // Required
  task_id?: string | null;
  read?: boolean; // Optional: defaults to false
  created_at?: string;
  read_at?: string | null;
};

export type NotificationUpdate = {
  read?: boolean;
  read_at?: string | null;
};

// ============================================
// HELPER TYPES FOR JOINS
// ============================================
// When we fetch data with joins, we get nested objects
// These types help us work with that data

// Task with owner profile
export type TaskWithOwner = Task & {
  owner: Profile;
};

// Task with all related data
export type TaskWithRelations = Task & {
  owner: Profile;
  shares: (TaskShare & { shared_with: Profile })[];
  comments: (Comment & { user: Profile })[];
  attachments: Attachment[];
};

// Comment with user profile
export type CommentWithUser = Comment & {
  user: Profile;
};

// Notification with task (if applicable)
export type NotificationWithTask = Notification & {
  task: Task | null;
};

// ============================================
// KEY CONCEPTS TO UNDERSTAND:
// ============================================
//
// 1. TYPE vs INTERFACE:
//    - We use 'type' instead of 'interface'
//    - Both work, but 'type' is more flexible
//    - Can represent unions: 'todo' | 'in_progress' | 'completed'
//
// 2. NULL vs UNDEFINED:
//    - null: Value is explicitly empty (in database)
//    - undefined: Field is not provided (in TypeScript)
//    - string | null: Can be a string OR null
//    - string?: Optional field (can be undefined)
//
// 3. UUID:
//    - Represented as string in TypeScript
//    - Actually a special format: "123e4567-e89b-12d3-a456-426614174000"
//    - Generated by PostgreSQL's gen_random_uuid()
//
// 4. TIMESTAMPS:
//    - Stored as TIMESTAMPTZ in PostgreSQL (timezone-aware)
//    - Returned as ISO 8601 strings: "2024-01-15T10:30:00Z"
//    - We'll use date-fns library to format these nicely
//
// 5. ENUMS:
//    - TaskStatus = 'todo' | 'in_progress' | 'completed'
//    - This is a TypeScript union type
//    - Only these exact strings are allowed
//    - Matches the CHECK constraint in our database
//
// ============================================
// HOW TO USE THESE TYPES:
// ============================================
//
// Example 1: Creating a task
//   const newTask: TaskInsert = {
//     user_id: userId,
//     title: 'My new task',
//     priority: 'high' // TypeScript ensures this is valid!
//   }
//
// Example 2: Updating a task
//   const updates: TaskUpdate = {
//     status: 'completed',
//     completed_at: new Date().toISOString()
//   }
//
// Example 3: Type-safe database query
//   const { data } = await supabase
//     .from('tasks')
//     .select('*')
//     .single()
//   // data is automatically typed as Task!






